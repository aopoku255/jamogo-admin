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
  "fare.shareDriverBonus": {
    label: "Shared-ride driver bonus",
    description:
      "On a shared ride, the distance riders share is split between them, plus this much extra per added booking for the driver. 0.07: two riders on a ₵50 route pay ₵27 each (driver ₵54); three pay ₵19 each (driver ₵57).",
    type: "number",
    min: 0,
    max: 0.5,
    step: 0.01,
    unit: "per extra rider",
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
  "waiting.freeMinutes": {
    label: "Free waiting time",
    description: "How long a driver waits at pickup (after tapping \"I've arrived\") before the rider starts paying for waiting.",
    type: "integer",
    min: 0,
    max: 30,
    step: 1,
    unit: "minutes",
  },
  "waiting.perMinuteFee": {
    label: "Waiting fee per minute",
    description: "Added to the rider's fare for each started minute past the free waiting time.",
    type: "number",
    min: 0,
    max: 20,
    step: 0.1,
    unit: "₵ / minute",
  },
  "waiting.maxFee": {
    label: "Maximum waiting fee",
    description: "The most waiting can add to a single trip.",
    type: "number",
    min: 0,
    max: 200,
    step: 1,
    unit: "₵",
  },
  "share.searchWaitMinutes": {
    label: "Co-rider search time",
    description: "How long \"Find co-riders\" looks for riders going the same way before booking a driver automatically. Riders can still be found while the driver search runs.",
    type: "integer",
    min: 1,
    max: 30,
    step: 1,
    unit: "minutes",
  },
  "share.maxDetourMinutes": {
    label: "Co-rider detour limit",
    description: "The most a new co-rider may add to anyone's ride: the rider who booked and the co-rider themselves. Lets riders going part of the way join, and riders join a car already on its way.",
    type: "integer",
    min: 1,
    max: 30,
    step: 1,
    unit: "minutes",
  },
};

export const SETTINGS_CATEGORY_LABELS: Record<string, string> = {
  flags: "Feature toggles",
  fare: "Fare rules",
  ride: "Ride rules",
};
