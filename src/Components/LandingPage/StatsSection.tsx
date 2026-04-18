type StatsSectionProps = {
  stats: {
    activeSubjects: number;
    expertTutors: number;
    sessionsBooked: number;
    averageRating: number;
  };
};

function formatCompactNumber(value: number): string {
  return new Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

export default function StatsSection({ stats }: StatsSectionProps) {
  const items = [
    { value: `${formatCompactNumber(stats.activeSubjects)}+`, label: "Active Subjects" },
    { value: `${formatCompactNumber(stats.expertTutors)}+`, label: "Expert Tutors" },
    { value: `${formatCompactNumber(stats.sessionsBooked)}+`, label: "Sessions Booked" },
    { value: `${stats.averageRating.toFixed(1)}/5`, label: "Average Rating" },
  ];

  return (
    <section className="bg-surface-container-low py-16">
      <div className="mx-auto w-11/12 max-w-7xl">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {items.map((stat) => (
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
