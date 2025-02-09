// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TestNft is ERC721URIStorage, Ownable {
    uint256 private _tokenIds;

    uint256 public constant MAX_SUPPLY = 100;
    uint256 public constant MINT_PRICE = 0.01 ether;

    event NFTMinted(address indexed owner, uint256 tokenId, string tokenURI);

    constructor(
        address initialOwner
    ) ERC721("TestNft", "TNFT") Ownable(initialOwner) {}

    function mintNFT(
        address recipient,
        string memory tokenURI
    ) public payable returns (uint256) {
        require(_tokenIds < MAX_SUPPLY, "Maximum supply reached");
        require(msg.value >= MINT_PRICE, "Insufficient funds");

        unchecked {
            _tokenIds++;
        }

        _safeMint(recipient, _tokenIds);
        _setTokenURI(_tokenIds, tokenURI);

        emit NFTMinted(recipient, _tokenIds, tokenURI);

        if (msg.value > MINT_PRICE) {
            payable(msg.sender).transfer(msg.value - MINT_PRICE);
        }

        return _tokenIds;
    }

    function totalSupply() public view returns (uint256) {
        return _tokenIds;
    }
}
