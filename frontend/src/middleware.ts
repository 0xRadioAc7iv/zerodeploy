import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import { get } from "@vercel/edge-config";

export default withAuth(
  async function middleware() {
    const isDisabled = await get("disabled");
    if (isDisabled === true) {
      return new NextResponse(
        "🚧 The app is temporarily down for maintenance.",
        {
          status: 503,
        }
      );
    }

    return;
  },
  {
    pages: {
      signIn: "/",
    },
  }
);

export const config = {
  matcher: ["/new/:path*", "/dashboard/:path*"],
};
