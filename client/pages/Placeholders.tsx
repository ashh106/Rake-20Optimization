export function Placeholder({ title }: { title: string }) {
  return (
    <div className="rounded-xl border bg-card p-8 text-center text-muted-foreground shadow-sm">
      <div className="text-xl font-semibold mb-2">{title}</div>
      <p>This section is ready to be implemented. Ask to generate this page next to include charts, forms, and full interactions.</p>
    </div>
  );
}
