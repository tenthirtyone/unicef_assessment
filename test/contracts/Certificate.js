const BigNumber = web3.BigNumber;
const { expectRevert } = require("openzeppelin-test-helpers");
const ethers = require("ethers");
const Web3 = require("web3");
const util = require("ethereumjs-util");

const Certificate = artifacts.require("Certificate");

require("chai")
  .use(require("chai-as-promised"))
  .use(require("chai-bignumber")(BigNumber))
  .should();

const expect = require("chai").expect;

contract("Certificate", accounts => {
  const [creator, user, account1, account2, account3] = accounts;
  let certificate = null;
  const tokenName = "Certificate";
  const tokenSymbol = "CRD";
  const tokenURI = "certificat.com/tokens/1";
  const emptyString = "";
  const assetHash = "0x0011223344556677889900aabbccddeeff000000000000000000000000000000";
  const zeroHash = "0x0000000000000000000000000000000000000000000000000000000000000000";
  const zeroAddress = "0x0000000000000000000000000000000000000000";
  const web3 = new Web3();

  const privateKey = "0x3141592653589793238462643383279502884197169399375105820974944592";

  beforeEach(async () => {
    certificate = await Certificate.new(tokenName, tokenSymbol);
  });

  it("sets the creator as the contract owner.", async () => {
    const owner = await certificate.owner();

    owner.should.be.equal(creator);
  });

  it("sets the creator as a user", async () => {
    const ownerIsUser = await certificate.isUser(creator);
    ownerIsUser.should.be.equal(true);
  });

  it("has a token name", async () => {
    const name = await certificate.name();

    name.should.be.equal(tokenName);
  });

  it("has a token symbol", async () => {
    const symbol = await certificate.symbol();

    symbol.should.be.equal(tokenSymbol);
  });

  it("mints a token", async () => {
    await certificate.mint(tokenURI, assetHash);
    const data = await certificate.getAsset(0);
    const { uri, asset, owner } = data;

    uri.should.be.equal(tokenURI);
    asset.should.be.equal(assetHash);
    owner.should.be.equal(creator);
  });

  it("mints a token to a user", async () => {
    await certificate.mintToUser(tokenURI, assetHash, account3);
    const data = await certificate.getAsset(0);
    const { uri, asset, owner } = data;

    uri.should.be.equal(tokenURI);
    asset.should.be.equal(assetHash);
    owner.should.be.equal(account3);
  });

  it("updates a token", async () => {
    await certificate.mint(emptyString, zeroHash);
    await certificate.update(tokenURI, assetHash, 0);
    const data = await certificate.getAsset(0);
    const { uri, asset, owner } = data;

    uri.should.be.equal(tokenURI);
    asset.should.be.equal(assetHash);
    owner.should.be.equal(creator);
  });

  it("rescues a token", async () => {
    await certificate.mint(emptyString, zeroHash);
    await certificate.rescue(account1, 0);
    const data = await certificate.getAsset(0);
    const { owner } = data;

    owner.should.be.equal(account1);
  });

  it("burns a token", async () => {
    await certificate.mint(emptyString, zeroHash);
    await certificate.burn(0);
  });

  it("reclaims Ether", async () => {
    await certificate.reclaimEther(creator);
  });

  it("verifies a operation hash from the client", async () => {
    const wallet = new ethers.Wallet(privateKey);
    const address = await wallet.getAddress();

    // Sign operation:
    // tokenId, to, nonce
    const dataHash = await ethers.utils.solidityKeccak256(["uint256", "address", "uint256"], [0, account3, 1]);

    const contractHash = await certificate.calcHash.call(0, account3, 1);
    dataHash.should.be.equal(contractHash);
  });

  it("verifies the operation hash signature from the client", async () => {
    const wallet = new ethers.Wallet(privateKey);
    const walletAddress = await wallet.getAddress();

    const dataHash = await ethers.utils.solidityKeccak256(["uint256", "address", "uint256"], [0, account3, 1]);

    const flatSig = await wallet.signMessage(ethers.utils.arrayify(dataHash));

    const { v, r, s } = ethers.utils.splitSignature(flatSig);
    const verifiedAddress = await certificate.verifyHash(dataHash, v, r, s);

    verifiedAddress.should.be.equal(walletAddress);
  });

  it("transfers a token for a user", async () => {
    const wallet = new ethers.Wallet(privateKey);
    const address = await wallet.getAddress();
    const tokenId = 0;

    const nonce = (await certificate.getUserNonce(address)).toNumber();
    await certificate.mint(emptyString, zeroHash);
    await certificate.safeTransferFrom(creator, address, 0);

    const dataHash = await ethers.utils.solidityKeccak256(["uint256", "address", "uint256"], [tokenId, account3, nonce]);
    const flatSig = await wallet.signMessage(ethers.utils.arrayify(dataHash));

    const { v, r, s } = ethers.utils.splitSignature(flatSig);

    await certificate.transferForUser(tokenId, account3, nonce, dataHash, v, r, s);
    const asset = await certificate.getAsset(tokenId);
    const newOwner = asset[2];
    newOwner.should.be.equal(account3);
    (await certificate.getUserNonce(address)).toNumber().should.be.equal(1);
  });

  describe("Throws", () => {
    it("mint fails for non-users", async () => {
      await expectRevert(
        certificate.mint(emptyString, zeroHash, { from: account1 }),
        "Users: Only a contract user may call this function"
      );
    });
    it("update fails for non-users", async () => {
      await certificate.mint(emptyString, zeroHash);
      await expectRevert(
        certificate.update(emptyString, zeroHash, 0, { from: account1 }),
        "Users: Only a contract user may call this function"
      );
    });
    it("update fails for non-owners", async () => {
      await certificate.addUser(account1);
      await certificate.addUser(account2);
      await certificate.mint(emptyString, zeroHash, { from: account1 });

      await expectRevert(
        certificate.update(emptyString, zeroHash, 0, { from: account2 }),
        "Core:_update user does not own the token"
      );
    });
    it("gets an asset", async () => {
      await certificate.mint(emptyString, zeroHash);
      const data = await certificate.getAsset(0);
      const { uri, asset, owner } = data;

      uri.should.be.equal(emptyString);
      asset.should.be.equal(zeroHash);
      owner.should.be.equal(creator);
    });
    it("getAsset fails when id is out of range", async () => {
      await certificate.mint(emptyString, zeroHash);

      await expectRevert(certificate.getAsset(10), "Core:getAsset token tokenId beyond current index");
    });
    it("rescue fails for anyone but the owner", async () => {
      await certificate.mint(emptyString, zeroHash);

      try {
        await expectRevert(await certificate.rescue(account1, 0, { from: account1 }), "Ownable: caller is not the owner");
      } catch (e) {
        return;
      }

      throw new Error("Rescue did not fail");
    });
  });
});
