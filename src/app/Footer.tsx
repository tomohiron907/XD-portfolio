const navLinks = [
  { href: "#benefits", label: "Benefits" },
  { href: "#examples", label: "Examples" },
  { href: "#workflow", label: "Workflow" },
  { href: "#evidence", label: "Evidence" },
  { href: "#get-started", label: "Get Started" },
];

export default function Footer() {
  return (
    <footer className="border-t border-foreground/10 py-16">
      <div className="mx-auto max-w-5xl px-6">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-3">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3">
              <img src="/logo-mark.png" alt="Strecs3D" className="h-10" />
              <img src="/logo-type.svg" alt="Strecs3D" className="h-6" />
            </div>
            <p className="mt-4 text-sm text-foreground/50">
              FEM-based infill optimizer for 3D printing
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-sm font-semibold">Navigation</h3>
            <ul className="mt-4 space-y-2 text-sm text-foreground/50">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="transition-colors hover:text-foreground/70"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-sm font-semibold">Links</h3>
            <ul className="mt-4 space-y-2 text-sm text-foreground/50">
              <li>
                <a
                  href="https://github.com/tomohiron907/Strecs3D"
                  className="transition-colors hover:text-foreground/70"
                >
                  GitHub
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/tomohiron907/Strecs3D"
                  className="transition-colors hover:text-foreground/70"
                >
                  Documentation
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="transition-colors hover:text-foreground/70"
                >
                  Academic Paper
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 text-center text-sm text-foreground/50">
          &copy; {new Date().getFullYear()} Tomohiro TANIGUCHI. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
