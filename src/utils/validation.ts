import { PublicKey } from '@solana/web3.js';

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export function validatePublicKey(key: string): PublicKey {
  try {
    return new PublicKey(key);
  } catch (error) {
    throw new ValidationError(`Invalid public key: ${key}`);
  }
}

export function validateAmount(amount: number): void {
  if (amount <= 0) {
    throw new ValidationError('Amount must be greater than 0');
  }
  if (!Number.isFinite(amount)) {
    throw new ValidationError('Amount must be a finite number');
  }
}

export function validateSlippage(slippageBps: number): void {
  if (slippageBps < 0 || slippageBps > 10000) {
    throw new ValidationError('Slippage must be between 0 and 10000 basis points');
  }
}

export function validatePrivateKey(privateKey: string): void {
  if (!privateKey || typeof privateKey !== 'string' || privateKey.length !== 88) {
    throw new ValidationError('Invalid private key format');
  }
}

export function validateRpcUrl(url: string): void {
  try {
    new URL(url);
  } catch {
    throw new ValidationError('Invalid RPC URL');
  }
}