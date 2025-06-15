import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { getProjectData } from "@/app/actions";

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.accessToken) {
    return NextResponse.json({ msg: "Unauthorized" }, { status: 401 });
  }

  const token = await getToken({ req: request });

  const body = await request.json();

  if (!body) {
    return NextResponse.json(
      { error: "Invalid Request Body" },
      { status: 400 }
    );
  }

  try {
    const { error, project } = await getProjectData(
      body.projectId,
      token?.savedId as string
    );

    if (error) {
      return NextResponse.json(
        { error: "Error fetching Project Details" },
        { status: 500 }
      );
    }

    return NextResponse.json({ project });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch project data" },
      { status: 500 }
    );
  }
}
