import AccountSettingsPageClient from "@/components/client/AccountPageClient";
import FooterSmall from "@/components/FooterSmall";
import Header from "@/components/Header";

export default function AccountSettingsPage() {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-black/95">
      <Header />
      <AccountSettingsPageClient />
      <FooterSmall />
    </div>
  );
}
