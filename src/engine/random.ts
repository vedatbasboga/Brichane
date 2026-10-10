// Rastgele sayı üreteçleri. Tüm dağıtımlar bu arayüz üzerinden yapılır.

export interface Rng {
  /** [0, 2^32) aralığında tam sayı. */
  nextUint32(): number
}

const UINT32_RANGE = 2 ** 32

/** [0, n) aralığında taraflılık olmadan tam sayı (reddetme ile). */
export function randomInt(rng: Rng, n: number): number {
  if (!Number.isInteger(n) || n <= 0 || n > UINT32_RANGE) {
    throw new RangeError(`randomInt: invalid bound ${n}`)
  }
  const limit = UINT32_RANGE - (UINT32_RANGE % n)
  let x: number
  do {
    x = rng.nextUint32()
  } while (x >= limit)
  return x % n
}

/** `crypto.getRandomValues` tabanlı, tekrar üretilemeyen üreteç. */
export function cryptoRng(): Rng {
  const buffer = new Uint32Array(256)
  let index = buffer.length
  return {
    nextUint32() {
      if (index === buffer.length) {
        globalThis.crypto.getRandomValues(buffer)
        index = 0
      }
      return buffer[index++]
    },
  }
}

/** Tohumlu üreteç: aynı tohum her zaman aynı diziyi verir (cyrb128 + sfc32). */
export function seededRng(seed: string): Rng {
  let [a, b, c, d] = cyrb128(seed)
  const next = () => {
    d = (d + 1) | 0
    const t = (((a + b) | 0) + d) | 0
    a = b ^ (b >>> 9)
    b = (c + (c << 3)) | 0
    c = (c << 21) | (c >>> 11)
    c = (c + t) | 0
    return t >>> 0
  }
  for (let i = 0; i < 15; i++) next()
  return { nextUint32: next }
}

// Karışabilecek karakterler (0/O, 1/I/L) çıkarıldı; tohum elle yazılıp paylaşılabilsin.
const SEED_ALPHABET = 'abcdefghjkmnpqrstuvwxyz23456789'

/** Kullanıcıya gösterilebilecek kısa rastgele tohum. */
export function randomSeed(length = 8, rng: Rng = cryptoRng()): string {
  let seed = ''
  for (let i = 0; i < length; i++) seed += SEED_ALPHABET[randomInt(rng, SEED_ALPHABET.length)]
  return seed
}

function cyrb128(str: string): [number, number, number, number] {
  let h1 = 1779033703
  let h2 = 3144134277
  let h3 = 1013904242
  let h4 = 2773480762
  for (let i = 0; i < str.length; i++) {
    const k = str.charCodeAt(i)
    h1 = h2 ^ Math.imul(h1 ^ k, 597399067)
    h2 = h3 ^ Math.imul(h2 ^ k, 2869860233)
    h3 = h4 ^ Math.imul(h3 ^ k, 951274213)
    h4 = h1 ^ Math.imul(h4 ^ k, 2716044179)
  }
  h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067)
  h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233)
  h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213)
  h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179)
  h1 ^= h2 ^ h3 ^ h4
  h2 ^= h1
  h3 ^= h1
  h4 ^= h1
  return [h1 >>> 0, h2 >>> 0, h3 >>> 0, h4 >>> 0]
}
