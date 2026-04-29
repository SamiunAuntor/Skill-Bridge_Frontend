type StateCardProps = {
  title: string;
  description: string;
  tone?: "neutral" | "error";
  action?: React.ReactNode;
};

export default function StateCard({
  title,
  description,
  tone = "neutral",
  action,
}: StateCardProps) {
  const className =
    tone === "error"
      ? "bg-error-container text-on-error-container"
      : "bg-surface-container-low text-on-surface";

  return (
    <section className={`rounded-[1.5rem] p-6 shadow-[0px_12px_32px_rgba(0,51,88,0.05)] ${className}`}>
      <h2 className="font-headline text-2xl font-bold">{title}</h2>
      <p className="mt-3 text-sm leading-relaxed opacity-90">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </section>
  );
}
