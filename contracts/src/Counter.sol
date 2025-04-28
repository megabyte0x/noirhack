// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {HonkVerifier} from "./utils/Verifier.sol";

contract Counter {
    uint256 public number;

    function setNumber(uint256 newNumber, address verifier, bytes calldata _proof, bytes32[] calldata _publicInputs)
        public
    {
        bool verified = HonkVerifier(verifier).verify(_proof, _publicInputs);
        if (!verified) {
            revert("Proof verification failed");
        }
        number = newNumber;
    }

    function increment() public {
        number++;
    }
}
