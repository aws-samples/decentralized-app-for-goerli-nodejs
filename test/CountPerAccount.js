// This is an example test file. Hardhat will run every *.js file in `test/`,
// so feel free to add new ones.

// Hardhat tests are normally written with Mocha and Chai.

// We import Chai to use its asserting functions here.
const { expect } = require("chai");

// We use `loadFixture` to share common setups (or fixtures) between tests.
// Using this simplifies your tests and makes them run faster, by taking
// advantage of Hardhat Network's snapshot functionality.
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

// `describe` is a Mocha function that allows you to organize your tests.
// Having your tests organized makes debugging them easier. All Mocha
// functions are available in the global scope.
//
// `describe` receives the name of a section of your test suite, and a
// callback. The callback must define the tests of that section. This callback
// can't be an async function.
describe("CountPerAccount contract", function () {
  // We define a fixture to reuse the same setup in every test. We use
  // loadFixture to run this setup once, snapshot that state, and reset Hardhat
  // Network to that snapshot in every test.
  async function deployCPAFixture() {
    // Get the ContractFactory and Signers here.
    const CPA = await ethers.getContractFactory("CountPerAccount");
    const [owner, addr1, addr2] = await ethers.getSigners();

    // To deploy our contract, we just have to call deploy()and await
    // its deployed() method, which happens once its transaction has been
    // mined.
    const CPAcontract = await CPA.deploy();

    await CPAcontract.deployed();

    // Fixtures can return anything you consider useful for your tests
    return { CPA, CPAcontract, owner, addr1, addr2 };
  }

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      const { CPAcontract, owner } = await loadFixture(deployCPAFixture);
      expect(await CPAcontract.owner()).to.equal(owner.address);
    });

    it("Should set initial count for owner to 1", async function () {
      const { CPAcontract, owner } = await loadFixture(deployCPAFixture);
      //expect(await CPAcontract.countOf(owner.address)).to.eql([1,1]);
      expect(await CPAcontract.countOf(owner.address)).to.emit(CPAcontract, "CountsResponse")
      .withArgs(1, 1);
    });
  });

  describe("Transactions", function () {
    it("Increment", async function () {
      const { CPAcontract, owner, addr1 } = await loadFixture(
        deployCPAFixture
      );

      CPAcontract.IncrementCount();

      //expect(await CPAcontract.countOf(owner.address)).to.eql([2,2]);
      expect(await CPAcontract.countOf(owner.address)).to.emit(CPAcontract, "CountsResponse")
      .withArgs(2, 2);

      await CPAcontract.DecrementCount();

      //expect(await CPAcontract.countOf(owner.address)).to.eql([1,1]);
      expect(await CPAcontract.countOf(owner.address)).to.emit(CPAcontract, "CountsResponse")
      .withArgs(1, 1);

      await CPAcontract.connect(addr1).IncrementCount();

      //expect(await CPAcontract.countOf(addr1.address)).to.eql([1,2]);
      expect(await CPAcontract.countOf(owner.address)).to.emit(CPAcontract, "CountsResponse")
      .withArgs(1, 2);

    });

    it("should emit Increment/Decrement events", async function () {
      const { CPAcontract, owner, addr1} = await loadFixture(
        deployCPAFixture
      );

     
      await expect(CPAcontract.connect(addr1).IncrementCount())
        .to.emit(CPAcontract, "Incremented")
        .withArgs(addr1.address, 1);

      await expect(CPAcontract.connect(addr1).DecrementCount())
        .to.emit(CPAcontract, "Decremented")
        .withArgs(addr1.address, 0);
    });

    it("Should fail if decremented for a 0 count or countof called by not owner", async function () {
      const { CPAcontract, owner, addr1, addr2  } = await loadFixture(
        deployCPAFixture
      );

      await expect(
        CPAcontract.connect(addr2).DecrementCount()
      ).to.be.revertedWith("Count cannot be negative");

      await expect(
        CPAcontract.connect(addr2).countOf(addr1.address)
      ).to.be.revertedWithCustomError(CPAcontract, "InvalidSender").withArgs("Invalid Sender: Only Contract owner or Self can check the count",addr2.address);

    });
  });
});
