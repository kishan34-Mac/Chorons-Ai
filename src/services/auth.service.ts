import { SignJWT, jwtVerify } from "jose";
import { config } from "../config";
import { userRepository } from "../repositories";
import { IUser } from "../models/user.model";

const SECRET = new TextEncoder().encode(config.JWT_SECRET);

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

export class AuthService {
  async generateToken(user: IUser): Promise<string> {
    return new SignJWT({
      userId: String(user._id),
      email: user.email,
      role: user.role,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime(config.JWT_EXPIRES_IN)
      .sign(SECRET);
  }

  async verifyToken(token: string): Promise<JWTPayload | null> {
    try {
      const { payload } = await jwtVerify(token, SECRET);
      return {
        userId: payload.userId as string,
        email: payload.email as string,
        role: payload.role as string,
      };
    } catch (err) {
      console.error("JWT Verification failed:", err);
      return null;
    }
  }

  async loginWithOAuth(
    provider: "google" | "github",
    profile: { email: string; name: string; avatar?: string },
  ): Promise<{ user: IUser; token: string }> {
    let user = await userRepository.findByEmail(profile.email);

    if (!user) {
      // Create user
      user = await userRepository.create({
        name: profile.name,
        email: profile.email,
        avatar: profile.avatar,
        provider,
        role: "user",
        plan: "free",
        isVerified: true,
        lastLoginAt: new Date(),
      });
    } else {
      // Update last login
      user.lastLoginAt = new Date();
      await user.save();
    }

    const token = await this.generateToken(user);
    return { user, token };
  }

  async requestMagicLink(email: string): Promise<string> {
    // Generate a temporary magic token
    const normalized = email.trim().toLowerCase();
    let user = await userRepository.findByEmail(normalized);

    if (!user) {
      // Create a pending user
      user = await userRepository.create({
        name: normalized.split("@")[0],
        email: normalized,
        provider: "magic-link",
        role: "user",
        plan: "free",
        isVerified: false,
      });
    }

    // Sign a short-lived token (15 mins)
    const token = await new SignJWT({ email: normalized, type: "magic-link" })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("15m")
      .sign(SECRET);

    console.log(
      `[MAGIC LINK EMAIL] To: ${email} | Link: http://localhost:8080/api/auth/verify-magic?token=${token}`,
    );
    return token;
  }

  async verifyMagicLink(token: string): Promise<{ user: IUser; token: string }> {
    try {
      const { payload } = await jwtVerify(token, SECRET);
      if (payload.type !== "magic-link" || !payload.email) {
        throw new Error("Invalid magic token payload");
      }

      const email = payload.email as string;
      const user = await userRepository.findByEmail(email);
      if (!user) {
        throw new Error("User not found");
      }

      user.isVerified = true;
      user.lastLoginAt = new Date();
      await user.save();

      const sessionToken = await this.generateToken(user);
      return { user, token: sessionToken };
    } catch (err) {
      throw new Error(
        `Magic link verification failed: ${err instanceof Error ? err.message : "Invalid Token"}`,
      );
    }
  }
}

export const authService = new AuthService();
