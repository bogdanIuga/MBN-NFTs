const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("EnergyVampires", function () {
    let EnergyVampires, energyVampires, owner, addr1, addr2;

    //try with loadFixture
    beforeEach(async () => {
        EnergyVampires = await ethers.getContractFactory("EnergyVampires");
        [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

        // Pass any necessary constructor arguments in the deploy() function.
        energyVampires = await EnergyVampires.deploy();
        await energyVampires.deployed();
    });

    // beforeEach(async () => {
    //     EnergyVampires = await ethers.getContractFactory("EnergyVampires");
    //     [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

    //     energyVampires = await EnergyVampires.deploy();
    //     await energyVampires.deployed();
    // });

    describe("Deployment", function () {
        it("Should set the right owner", async function () {
            expect(await energyVampires.owner()).to.equal(owner.address);
        });
    });

    describe("Minting", function () {
        it("Should not allow to mint more than MAX_SUPPLY", async function () {
            await energyVampires.togglePublicSale();
            for (let i = 0; i < 666; i++) {
                await energyVampires.connect(addr1).mint(10, { value: ethers.utils.parseEther("0.99") });
            }
            await expect(
                energyVampires.connect(addr2).mint(10, { value: ethers.utils.parseEther("0.99") })
            ).to.be.revertedWith("Energy Vampires :: Beyond Max Supply");
        });

        it("Should not allow to mint more than MAX_PUBLIC_MINT", async function () {
            await energyVampires.togglePublicSale();
            await energyVampires.connect(addr1).mint(10, { value: ethers.utils.parseEther("0.99") });
            await expect(
                energyVampires.connect(addr1).mint(1, { value: ethers.utils.parseEther("0.099") })
            ).to.be.revertedWith("Energy Vampires :: Already minted 3 times!");
        });
    });

    describe("Whitelist Minting", function () {
        it("Should not allow to mint more than MAX_WHITELIST_MINT", async function () {
            await energyVampires.toggleWhiteListSale();
            const message = ethers.utils.hexlify(ethers.utils.randomBytes(32));
            const hash = ethers.utils.hashMessage(message);
            const signature = await owner.signMessage(ethers.utils.arrayify(hash));
            await energyVampires.connect(addr1).whitelistMint(3, hash, signature, { value: ethers.utils.parseEther("0.2397") });
            await expect(
                energyVampires.connect(addr1).whitelistMint(1, hash, signature, { value: ethers.utils.parseEther("0.0799") })
            ).to.be.revertedWith("Energy Vampires :: Cannot mint beyond whitelist max mint!");
        });
    });

    describe("Team Minting", function () {
        it("Should allow only owner to mint for team", async function () {
            await expect(
                energyVampires.connect(addr1).teamMint()
            ).to.be.revertedWith("Ownable: caller is not the owner");
            await energyVampires.teamMint();
        });

        it("Should not allow team minting more than once", async function () {
            await energyVampires.teamMint();
            await expect(
                energyVampires.teamMint()
            ).to.be.revertedWith("Energy Vampires :: Team already minted");
        });
    });

    describe("togglePause", function () {
        it("should allow owner to toggle pause", async function () {
            await expect(this.energyVampires.togglePause()).to.emit(this.energyVampires, "PauseToggled").withArgs(true);
            expect(await this.energyVampires.pause()).to.equal(true);
            await expect(this.energyVampires.togglePause()).to.emit(this.energyVampires, "PauseToggled").withArgs(false);
            expect(await this.energyVampires.pause()).to.equal(false);
        });

        it("should prevent non-owners from toggling pause", async function () {
            await expect(this.energyVampires.connect(addr2).togglePause()).to.be.revertedWith("Ownable: caller is not the owner");
        });
    });

    describe("toggleWhiteListSale", function () {
        it("should allow owner to toggle whitelist sale", async function () {
            await expect(this.energyVampires.toggleWhiteListSale()).to.emit(this.energyVampires, "WhiteListSaleToggled").withArgs(true);
            expect(await this.energyVampires.whiteListSale()).to.equal(true);
            await expect(this.energyVampires.toggleWhiteListSale()).to.emit(this.energyVampires, "WhiteListSaleToggled").withArgs(false);
            expect(await this.energyVampires.whiteListSale()).to.equal(false);
        });

        it("should prevent non-owners from toggling whitelist sale", async function () {
            await expect(this.energyVampires.connect(addr2).toggleWhiteListSale()).to.be.revertedWith("Ownable: caller is not the owner");
        });
    });

    describe("togglePublicSale", function () {
        it("should allow owner to toggle public sale", async function () {
            await expect(this.energyVampires.togglePublicSale()).to.emit(this.energyVampires, "PublicSaleToggled").withArgs(true);
            expect(await this.energyVampires.publicSale()).to.equal(true);
            await expect(this.energyVampires.togglePublicSale()).to.emit(this.energyVampires, "PublicSaleToggled").withArgs(false);
            expect(await this.energyVampires.publicSale()).to.equal(false);
        });

        it("should prevent non-owners from toggling public sale", async function () {
            await expect(this.energyVampires.connect(addr2).togglePublicSale()).to.be.revertedWith("Ownable: caller is not the owner");
        });
    });

    describe("toggleReveal", function () {
        it("should allow owner to toggle reveal", async function () {
            await expect(this.energyVampires.toggleReveal()).to.emit(this.energyVampires, "RevealToggled").withArgs(true);
            expect(await this.energyVampires.isRevealed()).to.equal(true);
            await expect(this.energyVampires.toggleReveal()).to.emit(this.energyVampires, "RevealToggled").withArgs(false);
            expect(await this.energyVampires.isRevealed()).to.equal(false);
        });

        it("should prevent non-owners from toggling reveal", async function () {
            await expect(this.energyVampires.connect(addr2).toggleReveal()).to.be.revertedWith("Ownable: caller is not the owner");
        });
    });

});
