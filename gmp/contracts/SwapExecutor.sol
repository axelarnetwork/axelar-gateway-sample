//SPDX-License-Identifier: MIT
pragma solidity 0.8.9;

import "./IAxelarExecutable.sol";
import "./IUniswapRouter.sol";
import "./IERC20.sol";

contract SwapExecutor is IAxelarExecutable {
    IUniswapRouter router;
    string chain;

    constructor(
        address gatewayAddress,
        address routerAddress,
        string memory _chain
    ) IAxelarExecutable(gatewayAddress) {
        router = IUniswapRouter(routerAddress);
        chain = _chain;
    }

    function _executeWithToken(
        string memory,
        string memory,
        bytes calldata payload,
        string memory tokenSymbol,
        uint256 amount
    ) internal override {
        (
            address[] memory swapPath,
            string memory recipientChain,
            address recipientAddress,
            string memory recipientContractAddress
        ) = abi.decode(payload, (address[], string, address, string));

        address tokenAddress = gateway.tokenAddresses(tokenSymbol);

        bool insufficientAllowance = IERC20(tokenAddress).allowance(
            address(this),
            address(router)
        ) < amount;

        if (insufficientAllowance) {
            (bool approveSuccessful, ) = address(tokenAddress).call(
                abi.encodeWithSignature(
                    "approve(address,uint256)",
                    address(router),
                    type(uint256).max
                )
            );
            require(approveSuccessful, "Fail to approve");
        }
        bool isRecipientChain = keccak256(bytes(chain)) ==
            keccak256(bytes(recipientChain));

        uint256[] memory outputAmounts = router.swapExactTokensForTokens(
            amount,
            0,
            swapPath,
            isRecipientChain ? recipientAddress : address(this),
            block.timestamp
        );

        if (!isRecipientChain) {
            string memory symbol = IERC20(swapPath[swapPath.length - 1])
                .symbol();
            gateway.callContractWithToken(
                recipientChain,
                recipientContractAddress,
                abi.encode([recipientAddress]),
                symbol,
                outputAmounts[outputAmounts.length - 1]
            );
        }
    }
}
