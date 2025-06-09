import SuccessPageClient from "@/components/client/SuccessPageClient";
import { buildOgMetadata } from "@/lib/ogMetadata";

export const generateMetadata = () =>
  buildOgMetadata({
    title: "Deploy Success",
  });

export default function ImportNewRepositoryPage() {
  return (
    <div className="min-h-screen bg-black/95">
      <SuccessPageClient />
    </div>
  );
}
