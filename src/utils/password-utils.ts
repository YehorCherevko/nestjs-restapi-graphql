import * as crypto from "crypto";

export async function hashPassword(
  password: string,
  salt: string
): Promise<string> {
  const iterations = 10000;
  const keyLength = 64;
  const digest = "sha512";

  return new Promise((resolve, reject) => {
    crypto.pbkdf2(
      password,
      salt,
      iterations,
      keyLength,
      digest,
      (err, derivedKey) => {
        if (err) {
          reject(err);
        } else {
          const hashPassword = derivedKey.toString("hex");
          resolve(hashPassword);
        }
      }
    );
  });
}

export async function verifyPassword(
  providedPassword: string,
  storedHashedPassword: string,
  salt: string
): Promise<boolean> {
  const hashedPassword = await hashPassword(providedPassword, salt);
  return hashedPassword === storedHashedPassword;
}
