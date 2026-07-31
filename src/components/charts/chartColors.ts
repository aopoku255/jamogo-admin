// Categorical pair (riders vs drivers) — validated with the dataviz skill's
// validate_palette.js: both hues clear the lightness/chroma/CVD/contrast
// checks as an adjacent pair (worst-case deuteranopia ΔE 29.5).
export const RIDERS_COLOR = "#1fa84c"; // jamogo-green-500
export const DRIVERS_COLOR = "#2e6be6"; // jamogo-info

// Status colors are a fixed, reserved scale (not categorical identity) — same
// meaning used by the Badge tones elsewhere in this app. Always paired with a
// direct label (the axis tick naming the status), never color alone.
const NEUTRAL = "#9aa39d"; // jamogo-gray-400
const INFO = "#2e6be6"; // jamogo-info
const WARNING = "#f5a623"; // jamogo-warning
const GOOD = "#1fa84c"; // jamogo-green-500
const CRITICAL = "#e5484d"; // jamogo-danger

export const TRIP_STATUS_COLORS: Record<string, string> = {
  planning: NEUTRAL,
  searching: INFO,
  matched: INFO,
  ongoing: WARNING,
  completed: GOOD,
  cancelled: CRITICAL,
};

export const KYC_STATUS_COLORS: Record<string, string> = {
  pending: WARNING,
  approved: GOOD,
  rejected: CRITICAL,
};

export const AXIS_TEXT_COLOR = "#6a756e"; // jamogo-gray-500
export const GRID_COLOR = "#e6eae8"; // jamogo-gray-200
