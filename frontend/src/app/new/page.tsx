import NewProjectPageClient from "@/components/client/NewProjectPageClient";
import { buildOgMetadata } from "@/lib/ogMetadata";

export const generateMetadata = () =>
  buildOgMetadata({
    title: "Create New Project",
  });

export default function NewProjectPage() {
  return (
    <div className="min-h-screen bg-black/95">
      <NewProjectPageClient />;
    </div>
  );
}
