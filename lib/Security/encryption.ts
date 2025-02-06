
export const ENCRYPTION_KEY_BITS = 128; // 128-bit encryption
export const IV_LENGTH_BYTES = 12; // Recommended length for AES-GCM IVs

export const deriveKeyFromString = async (
  baseString: string
): Promise<CryptoKey> => {
  // Use PBKDF2 to derive a key from the baseString
  const encoder = new TextEncoder();
  const salt = encoder.encode('unique-salt'); // Fixed salt to ensure deterministic key derivation
  const baseKey = await window.crypto.subtle.importKey(
    'raw',
    encoder.encode(baseString),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  return await window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000, // Number of iterations for PBKDF2
      hash: 'SHA-256',
    },
    baseKey,
    {
      name: 'AES-GCM',
      length: ENCRYPTION_KEY_BITS,
    },
    false, // Non-extractable key
    ['encrypt', 'decrypt']
  );
};

export const createIV = (): Uint8Array => {
  const iv = new Uint8Array(IV_LENGTH_BYTES);
  return window.crypto.getRandomValues(iv);
};

export const encrypt = async (
  baseString: string,
  data: string | Uint8Array | ArrayBuffer | Blob
): Promise<{ encryptedBuffer: ArrayBuffer; iv: Uint8Array }> => {
  const key = await deriveKeyFromString(baseString);
  const iv = createIV();

  const buffer: ArrayBuffer =
    typeof data === 'string'
      ? new TextEncoder().encode(data).buffer
      : data instanceof Uint8Array
        ? data.buffer
        : data instanceof Blob
          ? await blobToArrayBuffer(data)
          : data;

  const encryptedBuffer = await window.crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv,
    },
    key,
    buffer
  );

  return { encryptedBuffer, iv };
};

export const decrypt = async (
  baseString: string,
  iv: Uint8Array,
  encryptedBuffer: ArrayBuffer
): Promise<ArrayBuffer> => {
  const key = await deriveKeyFromString(baseString);

  const decryptedBuffer = await window.crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv,
    },
    key,
    encryptedBuffer
  );

  return decryptedBuffer;
};

export const blobToArrayBuffer = async (blob: Blob): Promise<ArrayBuffer> => {
  if ('arrayBuffer' in blob) {
    return blob.arrayBuffer();
  }
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      if (!event.target?.result) {
        return reject(new Error("Couldn't convert blob to ArrayBuffer"));
      }
      resolve(event.target.result as ArrayBuffer);
    };
    reader.readAsArrayBuffer(blob);
  });
};

export const bufferToString = (buffer: ArrayBuffer): string => {
  return new TextDecoder().decode(buffer);
};