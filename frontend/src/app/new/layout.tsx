import FooterSmall from "@/components/FooterSmall";
import Header from "@/components/Header";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <Header />
      <section>{children}</section>
      <FooterSmall />
    </div>
  );
}
