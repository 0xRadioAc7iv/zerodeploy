import Header from "@/components/Header";
import DashboardClient from "@/components/client/DashboardClient";
import FooterSmall from "@/components/FooterSmall";

export default async function DashboardPage() {
  return (
    <div className="flex flex-col justify-between">
      <Header />
      <DashboardClient />
      <FooterSmall />
    </div>
  );
}
