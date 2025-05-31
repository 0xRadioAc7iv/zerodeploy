import Link from "next/link";
import Image from "next/image";

export default function ContactPage() {
  const contacts = [
    {
      label: "Email",
      href: "mailto:manav18gadhiya@gmail.com",
      logo: "/logos/email.svg",
    },
    {
      label: "LinkedIn",
      href: "https://linkedin.com/in/manavgadhiya",
      logo: "/logos/linkedin.svg",
    },
    {
      label: "GitHub",
      href: "https://github.com/0xRadioAc7iv",
      logo: "/logos/github.svg",
    },
    {
      label: "Twitter",
      href: "https://x.com/0xRadioAc7iv",
      logo: "/logos/x.svg",
    },
  ];

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4 text-center">
      <h1 className="mb-6 text-3xl font-semibold">My Socials</h1>
      <div className="flex flex-wrap items-center justify-center gap-6">
        {contacts.map((contact) => (
          <Link
            key={contact.href}
            href={contact.href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center space-y-2 hover:underline"
          >
            <Image
              src={contact.logo}
              alt={`${contact.label} logo`}
              width={40}
              height={40}
              className="transition-transform duration-200 hover:scale-110"
            />
          </Link>
        ))}
      </div>
    </div>
  );
}
