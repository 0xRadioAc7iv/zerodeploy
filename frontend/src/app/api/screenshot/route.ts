import { env } from "@/env";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

const API_KEY = env.SCREENSHOTONE_ACCESS_KEY as string;

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await request.json();

  try {
    const response = await fetch(
      `https://api.screenshotone.com/take?url=${encodeURIComponent(
        data.url
      )}&access_key=${API_KEY}`
    );

    const arrayBuffer = await response.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");

    return NextResponse.json({
      screenshotBase64: `data:image/jpeg;base64,${base64}`,
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Failed to get Screenshot" },
      { status: 500 }
    );
  }
}
