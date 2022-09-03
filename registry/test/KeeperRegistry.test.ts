import { assert, expect } from "chai";
import { BigNumber, Signer } from "ethers";
import { ethers } from "hardhat";

import { KeeperRegistry } from "../typechain/contracts/KeeperRegistry";
import { UpkeepMock } from "../typechain/contracts/UpkeepMock";
import { evmRevert } from "./helpers/matcher";
import { Personas, getUsers } from "./helpers/setup";

async function getUpkeepID(tx: any) {
  const receipt = await tx.wait();
  return receipt.events[0].args.id;
}

function randomAddress() {
  return ethers.Wallet.createRandom().address;
}

// -----------------------------------------------------------------------------------------------
// DEV: these *should* match the perform/check gas overhead values in the contract and on the node
const PERFORM_GAS_OVERHEAD = BigNumber.from(160000);
const CHECK_GAS_OVERHEAD = BigNumber.from(170000);
// -----------------------------------------------------------------------------------------------

// Smart contract factories
let keeperRegistryFactory: any;
let upkeepMockFactory: any;

let personas: Personas;

before(async () => {
  personas = (await getUsers()).personas;

  // @ts-ignore bug in autogen file

  keeperRegistryFactory = await ethers.getContractFactory("KeeperRegistry");
  upkeepMockFactory = await ethers.getContractFactory("UpkeepMock");
});

describe("KeeperRegistry", () => {
  const executeGas = BigNumber.from("100000");
  const blockCountPerTurn = BigNumber.from(3);
  const emptyBytes = "0x00";
  const randomBytes = "0x1234abcd";
  const zeroAddress = ethers.constants.AddressZero;
  const extraGas = BigNumber.from("250000");
  const checkGasLimit = BigNumber.from(20000000);
  const maxPerformGas = BigNumber.from(5000000);

  let owner: Signer;
  let keeper1: Signer;
  let keeper2: Signer;
  let keeper3: Signer;
  let nonkeeper: Signer;
  let admin: Signer;
  let payee1: Signer;
  let payee2: Signer;
  let payee3: Signer;

  let registry: KeeperRegistry;
  let mock: UpkeepMock;

  let id: BigNumber;
  let keepers: string[];
  let payees: string[];

  beforeEach(async () => {
    owner = personas.Owner;
    keeper1 = personas.Keeper1;
    keeper2 = personas.Keeper2;
    keeper3 = personas.Keeper3;
    nonkeeper = personas.Nonkeeper;
    admin = personas.Admin;
    payee1 = personas.Payee1;
    payee2 = personas.Payee2;
    payee3 = personas.Payee3;

    keepers = [await keeper1.getAddress(), await keeper2.getAddress(), await keeper3.getAddress()];
    payees = [await payee1.getAddress(), await payee2.getAddress(), await payee3.getAddress()];

    registry = await keeperRegistryFactory.connect(owner).deploy({
      blockCountPerTurn,
      checkGasLimit,
      maxPerformGas,
    });
    mock = await upkeepMockFactory.deploy();

    await registry.connect(owner).setKeepers(keepers, payees);
    const tx = await registry
      .connect(owner)
      .registerUpkeep(mock.address, executeGas, await admin.getAddress(), randomBytes);
    id = await getUpkeepID(tx);
  });

  describe("#typeAndVersion", () => {
    it("uses the correct type and version", async () => {
      const typeAndVersion = await registry.typeAndVersion();
      assert.equal(typeAndVersion, "BoomKeeperRegistry 1.0.0");
    });
  });

  describe("#setKeepers", () => {
    const IGNORE_ADDRESS = "0xFFfFfFffFFfffFFfFFfFFFFFffFFFffffFfFFFfF";
    it("reverts when not called by the owner", async () => {
      await evmRevert(registry.connect(keeper1).setKeepers([], []), "Only callable by owner");
    });

    it("reverts when adding the same keeper twice", async () => {
      await evmRevert(
        registry
          .connect(owner)
          .setKeepers(
            [await keeper1.getAddress(), await keeper1.getAddress()],
            [await payee1.getAddress(), await payee1.getAddress()],
          ),
      );
    });

    it("reverts with different numbers of keepers/payees", async () => {
      await evmRevert(
        registry
          .connect(owner)
          .setKeepers([await keeper1.getAddress(), await keeper2.getAddress()], [await payee1.getAddress()]),
      );
      await evmRevert(
        registry
          .connect(owner)
          .setKeepers([await keeper1.getAddress()], [await payee1.getAddress(), await payee2.getAddress()]),
      );
    });

    it("reverts if the payee is the zero address", async () => {
      await evmRevert(
        registry
          .connect(owner)
          .setKeepers(
            [await keeper1.getAddress(), await keeper2.getAddress()],
            [await payee1.getAddress(), "0x0000000000000000000000000000000000000000"],
          ),
      );
    });

    it("emits events for every keeper added and removed", async () => {
      const oldKeepers = [await keeper1.getAddress(), await keeper2.getAddress()];
      const oldPayees = [await payee1.getAddress(), await payee2.getAddress()];
      await registry.connect(owner).setKeepers(oldKeepers, oldPayees);
      assert.deepEqual(oldKeepers, (await registry.getState()).keepers);

      // remove keepers
      const newKeepers = [await keeper2.getAddress(), await keeper3.getAddress()];
      const newPayees = [await payee2.getAddress(), await payee3.getAddress()];
      const tx = await registry.connect(owner).setKeepers(newKeepers, newPayees);
      assert.deepEqual(newKeepers, (await registry.getState()).keepers);

      await expect(tx).to.emit(registry, "KeepersUpdated").withArgs(newKeepers, newPayees);
    });

    it("updates the keeper to inactive when removed", async () => {
      await registry.connect(owner).setKeepers(keepers, payees);
      await registry
        .connect(owner)
        .setKeepers(
          [await keeper1.getAddress(), await keeper3.getAddress()],
          [await payee1.getAddress(), await payee3.getAddress()],
        );
      const added = await registry.getKeeperInfo(await keeper1.getAddress());
      assert.isTrue(added.active);
      const removed = await registry.getKeeperInfo(await keeper2.getAddress());
      assert.isFalse(removed.active);
    });

    it("does not change the payee if IGNORE_ADDRESS is used as payee", async () => {
      const oldKeepers = [await keeper1.getAddress(), await keeper2.getAddress()];
      const oldPayees = [await payee1.getAddress(), await payee2.getAddress()];
      await registry.connect(owner).setKeepers(oldKeepers, oldPayees);
      assert.deepEqual(oldKeepers, (await registry.getState()).keepers);

      const newKeepers = [await keeper2.getAddress(), await keeper3.getAddress()];
      const newPayees = [IGNORE_ADDRESS, await payee3.getAddress()];
      const tx = await registry.connect(owner).setKeepers(newKeepers, newPayees);
      assert.deepEqual(newKeepers, (await registry.getState()).keepers);

      const ignored = await registry.getKeeperInfo(await keeper2.getAddress());
      assert.equal(await payee2.getAddress(), ignored.payee);
      assert.equal(true, ignored.active);

      await expect(tx).to.emit(registry, "KeepersUpdated").withArgs(newKeepers, newPayees);
    });

    it("reverts if the owner changes the payee", async () => {
      await registry.connect(owner).setKeepers(keepers, payees);
      await evmRevert(
        registry
          .connect(owner)
          .setKeepers(keepers, [await payee1.getAddress(), await payee2.getAddress(), await owner.getAddress()]),
      );
    });
  });

  describe("#registerUpkeep", () => {
    context("and the registry is paused", () => {
      beforeEach(async () => {
        await registry.connect(owner).pause();
      });
      it("reverts", async () => {
        await evmRevert(
          registry.connect(owner).registerUpkeep(zeroAddress, executeGas, await admin.getAddress(), emptyBytes),
          "Pausable: paused",
        );
      });
    });

    it("reverts if the target is not a contract", async () => {
      await evmRevert(
        registry.connect(owner).registerUpkeep(zeroAddress, executeGas, await admin.getAddress(), emptyBytes),
      );
    });

    // it("reverts if called by a non-owner", async () => {
    //   await evmRevert(
    //     registry.connect(keeper1).registerUpkeep(mock.address, executeGas, await admin.getAddress(), emptyBytes),
    //   );
    // });

    it("reverts if execute gas is too low", async () => {
      await evmRevert(
        registry.connect(owner).registerUpkeep(mock.address, 2299, await admin.getAddress(), emptyBytes),
      );
    });

    it("reverts if execute gas is too high", async () => {
      await evmRevert(
        registry.connect(owner).registerUpkeep(mock.address, 5000001, await admin.getAddress(), emptyBytes),
      );
    });

    it("creates a record of the registration", async () => {
      const tx = await registry
        .connect(owner)
        .registerUpkeep(mock.address, executeGas, await admin.getAddress(), emptyBytes);
      id = await getUpkeepID(tx);
      await expect(tx)
        .to.emit(registry, "UpkeepRegistered")
        .withArgs(id, executeGas, await admin.getAddress());
      const registration = await registry.getUpkeep(id);
      assert.equal(mock.address, registration.target);
      assert.equal(0, registration.balance.toNumber());
      assert.equal(emptyBytes, registration.checkData);
      assert(registration.maxValidBlocknumber.eq("0xffffffffffffffff"));
    });
  });

  describe("#setUpkeepGasLimit", () => {
    const newGasLimit = BigNumber.from("500000");

    it("reverts if the registration does not exist", async () => {
      await evmRevert(registry.connect(keeper1).setUpkeepGasLimit(id.add(1), newGasLimit));
    });

    it("reverts if the upkeep is canceled", async () => {
      await registry.connect(admin).cancelUpkeep(id);
      await evmRevert(registry.connect(keeper1).setUpkeepGasLimit(id, newGasLimit));
    });

    it("reverts if called by anyone but the admin", async () => {
      await evmRevert(registry.connect(owner).setUpkeepGasLimit(id, newGasLimit));
    });

    it("reverts if new gas limit is out of bounds", async () => {
      await evmRevert(registry.connect(admin).setUpkeepGasLimit(id, BigNumber.from("100")));
      await evmRevert(
        registry.connect(admin).setUpkeepGasLimit(id, BigNumber.from("6000000")),
      );
    });

    it("updates the gas limit successfully", async () => {
      const initialGasLimit = (await registry.getUpkeep(id)).executeGas;
      assert.equal(initialGasLimit, executeGas.toNumber());
      await registry.connect(admin).setUpkeepGasLimit(id, newGasLimit);
      const updatedGasLimit = (await registry.getUpkeep(id)).executeGas;
      assert.equal(updatedGasLimit, newGasLimit.toNumber());
    });

    it("emits a log", async () => {
      const tx = await registry.connect(admin).setUpkeepGasLimit(id, newGasLimit);
      await expect(tx).to.emit(registry, "UpkeepGasLimitSet").withArgs(id, newGasLimit);
    });
  });

  describe("#checkUpkeep", () => {
    it("reverts if executed", async () => {
      await mock.setCanPerform(true);
      await mock.setCanCheck(true);
      await evmRevert(registry.checkUpkeep(id, await keeper1.getAddress()));
    });

    it("reverts if the specified keeper is not valid", async () => {
      await mock.setCanPerform(true);
      await mock.setCanCheck(true);
      await evmRevert(registry.checkUpkeep(id, await owner.getAddress()));
    });

    context("and upkeep is not needed", () => {
      beforeEach(async () => {
        await mock.setCanCheck(false);
      });

      it("reverts", async () => {
        await evmRevert(
          registry.connect(zeroAddress).callStatic.checkUpkeep(id, await keeper1.getAddress()),
        );
      });
    });

    context("and upkeep check simulations succeeds", () => {
      beforeEach(async () => {
        await mock.setCanCheck(true);
        await mock.setCanPerform(true);
      });

      it("returns true with pricing info if the target can execute", async () => {
        await registry.connect(owner).setConfig({
          blockCountPerTurn,
          checkGasLimit,
          maxPerformGas,
        });
        const response = await registry.connect(zeroAddress).callStatic.checkUpkeep(id, await keeper1.getAddress());
        assert.isTrue(response.gasLimit.eq(executeGas));
      });

    });
  });

  describe("#performUpkeep", () => {
    context("the registry is paused", () => {
      beforeEach(async () => {
        await registry.connect(owner).pause();
      });

      it("reverts", async () => {
        await evmRevert(registry.connect(keeper2).performUpkeep(id, "0x"), "Pausable: paused");
      });
    });

    it("does not revert if the target cannot execute", async () => {
      const mockResponse = await mock.connect(zeroAddress).callStatic.checkUpkeep("0x");
      assert.isFalse(mockResponse.callable);

      await registry.connect(keeper3).performUpkeep(id, "0x");
    });

    it("returns false if the target cannot execute", async () => {
      const mockResponse = await mock.connect(zeroAddress).callStatic.checkUpkeep("0x");
      assert.isFalse(mockResponse.callable);

      assert.isFalse(await registry.connect(keeper1).callStatic.performUpkeep(id, "0x"));
    });

    it("returns true if called", async () => {
      await mock.setCanPerform(true);

      const response = await registry.connect(keeper1).callStatic.performUpkeep(id, "0x");
      assert.isTrue(response);
    });

    it("reverts if not enough gas supplied", async () => {
      await mock.setCanPerform(true);

      await evmRevert(registry.connect(keeper1).performUpkeep(id, "0x", { gasLimit: BigNumber.from("120000") }));
    });

    it("executes the data passed to the registry", async () => {
      await mock.setCanPerform(true);

      const performData = "0xc0ffeec0ffee";
      const tx = await registry.connect(keeper1).performUpkeep(id, performData, { gasLimit: extraGas });
      const receipt = await tx.wait();
      const eventLog = receipt?.events;

      assert.equal(eventLog?.length, 2);
      assert.equal(eventLog?.[1].event, "UpkeepPerformed");
      expect(eventLog?.[1].args?.[0]).to.equal(id);
      assert.equal(eventLog?.[1].args?.[1], true);
      assert.equal(eventLog?.[1].args?.[2], await keeper1.getAddress());
      assert.isNotEmpty(eventLog?.[1].args?.[3]);
      assert.equal(eventLog?.[1].args?.[4], performData);
    });

    it("reverts if called by a non-keeper", async () => {
      await evmRevert(registry.connect(nonkeeper).performUpkeep(id, "0x"));
    });

    it("reverts if the upkeep has been canceled", async () => {
      await mock.setCanPerform(true);

      await registry.connect(owner).cancelUpkeep(id);

      await evmRevert(registry.connect(keeper1).performUpkeep(id, "0x"));
    });

    it("reverts if the same caller calls twice in a row", async () => {
      await registry.connect(keeper1).performUpkeep(id, "0x");
      await evmRevert(registry.connect(keeper1).performUpkeep(id, "0x"));
      await registry.connect(keeper2).performUpkeep(id, "0x");
      await evmRevert(registry.connect(keeper2).performUpkeep(id, "0x"));
      await registry.connect(keeper1).performUpkeep(id, "0x");
    });

  });

  describe("#cancelUpkeep", () => {
    it("reverts if the ID is not valid", async () => {
      await evmRevert(registry.connect(owner).cancelUpkeep(id.add(1)));
    });

    it("reverts if called by a non-owner/non-admin", async () => {
      await evmRevert(registry.connect(keeper1).cancelUpkeep(id));
    });

    describe("when called by the owner", async () => {
      it("sets the registration to invalid immediately", async () => {
        const tx = await registry.connect(owner).cancelUpkeep(id);
        const receipt = await tx.wait();
        const registration = await registry.getUpkeep(id);
        assert.equal(registration.maxValidBlocknumber.toNumber(), receipt.blockNumber);
      });

      it("emits an event", async () => {
        const tx = await registry.connect(owner).cancelUpkeep(id);
        const receipt = await tx.wait();
        await expect(tx).to.emit(registry, "UpkeepCanceled").withArgs(id, BigNumber.from(receipt.blockNumber));
      });

      it("immediately prevents upkeep", async () => {
        await registry.connect(owner).cancelUpkeep(id);

        await evmRevert(registry.connect(keeper2).performUpkeep(id, "0x"));
      });

      it("does not revert if reverts if called multiple times", async () => {
        await registry.connect(owner).cancelUpkeep(id);
        await evmRevert(registry.connect(owner).cancelUpkeep(id));
      });

      describe("when called by the owner when the admin has just canceled", () => {
        let oldExpiration: BigNumber;

        beforeEach(async () => {
          await registry.connect(admin).cancelUpkeep(id);
          const registration = await registry.getUpkeep(id);
          oldExpiration = registration.maxValidBlocknumber;
        });

        it("allows the owner to cancel it more quickly", async () => {
          await registry.connect(owner).cancelUpkeep(id);

          const registration = await registry.getUpkeep(id);
          const newExpiration = registration.maxValidBlocknumber;
          assert.isTrue(newExpiration.lt(oldExpiration));
        });
      });
    });

    describe("when called by the admin", async () => {
      const delay = 50;

      it("sets the registration to invalid in 50 blocks", async () => {
        const tx = await registry.connect(admin).cancelUpkeep(id);
        const receipt = await tx.wait();
        const registration = await registry.getUpkeep(id);
        assert.equal(registration.maxValidBlocknumber.toNumber(), receipt.blockNumber + 50);
      });

      it("emits an event", async () => {
        const tx = await registry.connect(admin).cancelUpkeep(id);
        const receipt = await tx.wait();
        await expect(tx)
          .to.emit(registry, "UpkeepCanceled")
          .withArgs(id, BigNumber.from(receipt.blockNumber + delay));
      });

      // it('updates the canceled registrations list', async () => {
      //   let canceled = await registry.callStatic.getCanceledUpkeepList()
      //   assert.deepEqual([], canceled)

      //   await registry.connect(admin).cancelUpkeep(id)

      //   canceled = await registry.callStatic.getCanceledUpkeepList()
      //   assert.deepEqual([id], canceled)
      // })

      it("reverts if called again by the admin", async () => {
        await registry.connect(admin).cancelUpkeep(id);

        await evmRevert(registry.connect(admin).cancelUpkeep(id));
      });

      // it('does not revert or double add the cancellation record if called by the owner immediately after', async () => {
      //   await registry.connect(admin).cancelUpkeep(id)

      //   await registry.connect(owner).cancelUpkeep(id)

      //   const canceled = await registry.callStatic.getCanceledUpkeepList()
      //   assert.deepEqual([id], canceled)
      // })

      it("reverts if called by the owner after the timeout", async () => {
        await registry.connect(admin).cancelUpkeep(id);

        for (let i = 0; i < delay; i++) {
          await ethers.provider.send("evm_mine", []);
        }

        await evmRevert(registry.connect(owner).cancelUpkeep(id));
      });
    });
  });

  describe("#transferPayeeship", () => {
    it("reverts when called by anyone but the current payee", async () => {
      await evmRevert(
        registry.connect(payee2).transferPayeeship(await keeper1.getAddress(), await payee2.getAddress()),
      );
    });

    it("reverts when transferring to self", async () => {
      await evmRevert(
        registry.connect(payee1).transferPayeeship(await keeper1.getAddress(), await payee1.getAddress()),
      );
    });

    it("does not change the payee", async () => {
      await registry.connect(payee1).transferPayeeship(await keeper1.getAddress(), await payee2.getAddress());

      const info = await registry.getKeeperInfo(await keeper1.getAddress());
      assert.equal(await payee1.getAddress(), info.payee);
    });

    it("emits an event announcing the new payee", async () => {
      const tx = await registry
        .connect(payee1)
        .transferPayeeship(await keeper1.getAddress(), await payee2.getAddress());
      await expect(tx)
        .to.emit(registry, "PayeeshipTransferRequested")
        .withArgs(await keeper1.getAddress(), await payee1.getAddress(), await payee2.getAddress());
    });

    it("does not emit an event when called with the same proposal", async () => {
      await registry.connect(payee1).transferPayeeship(await keeper1.getAddress(), await payee2.getAddress());

      const tx = await registry
        .connect(payee1)
        .transferPayeeship(await keeper1.getAddress(), await payee2.getAddress());
      const receipt = await tx.wait();
      assert.equal(0, receipt.logs.length);
    });
  });

  describe("#acceptPayeeship", () => {
    beforeEach(async () => {
      await registry.connect(payee1).transferPayeeship(await keeper1.getAddress(), await payee2.getAddress());
    });

    it("reverts when called by anyone but the proposed payee", async () => {
      await evmRevert(
        registry.connect(payee1).acceptPayeeship(await keeper1.getAddress()),
      );
    });

    it("emits an event announcing the new payee", async () => {
      const tx = await registry.connect(payee2).acceptPayeeship(await keeper1.getAddress());
      await expect(tx)
        .to.emit(registry, "PayeeshipTransferred")
        .withArgs(await keeper1.getAddress(), await payee1.getAddress(), await payee2.getAddress());
    });

    it("does change the payee", async () => {
      await registry.connect(payee2).acceptPayeeship(await keeper1.getAddress());

      const info = await registry.getKeeperInfo(await keeper1.getAddress());
      assert.equal(await payee2.getAddress(), info.payee);
    });
  });

  describe("#setConfig", () => {
    const checks = BigNumber.from(3);
    const maxGas = BigNumber.from(6);
    const fbGasEth = BigNumber.from(7);
    const fbLinkEth = BigNumber.from(8);

    it("reverts when called by anyone but the proposed owner", async () => {
      await evmRevert(
        registry.connect(payee1).setConfig({
          blockCountPerTurn: checks,
          checkGasLimit: maxGas,
          maxPerformGas,
        }),
        "Only callable by owner",
      );
    });

    it("updates the config", async () => {
      const old = (await registry.getState()).config;
      assert.isTrue(blockCountPerTurn.eq(old.blockCountPerTurn));

      await registry.connect(owner).setConfig({
        blockCountPerTurn: checks,
        checkGasLimit: maxGas,
        maxPerformGas,
      });

      const updated = (await registry.getState()).config;
      assert.equal(updated.blockCountPerTurn, checks.toNumber());
      assert.equal(updated.checkGasLimit, maxGas.toNumber());
    });

    it("emits an event", async () => {
      const tx = await registry.connect(owner).setConfig({
        blockCountPerTurn: checks,
        checkGasLimit: maxGas,
        maxPerformGas,
      });
      await expect(tx).to.emit(registry, "ConfigSet").withArgs([checks, maxGas, maxPerformGas]);
    });
  });

  describe("#pause", () => {
    it("reverts if called by a non-owner", async () => {
      await evmRevert(registry.connect(keeper1).pause(), "Only callable by owner");
    });

    it("marks the contract as paused", async () => {
      assert.isFalse(await registry.paused());

      await registry.connect(owner).pause();

      assert.isTrue(await registry.paused());
    });
  });

  describe("#unpause", () => {
    beforeEach(async () => {
      await registry.connect(owner).pause();
    });

    it("reverts if called by a non-owner", async () => {
      await evmRevert(registry.connect(keeper1).unpause(), "Only callable by owner");
    });

    it("marks the contract as not paused", async () => {
      assert.isTrue(await registry.paused());

      await registry.connect(owner).unpause();

      assert.isFalse(await registry.paused());
    });
  });
});
