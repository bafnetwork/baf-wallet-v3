import { Encoding, PublicKey, SecretKey } from '@baf-wallet/interfaces';
import { encodeBytes, formatBytes } from '@baf-wallet/utils';

export function pkToString<Curve>(
  key: PublicKey<Curve>,
  keyFormat = Encoding.HEX
): string {
  return formatBytes(key.data, keyFormat) as string;
}

export function pkFromString<Curve>(
  key: string,
  curve: Curve,
  keyFormat = Encoding.HEX
): PublicKey<Curve> {
  const data = encodeBytes(key, keyFormat);
  return {
    data,
    curve,
    format: (fmt: Encoding) => formatBytes(data, fmt),
  };
}

export function skFromString<Curve>(
  key: string,
  curve: Curve,
  keyFormat = Encoding.HEX
): SecretKey<Curve> {
  const data = encodeBytes(key, keyFormat);
  return {
    data,
    curve,
    format: (fmt: Encoding) => formatBytes(data, fmt),
  };
}
