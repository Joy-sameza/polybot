import { ethers, TypedDataDomain, TypedDataField } from 'ethers';

/**
 * EIP-712 signer for Polymarket CLOB authentication and order signing.
 * Mirrors the Java Eip712Signer exactly.
 */
export async function signClobAuth(
  signer: ethers.Wallet,
  chainId: number,
  timestampSeconds: number,
  nonce: number,
): Promise<string> {
  const domain: TypedDataDomain = {
    name: 'ClobAuthDomain',
    version: '1',
    chainId,
  };

  const types: Record<string, TypedDataField[]> = {
    ClobAuth: [
      { name: 'address', type: 'address' },
      { name: 'timestamp', type: 'string' },
      { name: 'nonce', type: 'uint256' },
      { name: 'message', type: 'string' },
    ],
  };

  const value = {
    address: signer.address,
    timestamp: timestampSeconds.toString(),
    nonce: BigInt(nonce),
    message: 'This message attests that I control the given wallet',
  };

  return signer.signTypedData(domain, types, value);
}

export async function signOrder(
  signer: ethers.Wallet,
  chainId: number,
  verifyingContract: string,
  salt: string,
  maker: string,
  signerAddress: string,
  taker: string,
  tokenId: string,
  makerAmount: string,
  takerAmount: string,
  expiration: string,
  nonce: string,
  feeRateBps: string,
  side: number,
  signatureType: number,
): Promise<string> {
  const domain: TypedDataDomain = {
    name: 'Polymarket CTF Exchange',
    version: '1',
    chainId,
    verifyingContract,
  };

  const types: Record<string, TypedDataField[]> = {
    Order: [
      { name: 'salt', type: 'uint256' },
      { name: 'maker', type: 'address' },
      { name: 'signer', type: 'address' },
      { name: 'taker', type: 'address' },
      { name: 'tokenId', type: 'uint256' },
      { name: 'makerAmount', type: 'uint256' },
      { name: 'takerAmount', type: 'uint256' },
      { name: 'expiration', type: 'uint256' },
      { name: 'nonce', type: 'uint256' },
      { name: 'feeRateBps', type: 'uint256' },
      { name: 'side', type: 'uint8' },
      { name: 'signatureType', type: 'uint8' },
    ],
  };

  const value = {
    salt: BigInt(salt),
    maker,
    signer: signerAddress,
    taker,
    tokenId: BigInt(tokenId),
    makerAmount: BigInt(makerAmount),
    takerAmount: BigInt(takerAmount),
    expiration: BigInt(expiration),
    nonce: BigInt(nonce),
    feeRateBps: BigInt(feeRateBps),
    side,
    signatureType,
  };

  return signer.signTypedData(domain, types, value);
}
