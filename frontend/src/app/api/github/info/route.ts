import { generateFolderStructure } from "@/lib/utils";
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

  const owner = match[1];
  const repo = match[2];

  const repoMetaRes = await fetch(
    `https://api.github.com/repos/${owner}/${repo}`,
    {
      headers: {
        Authorization: `token ${accessToken}`,
        Accept: "application/vnd.github+json",
      },
    }
  );

  if (!repoMetaRes.ok) {
    return NextResponse.json(
      { error: "Failed to fetch repo metadata" },
      { status: 500 }
    );
  }

  const repoMeta = await repoMetaRes.json();
  const defaultBranch = repoMeta.default_branch || "main";

  const treeRes = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/git/trees/${defaultBranch}?recursive=1`,
    {
      headers: {
        Authorization: `token ${accessToken}`,
        Accept: "application/vnd.github+json",
      },
    }
  );

  if (!treeRes.ok) {
    return NextResponse.json(
      { error: "Failed to fetch repo tree" },
      { status: 500 }
    );
  }

  const data = await treeRes.json();
  /* eslint-disable @typescript-eslint/no-explicit-any */
  const paths: string[] = data.tree?.map((item: any) => item.path) ?? [];
  const folderStructure = generateFolderStructure(paths, repo);

  return NextResponse.json({ defaultBranch, folderStructure });
}
