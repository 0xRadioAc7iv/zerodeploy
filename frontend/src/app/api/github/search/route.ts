import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const token = await getToken({ req });
  const accessToken = token?.accessToken;
  const username = token?.username;

  const { searchParams } = new URL(req.url);
  const query = searchParams.get("query");

  if (!query || !accessToken || !username) {
    return NextResponse.json(
      { error: "Missing query or auth info" },
      { status: 400 }
    );
  }

  const githubRes = await fetch(
    `https://api.github.com/search/repositories?q=${encodeURIComponent(
      query
    )}+user:${username}`,
    {
      headers: {
        Authorization: `token ${accessToken}`,
        Accept: "application/vnd.github+json",
      },
    }
  );

  const data = await githubRes.json();
  return NextResponse.json(data.items || []);
}
