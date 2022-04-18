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

    event TokenSwap(
        bytes32 indexed payloadHash,
        string indexed symbol,
        uint256 indexed amount
    );

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

        // Approve token to router before swap
        _approveIfNeeded(tokenAddress, address(router), amount);

        bool isRecipientChain = keccak256(bytes(chain)) ==
            keccak256(bytes(recipientChain));

        // Swap and store returned amount
        uint256[] memory outputAmounts = router.swapExactTokensForTokens(
            amount,
            0,
            swapPath,
            isRecipientChain ? recipientAddress : address(this),
            block.timestamp
        );

        // If the recipient chain is not this chain, then send it cross-chain one more time through the axelar gateway.
        if (!isRecipientChain) {
            string memory symbol = IERC20(swapPath[swapPath.length - 1])
                .symbol();
            uint256 outputAmount = outputAmounts[outputAmounts.length - 1];
            address outputTokenAddress = gateway.tokenAddresses(symbol);
            address[] memory recipients = new address[](1);
            recipients[0] = recipientAddress;
            _approveIfNeeded(
                outputTokenAddress,
                address(gateway),
                outputAmount
            );
            gateway.callContractWithToken(
                recipientChain,
                recipientContractAddress,
                abi.encode(recipients),
                symbol,
                outputAmount
            );
        }
        emit TokenSwap(keccak256(payload), tokenSymbol, amount);
    }

    function _approveIfNeeded(
        address tokenAddress,
        address spender,
        uint256 requiredAmount
    ) private {
        bool insufficientAllowance = IERC20(tokenAddress).allowance(
            address(this),
            spender
        ) < requiredAmount;

        if (insufficientAllowance) {
            (bool approveSuccessful, ) = address(tokenAddress).call(
                abi.encodeWithSignature(
                    "approve(address,uint256)",
                    spender,
                    type(uint256).max
                )
            );
            require(approveSuccessful, "Fail to approve");
        }
    }
}
