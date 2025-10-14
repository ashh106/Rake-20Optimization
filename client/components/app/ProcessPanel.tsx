import { Database, Brain, Gauge, ListChecks } from "lucide-react";
import { motion } from "framer-motion";

const steps = [
  { icon: Database, label: "Data Ingestion" },
  { icon: Brain, label: "ML Forecasting" },
  { icon: Gauge, label: "Optimization" },
  { icon: ListChecks, label: "Plan Generation" },
];

export default function ProcessPanel() {
  // return (
  //   <div className="rounded-xl border bg-card p-4 shadow-sm">
  //     <div className="text-sm font-semibold mb-3">AI/ML & Optimization Flow</div>
  //     <div className="flex items-center justify-between gap-2">
  //       {steps.map((s, i) => (
  //         <motion.div
  //           key={s.label}
  //           className="flex items-center gap-2"
  //           initial={{ opacity: 0, y: 8 }}
  //           animate={{ opacity: 1, y: 0 }}
  //           transition={{ delay: i * 0.1 }}
  //         >
  //           <div className="h-9 w-9 rounded-lg bg-primary text-primary-foreground grid place-items-center">
  //             <s.icon className="h-5 w-5" />
  //           </div>
  //           <div className="text-sm font-medium">{s.label}</div>
  //           {i < steps.length - 1 && (
  //             <motion.div
  //               className="h-[2px] w-10 bg-accent rounded-full"
  //               animate={{ opacity: [0.4, 1, 0.4] }}
  //               transition={{ repeat: Infinity, duration: 2 }}
  //             />
  //           )}
  //         </motion.div>
  //       ))}
  //     </div>
  //     <div className="mt-3 text-xs text-muted-foreground">
  //       System auto-generates daily optimized rake plans using AI & MILP.
  //     </div>
  //   </div>
  // );
}
