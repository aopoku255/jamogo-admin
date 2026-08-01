export type AdminUserSummary = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
};

export type Permission =
  | "kyc.review"
  | "support.manage"
  | "users.manage"
  | "drivers.manage"
  | "trips.view"
  | "admins.manage"
  | "settings.manage"
  | "logs.view"
  | "analytics.view"
  | "wallet.manage";

export const ALL_PERMISSIONS: Permission[] = [
  "kyc.review",
  "support.manage",
  "users.manage",
  "drivers.manage",
  "trips.view",
  "admins.manage",
  "settings.manage",
  "logs.view",
  "analytics.view",
  "wallet.manage",
];

export const ROLE_PRESETS: Record<string, Permission[]> = {
  "Super Admin": [...ALL_PERMISSIONS],
  "Support Agent": ["support.manage"],
  "KYC Reviewer": ["kyc.review"],
  Operations: ["users.manage", "drivers.manage", "trips.view", "analytics.view"],
};

export type SettingCategory = "flags" | "fare" | "ride";

export type Setting = {
  key: string;
  category: SettingCategory;
  value: boolean | number | string;
  updatedAt: string;
};

export type ActivityLog = {
  id: string;
  adminId: string;
  action: string;
  targetType: string | null;
  targetId: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  admin: { id: string; name: string; username: string };
};

export type AdminAccount = {
  id: string;
  name: string;
  username: string;
  role: string;
  permissions: Permission[];
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
};

export type AnalyticsOverview = {
  userGrowth: { date: string; riders: number; drivers: number }[];
  tripsByDay: { date: string; count: number }[];
  tripsByStatus: { status: TripStatus; count: number }[];
  kycByStatus: { status: KycStatus; count: number }[];
};

export type KycStatus = "pending" | "approved" | "rejected";

export type KycSubmission = {
  id: string;
  userId: string;
  status: KycStatus;
  rejectionReason: string | null;
  reviewedAt: string | null;
  createdAt: string;
  user: AdminUserSummary;
};

export type KycDecision = "approve" | "reject";

export type TicketStatus = "open" | "resolved";

export type SupportTicket = {
  id: string;
  userId: string;
  subject: string;
  message: string;
  status: TicketStatus;
  createdAt: string;
  user: AdminUserSummary;
};

export type IdentityStatus = "unverified" | "pending" | "verified" | "rejected";

export type DriverProfile = {
  id: string;
  userId: string;
  carMake: string | null;
  carModel: string | null;
  plateNumber: string | null;
  isOnline: boolean;
  rating: string;
  totalTrips: number;
  commissionRate: string;
};

export type AdminUser = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  avatarUrl: string | null;
  role: "rider" | "driver";
  phoneVerified: boolean;
  emailVerified: boolean;
  identityStatus: IdentityStatus;
  identityVerified: boolean;
  walletBalance: string;
  isSuspended: boolean;
  suspendedReason: string | null;
  suspendedAt: string | null;
  createdAt: string;
  driverProfile?: DriverProfile | null;
};

export type TripStatus =
  | "planning"
  | "searching"
  | "matched"
  | "ongoing"
  | "completed"
  | "cancelled";

export type DriverOffer = {
  id: string;
  tripId: string;
  driverId: string | null;
  name: string;
  car: string;
  plate: string;
  rating: string;
  price: number;
  state: "incoming" | "countered" | "accepted" | "declined";
  driver?: AdminUserSummary | null;
};

export type CoRider = {
  id: string;
  tripId: string;
  status: string;
};

export type Trip = {
  id: string;
  riderId: string;
  pickupLabel: string;
  destinationLabel: string | null;
  mode: "solo" | "share";
  yourOffer: number;
  distanceKm: string | null;
  status: TripStatus;
  riderRating: number | null;
  createdAt: string;
  rider?: AdminUserSummary;
  acceptedOffer?: DriverOffer | null;
  offers?: DriverOffer[];
  coRiders?: CoRider[];
};

export type WalletTransaction = {
  id: string;
  userId: string;
  type: "credit" | "debit";
  amount: string;
  description: string;
  status: "pending" | "completed" | "failed";
  createdAt: string;
};

/** The platform-wide view (GET /admin/wallet-transactions) — includes who it belongs to. */
export type AdminWalletTransaction = WalletTransaction & {
  reference: string | null;
  category: "trip_earning" | "commission" | "topup" | "withdrawal" | "adjustment" | "corider_fare" | null;
  balanceBefore: string | null;
  balanceAfter: string | null;
  user: AdminUserSummary;
};

export type PayoutStatus = "pending" | "processing" | "paid" | "failed";

export type Payout = {
  id: string;
  userId: string;
  amount: string;
  channel: "momo" | "telecel" | "bank";
  destination: Record<string, string>;
  status: PayoutStatus;
  provider: string | null;
  providerReference: string | null;
  failureReason: string | null;
  paidAt: string | null;
  createdAt: string;
  user: AdminUserSummary;
};

export type KycSubmissionSummary = {
  id: string;
  status: KycStatus;
  createdAt: string;
};

export type UserDetail = {
  user: AdminUser;
  riderTrips: Trip[];
  driverTrips: Trip[];
  transactions: WalletTransaction[];
  kycSubmissions: KycSubmissionSummary[];
};
