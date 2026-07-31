export type SettingMeta = {
  label: string;
  description: string;
  type: "boolean" | "number" | "integer";
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
};

/** Display metadata mirroring the backend's settingsRegistry.js — kept in sync by hand, same as Permission labels. */
export const SETTINGS_META: Record<string, SettingMeta> = {
  "flags.smsEnabled": {
    label: "SMS sending",
    description: "Deliver OTPs and safety alerts by SMS. While off, they're emailed instead.",
    type: "boolean",
  },
  "flags.demoDriversEnabled": {
    label: "Demo drivers",
    description: "Show fabricated demo driver offers when no real driver is online. Testing only.",
    type: "boolean",
  },
  "fare.baseFare": {
    label: "Base fare",
    description: "Flat starting fee added to every fare estimate.",
    type: "number",
    min: 0,
    step: 0.5,
    unit: "GH₵",
  },
  "fare.perKm": {
    label: "Per kilometer",
    description: "Rate charged per kilometer of trip distance.",
    type: "number",
    min: 0,
    step: 0.1,
    unit: "GH₵/km",
  },
  "fare.perMin": {
    label: "Per minute",
    description: "Rate charged per minute of trip duration.",
    type: "number",
    min: 0,
    step: 0.1,
    unit: "GH₵/min",
  },
  "fare.minimumFare": {
    label: "Minimum fare",
    description: "A fare estimate never comes back below this floor.",
    type: "number",
    min: 0,
    step: 0.5,
    unit: "GH₵",
  },
  "fare.shareMultiplier": {
    label: "Share-mode discount",
    description: "Share-mode fare = solo fare × this multiplier.",
    type: "number",
    min: 0,
    max: 1,
    step: 0.05,
    unit: "× solo fare",
  },
  "fare.minimumBidRatio": {
    label: "Minimum bid ratio",
    description: "The lowest a rider can set/counter their fare to, relative to the recommended fare.",
    type: "number",
    min: 0,
    max: 1,
    step: 0.05,
    unit: "× recommended fare",
  },
  "ride.maxCoRiders": {
    label: "Max co-riders",
    description: "How many co-riders (besides the trip owner) a shared ride can accept.",
    type: "integer",
    min: 1,
    max: 10,
    step: 1,
    unit: "riders",
  },
};

export const SETTINGS_CATEGORY_LABELS: Record<string, string> = {
  flags: "Feature toggles",
  fare: "Fare rules",
  ride: "Ride rules",
};
