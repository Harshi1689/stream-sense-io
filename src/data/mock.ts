export const RESERVOIRS = [
  { name: "Cauvery (KRS)", level: 64, capacity: 49.45, unit: "TMC", trend: "stable" as const },
  { name: "Kabini", level: 58, capacity: 19.52, unit: "TMC", trend: "down" as const },
  { name: "Hemavathi", level: 71, capacity: 37.10, unit: "TMC", trend: "up" as const },
  { name: "Harangi", level: 49, capacity: 8.50, unit: "TMC", trend: "down" as const },
];

export const GROUNDWATER = [
  { zone: "North Bengaluru", depth: 380, status: "critical" as const },
  { zone: "South Bengaluru", depth: 240, status: "medium" as const },
  { zone: "East Bengaluru", depth: 195, status: "safe" as const },
  { zone: "West Bengaluru", depth: 310, status: "critical" as const },
  { zone: "Central Bengaluru", depth: 220, status: "medium" as const },
];

export const WARDS = [
  { id: "W-12", name: "Indiranagar", status: "safe" as const, supply: "24x7" },
  { id: "W-34", name: "Koramangala", status: "medium" as const, supply: "Alt days" },
  { id: "W-56", name: "Whitefield", status: "critical" as const, supply: "Tanker only" },
  { id: "W-78", name: "JP Nagar", status: "medium" as const, supply: "Alt days" },
  { id: "W-90", name: "Hebbal", status: "safe" as const, supply: "24x7" },
  { id: "W-21", name: "HSR Layout", status: "critical" as const, supply: "Tanker only" },
  { id: "W-44", name: "Jayanagar", status: "safe" as const, supply: "24x7" },
  { id: "W-67", name: "Banashankari", status: "medium" as const, supply: "Alt days" },
  { id: "W-15", name: "Marathahalli", status: "critical" as const, supply: "Tanker only" },
];

export const CONSUMPTION_TREND = [
  { day: "Mon", liters: 380 },
  { day: "Tue", liters: 410 },
  { day: "Wed", liters: 365 },
  { day: "Thu", liters: 445 },
  { day: "Fri", liters: 520 },
  { day: "Sat", liters: 610 },
  { day: "Sun", liters: 540 },
];

export const TANKER_PRICES: Record<number, number> = {
  500: 350,
  1000: 600,
  2000: 1100,
  5000: 2400,
};

export const WARD_OPTIONS = [
  "Indiranagar (W-12)", "Koramangala (W-34)", "Whitefield (W-56)", "JP Nagar (W-78)",
  "Hebbal (W-90)", "HSR Layout (W-21)", "Jayanagar (W-44)", "Banashankari (W-67)",
  "Marathahalli (W-15)", "Other",
];
