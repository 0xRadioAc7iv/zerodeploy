import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || !session.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const res = await fetch(
    "https://api.github.com/user/repos?sort=updated&direction=desc&per_page=5",
    {
      headers: {
        Authorization: `token ${session.accessToken}`,
        Accept: "application/vnd.github+json",
      },
    }
  );

  const repos = await res.json();

  if (!Array.isArray(repos)) {
    return NextResponse.json(
      { error: "GitHub API error", details: repos },
      { status: 500 }
    );
  }

  return NextResponse.json(repos);
}
