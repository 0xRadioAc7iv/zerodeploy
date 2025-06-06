import ImportNewRepositoryPageClient from "@/components/client/ImportPageClient";
import { buildOgMetadata } from "@/lib/ogMetadata";

export const generateMetadata = () =>
  buildOgMetadata({
    title: "Import Repository",
  });

export default function ImportNewRepositoryPage() {
  return <ImportNewRepositoryPageClient />;
}
