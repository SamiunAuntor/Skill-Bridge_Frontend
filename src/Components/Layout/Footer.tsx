import Link from "next/link";

const footerColumns = [
  {
    title: "Platform",
    links: ["Find Tutors", "Subjects", "Pricing", "Become a Tutor"],
  },
  {
    title: "Support",
    links: ["Help Center", "Terms of Service", "Privacy Policy", "Cookie Policy"],
  },
];

export default function Footer() {
  return (
    <footer className="w-full border-t border-[#c1c7d0]/10 bg-[#003358] pt-16 pb-8 text-[#ffffff] dark:bg-[#001d33] dark:text-[#d0e4ff]">
      <div className="mx-auto grid w-11/12 max-w-7xl grid-cols-1 gap-12 md:grid-cols-4">
        <div className="col-span-1">
          <span className="mb-4 block text-xl font-bold text-white">
            SkillBridge
          </span>
          <p className="mb-6 text-sm leading-relaxed text-[#c1c7d0]">
            Empowering the next generation of intellectual architects through
            premium, verified mentorship and expert tutoring across the globe.
          </p>
          <div className="flex gap-4">
            {["language", "share"].map((icon) => (
              <a
                key={icon}
                href="#"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-secondary"
              >
                <span className="material-symbols-outlined text-sm">{icon}</span>
              </a>
            ))}
          </div>
        </div>

        {footerColumns.map((column) => (
          <div key={column.title}>
            <h4 className="mb-6 text-xs font-bold uppercase tracking-widest text-white">
              {column.title}
            </h4>
            <ul className="space-y-4">
              {column.links.map((link) => (
                <li key={link}>
                  <Link
                    href="#"
                    className="block text-sm text-[#c1c7d0] transition-transform duration-300 hover:translate-x-1 hover:text-[#68fadd]"
                  >
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div>
          <h4 className="mb-6 text-xs font-bold uppercase tracking-widest text-white">
            Contact
          </h4>
          <ul className="space-y-4">
            <li className="flex items-center gap-3 text-sm text-[#c1c7d0]">
              <span className="material-symbols-outlined text-sm">mail</span>
              hello@skillbridge.edu
            </li>
            <li className="flex items-center gap-3 text-sm text-[#c1c7d0]">
              <span className="material-symbols-outlined text-sm">
                location_on
              </span>
              123 Learning Lane, Knowledge City
            </li>
          </ul>
        </div>
      </div>

      <div className="mx-auto mt-16 flex w-11/12 max-w-7xl flex-col items-center justify-between gap-4 border-t border-white/5 pt-8 md:flex-row">
        <p className="text-sm text-[#c1c7d0]">
          © 2024 SkillBridge. The Intellectual Architect.
        </p>
        <div className="flex gap-8">
          {["Accessibility", "Security", "Legal"].map((item) => (
            <Link
              key={item}
              href="#"
              className="text-xs text-[#c1c7d0] transition-colors hover:text-white"
            >
              {item}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
