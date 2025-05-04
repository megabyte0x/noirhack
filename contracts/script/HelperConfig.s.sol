// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Script} from "forge-std/Script.sol";
import {console} from "forge-std/console.sol";

import {DevOpsTools} from "foundry-devops/src/DevOpsTools.sol";

contract HelperConfig is Script {
    uint256 public s_mainDeployerKey;

    constructor() {
        if (block.chainid == 84532) {
            s_mainDeployerKey = vm.envUint("PRIVATE_KEY");
        } else {
            s_mainDeployerKey = vm.envUint("ANVIL_PRIVATE_KEY");
        }
    }

    function getVerifierAddress() public view returns (address) {
        address contractAddress = DevOpsTools.get_most_recent_deployment("HonkVerifier", block.chainid);
        return contractAddress;
    }

    function getMerkleStorageAddress() public view returns (address) {
        address contractAddress = DevOpsTools.get_most_recent_deployment("MerkleStorage", block.chainid);
        return contractAddress;
    }
}
