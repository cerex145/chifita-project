import jwt from "jsonwebtoken";
import type { SignOptions } from "jsonwebtoken";
import type { Role } from "@prisma/client";

export type JwtPayload = {
  sub: string;
  email: string;
  username: string;
  role: Role;
};

export function signAuthToken(payload: JwtPayload) {
  const expiresIn = (process.env.JWT_EXPIRES_IN ?? "7d") as SignOptions["expiresIn"];
  const options: SignOptions = {
    expiresIn,
  };

  return jwt.sign(payload, process.env.JWT_SECRET!, options);
}

export function verifyAuthToken(token: string) {
  return jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
}
