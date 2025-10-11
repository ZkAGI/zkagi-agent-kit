import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import bs58 from "bs58";
import Decimal from "decimal.js";
import { BN } from "@coral-xyz/anchor";
import { DEFAULT_OPTIONS } from "../constants";

// === NEW: PrivacyCash import
import { PrivacyCash } from "privacycash";

import {
  deploy_collection,
  deploy_token,
  get_balance,
  getTPS,
  resolveSolDomain,
  getPrimaryDomain,
  launchPumpFunToken,
  lendAsset,
  mintCollectionNFT,
  openbookCreateMarket,
  raydiumCreateAmmV4,
  raydiumCreateClmm,
  raydiumCreateCpmm,
  registerDomain,
  request_faucet_funds,
  trade,
  transfer,
  getTokenDataByAddress,
  getTokenDataByTicker,
  stakeWithJup,
  sendCompressedAirdrop,
  createOrcaSingleSidedWhirlpool,
  FEE_TIERS,
  pythFetchPrice,
} from "../tools";
import { CollectionOptions, PumpFunTokenOptions } from "../types";

/**
 * Main class for interacting with Solana blockchain
 * Provides a unified interface for token operations, NFT management, and trading
 *
 * @class SolanaAgentKit
 * @property {Connection} connection - Solana RPC connection
 * @property {Keypair} wallet - Wallet keypair for signing transactions
 * @property {PublicKey} wallet_address - Public key of the wallet
 */
export class SolanaAgentKit {
  public connection: Connection;
  public wallet: Keypair;
  public wallet_address: PublicKey;
  // public openai_api_key: string;
  public zkagi_api_key: string;

  // === NEW: PrivacyCash client (optional)
  private privacyCash?: PrivacyCash;

  /**
   * @param private_key base58-encoded secret key (64-byte keypair in bs58)
   * @param rpc_url Solana RPC. NOTE: PrivacyCash generally expects MAINNET RPC.
   * @param zkagi_api_key your app key (unchanged)
   * @param privacyCashEnabled if true, initialize PrivacyCash
   * @param privacyCashRpcUrl optional dedicated MAINNET RPC URL for PrivacyCash (recommended)
   */
  constructor(
    private_key: string,
    rpc_url = "https://api.testnet.solana.com",
    // openai_api_key: string,
    zkagi_api_key: string,
    privacyCashEnabled: boolean = true,
    privacyCashRpcUrl?: string
  ) {
    this.connection = new Connection(rpc_url);
    this.wallet = Keypair.fromSecretKey(bs58.decode(private_key));
    this.wallet_address = this.wallet.publicKey;
    // this.openai_api_key = openai_api_key;
    this.zkagi_api_key = zkagi_api_key;

    // === NEW: Initialize PrivacyCash (non-breaking; can be toggled off)
    if (privacyCashEnabled) {
      this.privacyCash = new PrivacyCash({
        RPC_url: privacyCashRpcUrl ?? rpc_url, // strongly recommend a MAINNET RPC here
        owner: private_key, // PrivacyCash expects the private key string; matches your reference example
      });
    }
  }

  // =========================
  // EXISTING TOOL METHODS
  // =========================

  async requestFaucetFunds() {
    return request_faucet_funds(this);
  }

  async deployToken(
    name: string,
    uri: string,
    symbol: string,
    decimals: number = DEFAULT_OPTIONS.TOKEN_DECIMALS,
    initialSupply?: number
  ) {
    return deploy_token(this, name, uri, symbol, decimals, initialSupply);
  }

  async deployCollection(options: CollectionOptions) {
    return deploy_collection(this, options);
  }

  async getBalance(token_address?: PublicKey) {
    return get_balance(this, token_address);
  }

  async mintNFT(
    collectionMint: PublicKey,
    metadata: Parameters<typeof mintCollectionNFT>[2],
    recipient?: PublicKey
  ) {
    return mintCollectionNFT(this, collectionMint, metadata, recipient);
  }

  async transfer(to: PublicKey, amount: number, mint?: PublicKey) {
    return transfer(this, to, amount, mint);
  }

  async registerDomain(name: string, spaceKB?: number) {
    return registerDomain(this, name, spaceKB);
  }

  async resolveSolDomain(domain: string) {
    return resolveSolDomain(this, domain);
  }

  async getPrimaryDomain(account: PublicKey) {
    return getPrimaryDomain(this, account);
  }

  async trade(
    outputMint: PublicKey,
    inputAmount: number,
    inputMint?: PublicKey,
    slippageBps: number = DEFAULT_OPTIONS.SLIPPAGE_BPS
  ) {
    return trade(this, outputMint, inputAmount, inputMint, slippageBps);
  }

  async lendAssets(amount: number) {
    return lendAsset(this, amount);
  }

  async getTPS() {
    return getTPS(this);
  }

  async getTokenDataByAddress(mint: string) {
    return getTokenDataByAddress(new PublicKey(mint));
  }

  async getTokenDataByTicker(ticker: string) {
    return getTokenDataByTicker(ticker);
  }

  async launchPumpFunToken(
    tokenName: string,
    tokenTicker: string,
    description: string,
    imageUrl: string,
    options?: PumpFunTokenOptions
  ) {
    return launchPumpFunToken(
      this,
      tokenName,
      tokenTicker,
      description,
      imageUrl,
      options
    );
  }

  async stake(amount: number) {
    return stakeWithJup(this, amount);
  }

  async sendCompressedAirdrop(
    mintAddress: string,
    amount: number,
    decimals: number,
    recipients: string[],
    priorityFeeInLamports: number,
    shouldLog: boolean
  ): Promise<string[]> {
    return await sendCompressedAirdrop(
      this,
      new PublicKey(mintAddress),
      amount,
      decimals,
      recipients.map((recipient) => new PublicKey(recipient)),
      priorityFeeInLamports,
      shouldLog
    );
  }

  async createOrcaSingleSidedWhirlpool(
    depositTokenAmount: BN,
    depositTokenMint: PublicKey,
    otherTokenMint: PublicKey,
    initialPrice: Decimal,
    maxPrice: Decimal,
    feeTier: keyof typeof FEE_TIERS
  ) {
    return createOrcaSingleSidedWhirlpool(
      this,
      depositTokenAmount,
      depositTokenMint,
      otherTokenMint,
      initialPrice,
      maxPrice,
      feeTier
    );
  }

  async raydiumCreateAmmV4(
    marketId: PublicKey,
    baseAmount: BN,
    quoteAmount: BN,
    startTime: BN
  ) {
    return raydiumCreateAmmV4(this, marketId, baseAmount, quoteAmount, startTime);
  }

  async raydiumCreateClmm(
    mint1: PublicKey,
    mint2: PublicKey,
    configId: PublicKey,
    initialPrice: Decimal,
    startTime: BN
  ) {
    return raydiumCreateClmm(this, mint1, mint2, configId, initialPrice, startTime);
  }

  async raydiumCreateCpmm(
    mint1: PublicKey,
    mint2: PublicKey,
    configId: PublicKey,
    mintAAmount: BN,
    mintBAmount: BN,
    startTime: BN
  ) {
    return raydiumCreateCpmm(
      this,
      mint1,
      mint2,
      configId,
      mintAAmount,
      mintBAmount,
      startTime
    );
  }

  async openbookCreateMarket(
    baseMint: PublicKey,
    quoteMint: PublicKey,
    lotSize: number = 1,
    tickSize: number = 0.01
  ) {
    return openbookCreateMarket(this, baseMint, quoteMint, lotSize, tickSize);
  }

  async pythFetchPrice(priceFeedID: string) {
    return pythFetchPrice(this, priceFeedID);
  }

  // =========================
  // NEW: PrivacyCash helpers
  // =========================

  /**
   * Clear local UTXO cache (optional maintenance)
   */
  async privacyCashClearCache() {
    if (!this.privacyCash) throw new Error("PrivacyCash not initialized.");
    // matches the reference comment
    // historical utxos will be cached locally for faster performance.
    // you don't need to call clearCache() unless you encountered some issues and want to do a full refresh.
    // client.clearCache()
    // expose for parity:
    // @ts-ignore - method exists in library per reference
    return this.privacyCash.clearCache?.();
  }

  /**
   * Get private balance (lamports + SOL)
   */
  async getPrivateBalance() {
    if (!this.privacyCash) throw new Error("PrivacyCash not initialized.");
    const res = await this.privacyCash.getPrivateBalance();
    // res is expected to have { lamports: number, ... }
    return res;
  }

  /**
   * Deposit SOL privately
   * @param sol amount in SOL (e.g., 0.02). Convenience wrapper converts to lamports.
   */
  async depositPrivate(sol: number) {
    if (!this.privacyCash) throw new Error("PrivacyCash not initialized.");
    const lamports = Math.floor(sol * 1_000_000_000);
    const depositRes = await this.privacyCash.deposit({ lamports });
    return depositRes;
  }

  /**
   * Withdraw SOL privately
   * @param sol amount in SOL (e.g., 0.01)
   * @param recipient base58 address string
   */
  async withdrawPrivate(sol: number, recipient: string) {
    if (!this.privacyCash) throw new Error("PrivacyCash not initialized.");
    const lamports = Math.floor(sol * 1_000_000_000);
    const withdrawRes = await this.privacyCash.withdraw({
      lamports,
      recipientAddress: recipient,
    });
    return withdrawRes;
  }
}

