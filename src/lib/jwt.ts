import { SignJWT, jwtVerify, type JWTPayload } from "jose";

const getSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET environment variable is not set");
  }
  return new TextEncoder().encode(secret);
};

export interface UserPayload extends JWTPayload {
  sub: string;
  email: string;
  role: string;
}

export async function signToken(payload: { sub: string; email: string; role: string }): Promise<string> {
  const expiresIn = process.env.JWT_EXPIRES_IN || "7d";
  return new SignJWT(payload as JWTPayload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .setSubject(payload.sub)
    .sign(getSecret());
}

export async function verifyToken(token: string): Promise<UserPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload as UserPayload;
  } catch {
    return null;
  }
}

export async function verifyTokenOrThrow(token: string): Promise<UserPayload> {
  const payload = await verifyToken(token);
  if (!payload) {
    throw new Error("Invalid or expired token");
  }
  return payload;
}
