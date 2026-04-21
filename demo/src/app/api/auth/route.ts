import { NextRequest, NextResponse } from "next/server";
import { signIn, signOut, currentUser } from "../../../lib/auth";

export async function GET() {
  const user = await currentUser();
  if (!user) return NextResponse.json({ user: null });
  const { passwordHash, ...pub } = user;
  return NextResponse.json({ user: pub });
}

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();
  if (!email || !password) {
    return NextResponse.json(
      { error: "Email and password required" },
      { status: 400 }
    );
  }
  const user = await signIn(String(email), String(password));
  if (!user) {
    return NextResponse.json(
      { error: "Wrong email or password" },
      { status: 401 }
    );
  }
  const { passwordHash, ...pub } = user;
  return NextResponse.json({ user: pub });
}

export async function DELETE() {
  await signOut();
  return NextResponse.json({ ok: true });
}
