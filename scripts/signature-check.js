const { ethers } = require("hardhat");
const hre = require("hardhat");

async function main() {

    // Define a list of allowlisted wallets
    const allowlistedAddresses = [
        '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
        // '0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc',
        '0x90f79bf6eb2c4f870365e785982e1f101e93b906',
        '0x15d34aaf54267db7d7c367839aaf71a00a2c6a65',
        '0x9965507d1a55bcc2695c58ba16fb37d819b0a4dc',
    ];

    // Select an allowlisted address to mint NFT
    const selectedAddress = '0x90f79bf6eb2c4f870365e785982e1f101e93b906'

    // Define wallet that will be used to sign messages
    const walletAddress = '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266';
    const privateKey = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
    const signer = new ethers.Wallet(privateKey);
    console.log("Wallet used to sign messages: ", signer.address, "\n");

    let messageHash, signature;

    // Check if selected address is in allowlist
    // If yes, sign the wallet's address
    if (allowlistedAddresses.includes(selectedAddress)) {
        console.log("Address is allowlisted! Minting should be possible.");

        // Compute message hash
        messageHash = ethers.utils.id(selectedAddress);
        console.log("Message Hash: ", messageHash);

        // Sign the message hash
        let messageBytes = ethers.utils.arrayify(messageHash);
        signature = await signer.signMessage(messageBytes);
        console.log("Signature: ", signature, "\n");
    }

    const factory = await hre.ethers.getContractFactory("NFTAllowlist");
    const [owner, address1, address2] = await hre.ethers.getSigners();
    const contract = await factory.deploy();

    await contract.deployed();
    console.log("Contract deployed to: ", contract.address);
    console.log("Contract deployed by (Owner/Signing Wallet): ", owner.address, "\n");

    recover = await contract.recoverSigner(messageHash, signature);
    console.log("Message was signed by: ", recover.toString());

    let txn;
    txn = await contract.preSale(2, messageHash, signature);
    await txn.wait();
    console.log("NFTs minted successfully!");

}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });