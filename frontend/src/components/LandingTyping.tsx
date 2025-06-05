"use client";

import { useTypewriter, Cursor } from "react-simple-typewriter";

export default function LandingTyping() {
  const [text] = useTypewriter({
    words: [
      "Zero to Deploy in One Click.",
      "Zero Waiting. Infinite Deploys.",
      "Deploy from Zero to Hero.",
      "Because Every Deploy Starts at Zero.",
      "Zero Hassle, Maximum Deploy.",
    ],
    loop: true,
    delaySpeed: 2500,
    deleteSpeed: 50,
  });

  return (
    <div className="text-4xl md:text-6xl font-bold text-center">
      {text}
      <Cursor cursorStyle="|" />
    </div>
  );
}
