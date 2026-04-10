const stats = [
  { value: "500+", label: "Subjects" },
  { value: "2.5k+", label: "Expert Tutors" },
  { value: "98%", label: "Success Rate" },
  { value: "24/7", label: "Support" },
];

export default function StatsSection() {
  return (
    <section className="bg-surface-container-low py-16">
      <div className="mx-auto w-11/12 max-w-7xl">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <h3 className="text-4xl font-black text-primary">{stat.value}</h3>
              <p className="mt-2 text-sm font-semibold uppercase tracking-widest text-on-surface-variant">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
