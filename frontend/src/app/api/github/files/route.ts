import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const token = await getToken({ req });
  const accessToken = token?.accessToken;

  const repoUrl = req.nextUrl.searchParams.get("repo_url");
  if (!repoUrl)
    return NextResponse.json({ error: "Missing repo_url" }, { status: 400 });

  const match = repoUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
  if (!match)
    return NextResponse.json({ error: "Invalid GitHub URL" }, { status: 400 });

  const [_, owner, repo] = match;

  const res = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/git/trees/HEAD?recursive=1`,
    {
      headers: {
        Authorization: `token ${accessToken}`,
        Accept: "application/vnd.github+json",
      },
    }
  );

  if (!res.ok) {
    return NextResponse.json(
      { error: "Failed to fetch repo tree" },
      { status: 500 }
    );
  }

  const data = await res.json();

  const paths: string[] = data.tree?.map((item: any) => item.path) ?? [];

  const framework = paths.some((path) =>
    /vite\.config\.(js|ts|mjs|cjs)$/.test(path)
  )
    ? "Vite"
    : "Unknown";

  return NextResponse.json({ framework });
}
