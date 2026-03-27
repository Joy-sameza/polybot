import { polyHmacSign } from '../crypto/hmac-signer';

describe('polyHmacSign', () => {
  it('matches official client test vector', () => {
    const signature = polyHmacSign(
      'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=',
      1_000_000,
      'test-sign',
      '/orders',
      '{"hash": "0x123"}',
    );
    expect(signature).toBe('ZwAdJKvoYRlEKDkNMwd5BuwNNtg93kNaR_oU2HrfVvc=');
  });
});
