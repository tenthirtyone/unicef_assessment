pragma solidity >=0.4.0 <0.6.0;

import 'openzeppelin-solidity/contracts/token/ERC721/ERC721Full.sol';
import './Users.sol';

contract CertificateCore is ERC721Full, Users {
  event ReclaimEther(uint256 balance);
  event Rescue(address from, address to, uint256 tokenId);
  event MintAsset(address user, string uri, bytes32 asset, uint256 tokenId);
  event UpdateAsset(address user, string uri, bytes32 asset, uint256 tokenId);
  
  bytes32[] private _assets;
  mapping(address => uint256) userNonce;

  function _mintAsset(
    string memory uri,
    bytes32 asset,
    address user
  ) internal returns (uint256) {
    uint256 tokenId = _assets.length;
    
    _mint(user, tokenId);
    _setTokenURI(tokenId, uri);
    _assets.push(asset);

    emit MintAsset(user, uri, asset, tokenId);
    return tokenId;
  }

  function _update(
    string memory uri,
    bytes32 asset,
    uint256 tokenId
  ) internal {
    require(this.ownerOf(tokenId) == msg.sender, "Core:_update user does not own the token");

    _assets[tokenId] = asset;
    _setTokenURI(tokenId, uri);
    emit UpdateAsset(msg.sender, uri, asset, tokenId);
  }

  function _rescue(
    address to,
    uint256 tokenId
  ) internal {
    address oldOwner = this.ownerOf(tokenId);
    _transferFrom(oldOwner, to, tokenId);
    require(_checkOnERC721Received(oldOwner, to, tokenId, ""), "CertificateCore:_rescue transfer to non ERC721Receiver implementer");
    emit Rescue(oldOwner, to, tokenId);
  }

  function _reclaimEther(
    address payable receiver
  ) internal {
    uint256 _balance = address(this).balance;

    receiver.transfer(_balance);
    emit ReclaimEther(_balance);
  }

  function getAsset(
    uint256 tokenId
  ) external view returns(string memory uri, bytes32 asset, address owner) {
    require(tokenId < _assets.length, "Core:getAsset token tokenId beyond current index");
    string memory tokenURI = this.tokenURI(tokenId);
    asset = _assets[tokenId];
    uri = tokenURI;
    owner = this.ownerOf(tokenId);
  }

  function getUserNonce(address user) external view returns(uint256 nonce) {
    return userNonce[user];
  }
}
