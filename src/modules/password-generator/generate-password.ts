const CHARS = {
  uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  lowercase: "abcdefghijklmnopqrstuvwxyz",
  numbers: "0123456789",
  symbols: "!@#$%^&*()-_=+[]{}|;:,.<>?/~",
} as const;

export type PasswordOptions = {
  length: number;
  uppercase: boolean;
  lowercase: boolean;
  numbers: boolean;
  symbols: boolean;
};

export type StrengthResult = {
  score: number; // 0–4
  label: string;
  entropy: number;
};

/** Cryptographically random integer in [0, max) */
function randomInt(max: number): number {
  const buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  // Use rejection sampling to avoid modulo bias
  const limit = 2 ** 32 - ((2 ** 32) % max);
  let val = buf[0];
  while (val >= limit) {
    crypto.getRandomValues(buf);
    val = buf[0];
  }
  return val % max;
}

export function generatePassword(options: PasswordOptions): string {
  const { length, uppercase, lowercase, numbers, symbols } = options;

  let charset = "";
  const guaranteed: string[] = [];

  if (uppercase) {
    charset += CHARS.uppercase;
    guaranteed.push(CHARS.uppercase[randomInt(CHARS.uppercase.length)]);
  }
  if (lowercase) {
    charset += CHARS.lowercase;
    guaranteed.push(CHARS.lowercase[randomInt(CHARS.lowercase.length)]);
  }
  if (numbers) {
    charset += CHARS.numbers;
    guaranteed.push(CHARS.numbers[randomInt(CHARS.numbers.length)]);
  }
  if (symbols) {
    charset += CHARS.symbols;
    guaranteed.push(CHARS.symbols[randomInt(CHARS.symbols.length)]);
  }

  if (!charset) return "";

  const fillLength = Math.max(0, length - guaranteed.length);
  const rest = Array.from({ length: fillLength }, () => charset[randomInt(charset.length)]);

  // Fisher-Yates shuffle for uniform distribution
  const all = [...guaranteed, ...rest];
  for (let i = all.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [all[i], all[j]] = [all[j], all[i]];
  }

  return all.join("");
}

export function calculateStrength(options: PasswordOptions): StrengthResult {
  const { length, uppercase, lowercase, numbers, symbols } = options;

  let charsetSize = 0;
  if (uppercase) charsetSize += CHARS.uppercase.length;
  if (lowercase) charsetSize += CHARS.lowercase.length;
  if (numbers) charsetSize += CHARS.numbers.length;
  if (symbols) charsetSize += CHARS.symbols.length;

  if (charsetSize === 0) return { score: 0, label: "—", entropy: 0 };

  const entropy = length * Math.log2(charsetSize);

  if (entropy < 40) return { score: 1, label: "Weak", entropy };
  if (entropy < 60) return { score: 2, label: "Fair", entropy };
  if (entropy < 80) return { score: 3, label: "Good", entropy };
  if (entropy < 100) return { score: 4, label: "Strong", entropy };
  return { score: 5, label: "Very Strong", entropy };
}
