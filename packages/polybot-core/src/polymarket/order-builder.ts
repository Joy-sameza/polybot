import { ethers } from 'ethers';
import { SignedOrder, OrderSide, orderSideToEip712Value } from '../domain';
import { signOrder } from '../crypto';
import { contractConfigForChainId } from './contracts';

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

interface RoundConfig {
  priceDecimals: number;
  sizeDecimals: number;
  amountDecimals: number;
}

function roundConfigFromTickSize(tickSize: number): RoundConfig {
  const priceDecimals = Math.max(0, decimalPlaces(tickSize));
  return { priceDecimals, sizeDecimals: 2, amountDecimals: priceDecimals + 2 };
}

function decimalPlaces(value: number): number {
  const s = stripTrailingZeros(value.toString());
  const dotIndex = s.indexOf('.');
  if (dotIndex < 0) return 0;
  return s.length - dotIndex - 1;
}

function stripTrailingZeros(s: string): string {
  if (!s.includes('.')) return s;
  let end = s.length;
  while (end > 0 && s[end - 1] === '0') end--;
  if (end > 0 && s[end - 1] === '.') end--;
  return s.substring(0, end);
}

function roundHalfUp(value: number, decimals: number): number {
  if (decimalPlaces(value) <= decimals) return value;
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

function roundDown(value: number, decimals: number): number {
  if (decimalPlaces(value) <= decimals) return value;
  const factor = Math.pow(10, decimals);
  return Math.floor(value * factor) / factor;
}

function roundUp(value: number, decimals: number): number {
  if (decimalPlaces(value) <= decimals) return value;
  const factor = Math.pow(10, decimals);
  return Math.ceil(value * factor) / factor;
}

function clampAmountDecimals(amount: number, maxDecimals: number): number {
  if (decimalPlaces(amount) <= maxDecimals) return amount;
  const roundedUp = roundUp(amount, maxDecimals + 4);
  if (decimalPlaces(roundedUp) > maxDecimals) {
    return roundDown(roundedUp, maxDecimals);
  }
  return roundedUp;
}

function toBaseUnits(amount: number, decimals: number): string {
  if (decimalPlaces(amount) > decimals) {
    throw new Error(`Amount has more than ${decimals} decimals: ${amount}`);
  }
  const scaled = Math.round(amount * Math.pow(10, decimals));
  return scaled.toString();
}

function validatePrice(price: number, tickSize: number): void {
  if (price == null) throw new Error('price must not be null');
  if (tickSize == null) throw new Error('tickSize must not be null');
  const min = tickSize;
  const max = 1 - tickSize;
  if (price < min || price > max) {
    throw new Error(`price must be within [${min}, ${max}]`);
  }
}

export class PolymarketOrderBuilder {
  private readonly chainId: number;
  private readonly signer: ethers.Wallet;
  private readonly signatureType: number;
  private readonly funderAddress: string | undefined;

  constructor(
    chainId: number,
    signer: ethers.Wallet,
    signatureType: number,
    funderAddress?: string,
  ) {
    this.chainId = chainId;
    this.signer = signer;
    this.signatureType = signatureType;
    this.funderAddress =
      funderAddress && funderAddress.trim().length > 0 ? funderAddress : undefined;
  }

  async buildLimitOrder(
    tokenId: string,
    side: OrderSide,
    price: number,
    size: number,
    tickSize: number,
    negRisk: boolean,
    feeRateBps?: number,
    nonce?: number,
    expirationSeconds?: number,
    taker?: string,
  ): Promise<SignedOrder> {
    validatePrice(price, tickSize);

    const rc = roundConfigFromTickSize(tickSize);
    const rawPrice = roundHalfUp(price, rc.priceDecimals);

    let rawMakerAmt: number;
    let rawTakerAmt: number;
    if (side === OrderSide.BUY) {
      rawTakerAmt = roundDown(size, rc.sizeDecimals);
      rawMakerAmt = clampAmountDecimals(rawTakerAmt * rawPrice, rc.amountDecimals);
    } else {
      rawMakerAmt = roundDown(size, rc.sizeDecimals);
      rawTakerAmt = clampAmountDecimals(rawMakerAmt * rawPrice, rc.amountDecimals);
    }

    const collateralDecimals = contractConfigForChainId(this.chainId).collateralTokenDecimals;
    return this.signOrderInternal(
      tokenId,
      side,
      toBaseUnits(rawMakerAmt, collateralDecimals),
      toBaseUnits(rawTakerAmt, collateralDecimals),
      negRisk,
      feeRateBps,
      nonce,
      expirationSeconds,
      taker,
    );
  }

  async buildMarketOrder(
    tokenId: string,
    side: OrderSide,
    amount: number,
    price: number,
    tickSize: number,
    negRisk: boolean,
    feeRateBps?: number,
    nonce?: number,
    taker?: string,
  ): Promise<SignedOrder> {
    validatePrice(price, tickSize);

    const rc = roundConfigFromTickSize(tickSize);
    const rawPrice = roundDown(price, rc.priceDecimals);

    let rawMakerAmt: number;
    let rawTakerAmt: number;
    if (side === OrderSide.BUY) {
      rawMakerAmt = roundDown(amount, rc.sizeDecimals);
      rawTakerAmt = clampAmountDecimals(rawMakerAmt / rawPrice, rc.amountDecimals);
    } else {
      rawMakerAmt = roundDown(amount, rc.sizeDecimals);
      rawTakerAmt = clampAmountDecimals(rawMakerAmt * rawPrice, rc.amountDecimals);
    }

    const collateralDecimals = contractConfigForChainId(this.chainId).collateralTokenDecimals;
    return this.signOrderInternal(
      tokenId,
      side,
      toBaseUnits(rawMakerAmt, collateralDecimals),
      toBaseUnits(rawTakerAmt, collateralDecimals),
      negRisk,
      feeRateBps,
      nonce,
      0,
      taker,
    );
  }

  private async signOrderInternal(
    tokenId: string,
    side: OrderSide,
    makerAmount: string,
    takerAmount: string,
    negRisk: boolean,
    feeRateBps?: number,
    nonce?: number,
    expirationSeconds?: number,
    taker?: string,
  ): Promise<SignedOrder> {
    const contractConfig = contractConfigForChainId(this.chainId);
    const exchangeContract = negRisk
      ? contractConfig.negRiskExchange
      : contractConfig.exchange;

    const signerAddress = this.signer.address;
    const makerAddress = this.funderAddress ?? signerAddress;
    const takerAddress =
      taker && taker.trim().length > 0 ? taker : ZERO_ADDRESS;

    const salt = Math.round(Math.random() * Date.now()).toString();

    const unsignedOrder: SignedOrder = {
      salt,
      maker: makerAddress,
      signer: signerAddress,
      taker: takerAddress,
      tokenId,
      makerAmount,
      takerAmount,
      expiration: (expirationSeconds ?? 0).toString(),
      nonce: (nonce ?? 0).toString(),
      feeRateBps: (feeRateBps ?? 0).toString(),
      side,
      signatureType: this.signatureType,
      signature: '',
    };

    const signature = await signOrder(
      this.signer,
      this.chainId,
      exchangeContract,
      unsignedOrder.salt,
      unsignedOrder.maker,
      unsignedOrder.signer,
      unsignedOrder.taker,
      unsignedOrder.tokenId,
      unsignedOrder.makerAmount,
      unsignedOrder.takerAmount,
      unsignedOrder.expiration,
      unsignedOrder.nonce,
      unsignedOrder.feeRateBps,
      orderSideToEip712Value(unsignedOrder.side),
      unsignedOrder.signatureType,
    );

    return { ...unsignedOrder, signature };
  }
}
