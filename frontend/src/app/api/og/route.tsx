import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const title = searchParams.get("title") || "ZeroDeploy";

  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(to bottom right, #000000, #1e1e1e)",
          color: "#ffffff",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "60px",
          fontSize: 60,
          fontWeight: "bold",
        }}
      >
        {title}
        <div style={{ fontSize: 24, fontWeight: 400, marginTop: 20 }}>
          Every Deploy Starts at Zero.
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
