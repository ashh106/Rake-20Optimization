/**
 * Shared code between client and server
 * Useful to share types between client and server
 * and/or small pure JS functions that can be used on both client and server
 */

/**
 * Example response type for /api/demo
 */
export interface DemoResponse {
  message: string;
}

// -------- FastAPI proxied types --------
export interface OptimizedPlan {
  cmo_stockyard_location_id: string;
  product_id: string;
  customer_id: string;
  quantity_tonnes: number;
  wagons_used: number;
  distance_km: number;
  transport_cost: number;
  loading_cost: number;
  total_cost: number;
}

export interface Summary {
  total_cost?: number;
  avg_utilization?: number;
  on_time_pct?: number;
  notes?: string;
  [k: string]: unknown;
}

export interface Dataset {
  name: string;
  size?: number;
  last_updated?: string;
  [k: string]: unknown;
}

export interface Customer {
  id: string | number;
  name: string;
  location?: string;
  [k: string]: unknown;
}

export interface Product {
  id: string | number;
  name: string;
  [k: string]: unknown;
}

export interface CustomerProduct {
  customer_id: string | number;
  customer_location_id: string | number;
  product_list: (string | number)[];
  quantity_list: number[];
  priority_weight: number;
  [k: string]: unknown;
}

export interface StockyardProduct {
  stockyard_id: string | number;
  product_id: string | number;
  available_tonnes?: number;
  [k: string]: unknown;
}

export interface StockyardLocation {
  stockyard_id: string | number;
  name?: string;
  lat?: number;
  lon?: number;
  [k: string]: unknown;
}

export interface DistanceRecord {
  from_id: string | number;
  to_id: string | number;
  distance_km: number;
  mode?: "rail" | "road" | string;
  [k: string]: unknown;
}

export interface ApiSuccess<T> {
  status: "success";
  data: T;
}

export interface ApiError {
  status: "error";
  message: string;
  details?: string;
}