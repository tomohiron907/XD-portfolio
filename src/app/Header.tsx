"use client";

import { useState } from "react";

const navLinks = [
  { href: "#benefits", label: "Benefits" },
  { href: "#examples", label: "Examples" },
  { href: "#workflow", label: "Workflow" },
  { href: "#evidence", label: "Evidence" },
  { href: "#get-started", label: "Get Started" },
];

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-foreground/10 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <img src="/logo-mark.png" alt="Strecs3D" className="h-10" />
            <img src="/logo-type.svg" alt="Strecs3D" className="h-6" />
          </div>

          {/* Desktop nav */}
          <nav className="hidden gap-6 text-sm md:flex">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="transition-colors hover:text-foreground/70"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Hamburger button */}
          <button
            className="md:hidden"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </header>

      {/* Mobile dropdown — fixed below header, independent backdrop-filter */}
      {isOpen && (
        <nav className="fixed left-0 right-0 top-[57px] z-50 border-b border-foreground/10 bg-background/80 px-6 py-4 backdrop-blur-md md:hidden">
          <div className="flex flex-col items-end gap-4 text-sm">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="transition-colors hover:text-foreground/70"
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </a>
            ))}
          </div>
        </nav>
      )}
    </>
  );
}
