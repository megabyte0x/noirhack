// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Script} from "forge-std/Script.sol";
import {console} from "forge-std/console.sol";
import {HelperConfig} from "./HelperConfig.s.sol";
import {MerkleStorage} from "../src/MerkleStorage.sol";

contract DeployMerkleStorage is Script {
    HelperConfig helperConfig;
    address verifierAddress;

    function run() public {
        helperConfig = new HelperConfig();
        verifierAddress = helperConfig.getVerifierAddress();
        uint256 deployerKey = helperConfig.s_mainDeployerKey();

        vm.startBroadcast(deployerKey);
        address merkleStorage = address(new MerkleStorage(verifierAddress));
        console.log("MerkleStorage address:", merkleStorage);
        vm.stopBroadcast();
    }
}
