import LoginClient from "@/components/client/LoginClient";
import { buildOgMetadata } from "@/lib/ogMetadata";

export const generateMetadata = () =>
  buildOgMetadata({
    title: "Login",
  });

export default function LoginPage() {
  return <LoginClient />;
}
