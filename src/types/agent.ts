import { PublicKey } from '@solana/web3.js';

export interface AgentConfig {
  privateKey: string;
  rpcUrl?: string;
  commitment?: 'processed' | 'confirmed' | 'finalized';
}

export interface TokenDetails {
  mint: PublicKey;
  decimals: number;
  symbol?: string;
  name?: string;
}

export interface TransactionOptions {
  maxRetries?: number;
  confirmationTime?: number;
  priorityFee?: number;
}

export interface SwapParams {
  inputMint: PublicKey;
  outputMint: PublicKey;
  amount: number;
  slippageBps?: number;
  options?: TransactionOptions;
}

export interface ZkProofParams {
  prover: PublicKey;
  proof: string;
  publicInputs: string[];
  merkleRoot?: string;
}
