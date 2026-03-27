import { ethers } from 'ethers';
import { ApiCreds } from '../domain';
import { signClobAuth, polyHmacSign } from '../crypto';

export async function l1(
  signer: ethers.Wallet,
  chainId: number,
  timestampSeconds: number,
  nonce: number,
): Promise<Record<string, string>> {
  const address = signer.address;
  const signature = await signClobAuth(signer, chainId, timestampSeconds, nonce);
  return {
    POLY_ADDRESS: address,
    POLY_SIGNATURE: signature,
    POLY_TIMESTAMP: timestampSeconds.toString(),
    POLY_NONCE: nonce.toString(),
  };
}

export function l2(
  signer: ethers.Wallet,
  creds: ApiCreds,
  timestampSeconds: number,
  method: string,
  requestPath: string,
  body: string | null,
): Record<string, string> {
  const address = signer.address;
  const sig = polyHmacSign(creds.secret, timestampSeconds, method, requestPath, body);
  return {
    POLY_ADDRESS: address,
    POLY_SIGNATURE: sig,
    POLY_TIMESTAMP: timestampSeconds.toString(),
    POLY_API_KEY: creds.key,
    POLY_PASSPHRASE: creds.passphrase,
  };
}
