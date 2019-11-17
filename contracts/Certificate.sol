pragma solidity >=0.4.0 <0.6.0;

import './CertificateCore.sol';

contract Certificate is CertificateCore {
    constructor (string memory name, string memory symbol) public Users() ERC721Full(name, symbol)  {
        // solhint-disable-previous-line no-empty-blocks
    }

    function mint(
      string memory uri,
      bytes32 asset
    ) public onlyUser returns (uint256) {
      return _mintAsset(uri, asset, msg.sender);
    }

    function mintToUser(
      string memory uri,
      bytes32 asset,
      address user
    ) public onlyUser returns (uint256) {
      return _mintAsset(uri, asset, user);
    }

    function update(
      string memory uri,
      bytes32 asset,
      uint256 tokenId
    ) public onlyUser {
      _update(uri, asset, tokenId);
    }

    function rescue(
      address to,
      uint256 tokenId
    ) public onlyOwner {
      _rescue(to, tokenId);
    }

    function burn(
      uint256 tokenId
    ) public onlyOwner{
      _burn(tokenId);
    }

    function reclaimEther(
      address payable receiver
    ) external onlyOwner {
      _reclaimEther(receiver);
    }

    function transferForUser(
      uint256 tokenId,
      address to,
      uint256 nonce,
      bytes32 h,
      uint8 v,
      bytes32 r,
      bytes32 s
    ) public {
      // Verify instructions
      require(calcHash(tokenId, to, nonce) == h, 'Hash did not compute');
      // Get the user
      address user = verifyHash(h, v, r, s);
      require(userNonce[user] == nonce, 'Message already executed');
      require(this.ownerOf(tokenId) == user, 'Token is not owned by User');
      _transferFrom(user, to, tokenId);
      require(_checkOnERC721Received(user, to, tokenId, ""), "CredibleCore:_transferForUser transfer to non ERC721Receiver implementer");
      userNonce[user] = nonce + 1;
    }

    function verifyHash(
      bytes32 hash,
      uint8 v,
      bytes32 r,
      bytes32 s
    ) public pure returns (address signer) {
      bytes32 messageDigest = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", hash));

      return ecrecover(messageDigest, v, r, s);
    }

    function calcHash(uint256 tokenId, address to, uint256 nonce) public returns(bytes32) {
      return keccak256(abi.encodePacked(tokenId, to, nonce));
    }

    function hash(bytes memory data) public returns (bytes32) {
      return keccak256(data);
    }
}