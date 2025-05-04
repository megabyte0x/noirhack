// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Script} from "forge-std/Script.sol";
import {console} from "forge-std/console.sol";

import {HelperConfig} from "./HelperConfig.s.sol";
import {HonkVerifier} from "../src/utils/Verifier.sol";

contract DeployVerifier is Script {
    HelperConfig helperConfig;

    function run() public {
        helperConfig = new HelperConfig();
        uint256 deployerKey = helperConfig.s_mainDeployerKey();

        vm.startBroadcast(deployerKey);
        address verifier = address(new HonkVerifier());
        console.log("Verifier deployed to:", verifier);
        vm.stopBroadcast();
    }
}
