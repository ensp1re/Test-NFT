// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TestNft is ERC721URIStorage, Ownable {
    uint256 private _tokenIds;

    uint256 public constant MAX_SUPPLY = 100;
    uint256 public constant MINT_PRICE = 0.01 ether;
    string public baseUrl;

    event NFTMinted(address indexed owner, uint256 tokenId, string tokenURI);

    constructor(
        address _initialOwner,
        string memory _metadataBaseURI
    ) ERC721("TestNft", "TNFT") Ownable(_initialOwner) {
        baseUrl = string(abi.encodePacked("ipfs://", _metadataBaseURI, "/"));
    }

    function mintNFT(address recipient) public payable returns (uint256) {
        require(_tokenIds < MAX_SUPPLY, "Maximum supply reached");
        require(msg.value >= MINT_PRICE, "Insufficient funds");

        uint256 newTokenId = _tokenIds;
        _safeMint(recipient, newTokenId);
        _setTokenURI(
            newTokenId,
            string(
                abi.encodePacked(baseUrl, Strings.toString(newTokenId), ".json")
            )
        );

        unchecked {
            _tokenIds++;
        }

        emit NFTMinted(recipient, newTokenId, tokenURI(newTokenId));

        if (msg.value > MINT_PRICE) {
            payable(msg.sender).transfer(msg.value - MINT_PRICE);
        }

        return newTokenId;
    }

    function totalSupply() public view returns (uint256) {
        return _tokenIds;
    }

    function withdraw() public onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
}
