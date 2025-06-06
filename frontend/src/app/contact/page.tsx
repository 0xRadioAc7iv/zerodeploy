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
    <div className="min-h-screen bg-black px-4 py-20 flex flex-col items-center justify-center text-center">
      <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">
        Let's Connect
      </h1>
      <p className="mb-10 text-lg text-gray-400 max-w-md">
        I'm Manav Gadhiya — passionate about building backend systems &
        developer platforms like ZeroDeploy. Feel free to reach out or follow me
        online!
      </p>

      <div className="flex gap-10 flex-wrap justify-center">
        {contacts.map((contact) => (
          <Link
            key={contact.href}
            href={contact.href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center space-y-3 group"
          >
            <div className="w-16 h-16 flex items-center justify-center bg-gray-100 rounded-xl transition-transform duration-200 group-hover:scale-110">
              <Image
                src={contact.logo}
                alt={`${contact.label} logo`}
                width={32}
                height={32}
                className="object-contain"
              />
            </div>
            <span className="text-sm font-medium text-gray-400 group-hover:underline">
              {contact.label}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
