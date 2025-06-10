import { getUserProjects } from "@/app/actions";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = await getToken({ req });

  try {
    const { error, projects } = await getUserProjects(token?.savedId as string);

    if (error) {
      return NextResponse.json(
        { msg: "Error fetching user projects" },
        { status: 500 }
      );
    }

    return NextResponse.json({ projects });
  } catch (err) {
    return NextResponse.json({ success: false, message: err }, { status: 500 });
  }
}
