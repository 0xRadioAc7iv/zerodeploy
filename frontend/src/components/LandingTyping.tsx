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
    <div className="text-white text-4xl md:text-6xl font-bold text-center z-2">
      {text}
      <Cursor cursorStyle="|" />
    </div>
  );
}
