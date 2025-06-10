import { deleteUserAccount } from "@/app/actions";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { email } = await req.json();

  try {
    const { error, msg, status } = await deleteUserAccount(
      email,
      session.accessToken
    );

    const cookieStore = await cookies();

    cookieStore.delete("next-auth.csrf-token");
    cookieStore.delete("next-auth.callback-url");

    if (!error) {
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ msg }, { status });
  } catch (err) {
    return NextResponse.json({ success: false, message: err }, { status: 500 });
  }
}
