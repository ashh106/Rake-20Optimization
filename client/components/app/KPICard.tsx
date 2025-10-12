import { motion, useAnimation } from "framer-motion";
import { useEffect } from "react";

export default function KPICard({ label, value, prefix = "", suffix = "", icon, onClick }: { label: string; value: number; prefix?: string; suffix?: string; icon?: React.ReactNode; onClick?: () => void }) {
  const controls = useAnimation();
  useEffect(() => {
    controls.start({
      custom: value,
    });
  }, [value, controls]);

  return (
    <motion.button
      type="button"
      onClick={onClick}
      className="rounded-xl bg-card text-card-foreground border p-4 shadow-sm text-left hover:shadow-md focus:outline-none focus:ring-2 focus:ring-ring"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">{label}</div>
        <div className="text-primary">{icon}</div>
      </div>
      <div className="mt-2 text-2xl font-bold">
        <Counter to={value} prefix={prefix} suffix={suffix} />
      </div>
    </motion.button>
  );
}

function Counter({ to, prefix = "", suffix = "" }: { to: number; prefix?: string; suffix?: string }) {
  return (
    <motion.span
      initial={{ textContent: 0 }}
      animate={{ textContent: to }}
      transition={{ duration: 1.2, ease: "easeOut" }}
    >
      {prefix}
      {new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(to)}
      {suffix}
    </motion.span>
  );
}
