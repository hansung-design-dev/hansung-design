type NiceKeyRecord = {
  key: string;
  iv: string;
  hmacKey: string;
  expiresAt: number;
};

const store = new Map<string, NiceKeyRecord>();

export function saveNiceKey(
  keyId: string,
  key: string,
  iv: string,
  hmacKey: string,
  ttlMs = 15 * 60 * 1000
) {
  store.set(keyId, {
    key,
    iv,
    hmacKey,
    expiresAt: Date.now() + ttlMs,
  });
}

export function loadNiceKey(keyId: string) {
  const record = store.get(keyId);
  if (!record) {
    return null;
  }
  if (Date.now() > record.expiresAt) {
    store.delete(keyId);
    return null;
  }
  return {
    key: record.key,
    iv: record.iv,
    hmacKey: record.hmacKey,
  };
}
