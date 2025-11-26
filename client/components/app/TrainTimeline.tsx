import { useEffect, useState } from "react";
import { Check, Clock, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";

export interface TrainStop {
  stopName: string;
  scheduledTime: string;
  actualTime?: string | null;
  status: "upcoming" | "arrived" | "departed" | "current";
  delayMinutes?: number | null;
  lat: number;
  lon: number;
}

interface TrainTimelineProps {
  trainId: string;
  className?: string;
}

export function TrainTimeline({ trainId, className = "" }: TrainTimelineProps) {
  const [stops, setStops] = useState<TrainStop[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTimeline = async () => {
    try {
      // TODO: Replace with your actual API endpoint
      const { data } = await axios.get(`/api/train/${trainId}/timeline`);
      setStops(data);
    } catch (error) {
      console.error("Failed to fetch timeline:", error);
      // For demo purposes, using mock data if API fails
      setStops(generateMockStops());
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTimeline();
    const interval = setInterval(fetchTimeline, 10000); // Poll every 10 seconds
    return () => clearInterval(interval);
  }, [trainId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {/* Vertical line */}
      <div className="absolute left-5 top-0 h-full w-0.5 bg-gray-200" />

      <div className="space-y-6">
        <AnimatePresence>
          {stops.map((stop, index) => {
            const isCurrent = stop.status === "current";
            const isCompleted = ["arrived", "departed"].includes(stop.status);
            const isDelayed = (stop.delayMinutes ?? 0) > 0;
            const isEarly = (stop.delayMinutes ?? 0) < 0;

            const scheduledTime = new Date(stop.scheduledTime);
            const actualTime = stop.actualTime ? new Date(stop.actualTime) : null;

            return (
              <motion.div
                key={`${stop.stopName}-${index}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative pl-12"
              >
                {/* Node */}
                <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2">
                  {isCompleted ? (
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500 text-white">
                      <Check className="h-4 w-4" />
                    </div>
                  ) : isCurrent ? (
                    <motion.div
                      className="h-6 w-6 rounded-full bg-blue-500"
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.8, 1, 0.8],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    />
                  ) : (
                    <div className="h-4 w-4 rounded-full border-2 border-gray-300 bg-white" />
                  )}
                </div>

                {/* Content */}
                <div className="rounded-lg border bg-white p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{stop.stopName}</h4>
                    <span
                      className={`text-sm font-medium ${
                        isDelayed ? "text-red-500" : isEarly ? "text-green-500" : "text-gray-500"
                      }`}
                    >
                      {isDelayed
                        ? `+${stop.delayMinutes}m late`
                        : isEarly
                        ? `${Math.abs(stop.delayMinutes ?? 0)}m early`
                        : "On time"}
                    </span>
                  </div>

                  <div className="mt-2 grid grid-cols-2 gap-4 text-sm text-gray-600">
                    <div>
                      <p className="text-xs text-gray-400">Scheduled</p>
                      <p>{scheduledTime.toLocaleTimeString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">
                        {stop.status === "upcoming" ? "Expected" : "Actual"}
                      </p>
                      <p>
                        {actualTime
                          ? actualTime.toLocaleTimeString()
                          : "En route..."}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Connector line */}
                {index < stops.length - 1 && (
                  <div className="absolute -bottom-6 left-0 top-full h-6 w-0.5 bg-gray-200" />
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}

// Mock data generator for development
function generateMockStops(): TrainStop[] {
  const now = new Date();
  return [
    {
      stopName: "Bokaro",
      scheduledTime: new Date(now.getTime() - 3600000 * 2).toISOString(),
      actualTime: new Date(now.getTime() - 3600000 * 2 - 60000 * 5).toISOString(),
      status: "departed",
      delayMinutes: -5,
      lat: 23.6693,
      lon: 86.1511,
    },
    {
      stopName: "Dhanbad",
      scheduledTime: new Date(now.getTime() - 3600000).toISOString(),
      actualTime: new Date(now.getTime() - 3600000 + 60000 * 10).toISOString(),
      status: "arrived",
      delayMinutes: 10,
      lat: 23.7957,
      lon: 86.4304,
    },
    {
      stopName: "Asansol",
      scheduledTime: new Date(now.getTime() + 3600000).toISOString(),
      status: "current",
      delayMinutes: 15,
      lat: 23.6739,
      lon: 86.9524,
    },
    {
      stopName: "Kolkata",
      scheduledTime: new Date(now.getTime() + 3600000 * 3).toISOString(),
      status: "upcoming",
      delayMinutes: 0,
      lat: 22.5726,
      lon: 88.3639,
    },
  ];
}
