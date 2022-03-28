// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;

import {IAxelarExecutable} from "./IAxelarExecutable.sol";
import {IAxelarGateway} from "./IAxelarGateway.sol";
import {IERC20} from "./IERC20.sol";

contract BatchMessageSender {
    IAxelarGateway gateway;
    mapping(address => bool) tokenApprovals;

    constructor(address _gateway) {
        gateway = IAxelarGateway(_gateway);
    }

    function batchCallContract(bytes[] memory payloads) external {
        for (uint256 i = 0; i < payloads.length; i++) {
            (
                string memory destinationChain,
                string memory contractAddress,
                bytes memory payload
            ) = abi.decode(payloads[i], (string, string, bytes));
            gateway.callContract(destinationChain, contractAddress, payload);
        }
    }

    function batchCallContractWithToken(bytes[] memory payloads) external {
        for (uint256 i = 0; i < payloads.length; i++) {
            (
                string memory destinationChain,
                string memory contractAddress,
                bytes memory payload,
                string memory symbol,
                uint256 amount
            ) = abi.decode(
                    payloads[i],
                    (string, string, bytes, string, uint256)
                );
            address tokenAddress = gateway.tokenAddresses(symbol);
            if (!tokenApprovals[tokenAddress]) {
                IERC20(tokenAddress).approve(
                    address(gateway),
                    type(uint256).max
                );
                tokenApprovals[tokenAddress] = true;
            }
            IERC20(tokenAddress).transferFrom(
                msg.sender,
                address(this),
                amount
            );
            gateway.callContractWithToken(
                destinationChain,
                contractAddress,
                payload,
                symbol,
                amount
            );
        }
    }
}
