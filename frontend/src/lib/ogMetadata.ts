export function buildOgMetadata({
  title,
  description = "Because Every Deploy Starts at Zero.",
}: {
  title?: string;
  description?: string;
}) {
  let fullTitle;

  if (title) {
    fullTitle = `${title} | ZeroDeploy`;
  } else {
    fullTitle = "ZeroDeploy";
  }

  return {
    title: fullTitle,
    description,
    openGraph: {
      title: fullTitle,
      description,
      images: [
        {
          url: title
            ? `https://zerodeploy.xyz/api/og?title=${encodeURIComponent(title)}`
            : "https://zerodeploy.xyz/api/og",
          width: 1200,
          height: 630,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      images: [
        title
          ? `https://zerodeploy.xyz/api/og?title=${encodeURIComponent(title)}`
          : "https://zerodeploy.xyz/api/og",
      ],
    },
  };
}
