export function buildOgMetadata({
  title,
  description = "Because Every Deploy Starts at Zero.",
}: {
  title: string;
  description?: string;
}) {
  const fullTitle = `${title} | ZeroDeploy`;

  return {
    title: fullTitle,
    description,
    openGraph: {
      title: fullTitle,
      description,
      images: [
        {
          url: `https://zerodeploy.xyz/api/og?title=${encodeURIComponent(
            title
          )}`,
          width: 1200,
          height: 630,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      images: [
        `https://zerodeploy.xyz/api/og?title=${encodeURIComponent(title)}`,
      ],
    },
  };
}
