
# Assessment
## Description
An ERC-721 Certificate issuer that allows for offline signing of data to later transfer or issue the token.

## Installation
Tested with the following versions
```
$ node -v
Node 8.15.1
```
```
$ truffle version
Truffle v5.0.26 (core: 5.0.26)
Solidity v0.5.0 (solc-js)
Node v8.15.1
Web3.js v1.0.0-beta.37
```
To Install
```
$ npm install -g truffle
$ npm install
$ truffle test

  Contract: Certificate
    ✓ sets the creator as the contract owner.
    ✓ sets the creator as a user
    ✓ has a token name
    ✓ has a token symbol
    ✓ mints a token (95ms)
    ✓ mints a token to a user (91ms)
    ✓ updates a token (136ms)
    ✓ rescues a token (141ms)
    ✓ burns a token (110ms)
    ✓ reclaims Ether
    ✓ verifies a operation hash from the client (66ms)
    ✓ verifies the operation hash signature from the client (55ms)
    ✓ transfers a token for a user (244ms)
    Throws
      ✓ mint fails for non-users (67ms)
      ✓ update fails for non-users (106ms)
      ✓ update fails for non-owners (192ms)
      ✓ gets an asset (129ms)
      ✓ getAsset fails when id is out of range (168ms)
      ✓ rescue fails for anyone but the owner (123ms)


  19 passing (4s)
```

