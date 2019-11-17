const Migrations = artifacts.require("Migrations");
const Certification = artifacts.require("Certificate");

module.exports = async function (deployer) {
  await deployer.deploy(Migrations);
  await deployer.deploy(Certification, "Certificate", "CERT");
};
