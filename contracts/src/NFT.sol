// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {ERC721URIStorage, ERC721} from "@openzeppelin/token/ERC721/extensions/ERC721URIStorage.sol";

contract NFT is ERC721URIStorage {
    event Update(address indexed user, uint256 tokenId, string tokenURI);

    uint256 private _nextTokenId = 1;

    constructor(string memory _name, string memory _symbol) ERC721(_name, _symbol) {}

    function update(address _user, string memory tokenURI) public {
        if (msg.sender != _user) {
            revert("Only the user can call this function");
        }

        uint256 userTokenId = balanceOf(_user);
        if (userTokenId == 0) {
            _mint(_user, _nextTokenId);
            _setTokenURI(_nextTokenId, tokenURI);
            _nextTokenId++;
        } else {
            _setTokenURI(userTokenId, tokenURI);
        }
        emit Update(_user, userTokenId, tokenURI);
    }
}
