import { NextRequest, NextResponse } from "next/server";
import { signToken } from "@/lib/jwt";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password } = body;

    // Validate input
    if (!password) {
      return NextResponse.json(
        { error: "Password is required" },
        { status: 400 }
      );
    }

    // Check credentials against environment variable (MVP - no database)
    const accessPassword = process.env.ACCESS_PASSWORD;

    if (!accessPassword) {
      return NextResponse.json(
        { error: "Server misconfigured — ACCESS_PASSWORD not set" },
        { status: 500 }
      );
    }

    if (password !== accessPassword) {
      return NextResponse.json(
        { error: "Incorrect password" },
        { status: 401 }
      );
    }

    // Generate JWT — sub is a fixed admin user (no Discord user for password-only auth)
    const token = await signToken({
      sub: "admin",
      email: "admin@discordo.local",
      role: "admin",
    });

    const response = NextResponse.json({ ok: true });

    // Set httpOnly cookie
    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 8, // 8 hours
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
