import Link from "next/link";

const footerColumns = [
  {
    title: "Platform",
    links: [
      { label: "Find Tutors", href: "/tutors" },
      { label: "Become a Tutor", href: "#" },
      { label: "Subjects", href: "/subjects" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Terms of Service", href: "#" },
      { label: "Privacy Policy", href: "#" },
      { label: "Help Center", href: "#" },
    ],
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
            Empowering learners through elite mentorship and architectural
            precision in education.
          </p>
        </div>

        {footerColumns.map((column) => (
          <div key={column.title}>
            <h4 className="mb-6 text-xs font-bold uppercase tracking-widest text-white">
              {column.title}
            </h4>
            <ul className="space-y-4">
              {column.links.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="block text-sm text-[#c1c7d0] transition-transform duration-300 hover:translate-x-1 hover:text-[#68fadd]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div>
          <h4 className="mb-6 text-xs font-bold uppercase tracking-widest text-white">
            Newsletter
          </h4>
          <div className="flex gap-2">
            <input
              type="email"
              placeholder="Your email"
              className="w-full rounded-md border-none bg-white/10 px-4 py-2 text-sm text-white placeholder:text-[#c1c7d0]/60 focus:ring-1 focus:ring-[#68fadd]"
            />
            <button className="rounded-md bg-secondary px-3 text-on-secondary">
              <span className="material-symbols-outlined">send</span>
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-16 flex w-11/12 max-w-7xl flex-col items-center justify-between gap-4 border-t border-white/5 pt-8 md:flex-row">
        <p className="text-sm text-[#c1c7d0]">
          © 2024 SkillBridge. The Intellectual Architect.
        </p>
      </div>
    </footer>
  );
}
