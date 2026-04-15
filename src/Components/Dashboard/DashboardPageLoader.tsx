type DashboardPageLoaderProps = {
  label?: string;
};

export default function DashboardPageLoader({
  label = "Loading...",
}: DashboardPageLoaderProps) {
  return (
    <div className="flex min-h-[60vh] w-full items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-outline-variant/30 border-t-primary" />
        <p className="text-sm font-medium text-on-surface-variant">{label}</p>
      </div>
    </div>
  );
}
