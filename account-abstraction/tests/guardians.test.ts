import { describe, it, expect } from 'vitest';
import { Cl } from '@stacks/transactions';
import { initSimnet } from '@hirosystems/clarinet-sdk';

let simnet: Awaited<ReturnType<typeof initSimnet>>;

beforeAll(async () => {
  simnet = await initSimnet();
});

describe('Membership Smart Contract - Guardian Management', () => {
  const contractName = 'membership'; // Replace with your actual contract name

  const accounts = simnet.getAccounts();
  const deployer = accounts.get('deployer')!;
  const wallet1 = accounts.get('wallet_1')!;
  const wallet2 = accounts.get('wallet_2')!;
  const wallet3 = accounts.get('wallet_3')!;

  it('should add a new guardian successfully', () => {
    const result = simnet.callPublicFn(
      contractName,
      'add-guardian',
      [Cl.principal(wallet1)],
      deployer
    );
    expect(result.result).toEqual(Cl.ok(Cl.bool(true)));

    const isGuardian = simnet.callReadOnlyFn(
      contractName,
      'is-guardian',
      [Cl.principal(wallet1)],
      deployer
    );
    expect(isGuardian.result).toEqual(Cl.bool(true));
  });

  it('should prevent adding the same guardian twice', () => {
    const result = simnet.callPublicFn(
      contractName,
      'add-guardian',
      [Cl.principal(wallet1)],
      deployer
    );
    expect(result.result).toEqual(Cl.err(Cl.uint(101))); // ERR_ALREADY_GUARDIAN
  });

  it('should enable a guardian', () => {
    const result = simnet.callPublicFn(
      contractName,
      'enable-guardian',
      [Cl.principal(wallet1)],
      deployer
    );
    expect(result.result).toEqual(Cl.ok(Cl.bool(true)));

    const status = simnet.callReadOnlyFn(
      contractName,
      'is-guardian-enabled',
      [Cl.principal(wallet1)],
      deployer
    );
    expect(status.result).toEqual(Cl.bool(true));
  });

  it('should disable a guardian', () => {
    const result = simnet.callPublicFn(
      contractName,
      'disable-guardian',
      [Cl.principal(wallet1)],
      deployer
    );
    expect(result.result).toEqual(Cl.ok(Cl.bool(true)));

    const status = simnet.callReadOnlyFn(
      contractName,
      'is-guardian-enabled',
      [Cl.principal(wallet1)],
      deployer
    );
    expect(status.result).toEqual(Cl.bool(false));
  });

  it('should remove a guardian successfully', () => {
    const result = simnet.callPublicFn(
      contractName,
      'remove-guardian',
      [Cl.principal(wallet1)],
      deployer
    );
    expect(result.result).toEqual(Cl.ok(Cl.bool(true)));

    const isGuardian = simnet.callReadOnlyFn(
      contractName,
      'is-guardian',
      [Cl.principal(wallet1)],
      deployer
    );
    expect(isGuardian.result).toEqual(Cl.bool(false));
  });

  it('should prevent unauthorized users from adding guardians', () => {
    const result = simnet.callPublicFn(
      contractName,
      'add-guardian',
      [Cl.principal(wallet2)],
      wallet3
    );
    expect(result.result).toEqual(Cl.err(Cl.uint(100))); // ERR_UNAUTHORIZED
  });

  it('should prevent enabling a non-existent guardian', () => {
    const result = simnet.callPublicFn(
      contractName,
      'enable-guardian',
      [Cl.principal(wallet2)],
      deployer
    );
    expect(result.result).toEqual(Cl.err(Cl.uint(102))); // ERR_NOT_A_GUARDIAN
  });

  it('should prevent disabling a non-existent guardian', () => {
    const result = simnet.callPublicFn(
      contractName,
      'disable-guardian',
      [Cl.principal(wallet2)],
      deployer
    );
    expect(result.result).toEqual(Cl.err(Cl.uint(102))); // ERR_NOT_A_GUARDIAN
  });

  it('should prevent removing a non-existent guardian', () => {
    const result = simnet.callPublicFn(
      contractName,
      'remove-guardian',
      [Cl.principal(wallet2)],
      deployer
    );
    expect(result.result).toEqual(Cl.err(Cl.uint(102))); // ERR_NOT_A_GUARDIAN
  });
});
