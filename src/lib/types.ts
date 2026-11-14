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
  | "wallet.manage"
  | "notifications.send";

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
  "notifications.send",
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

/** GET /admin/analytics/share-search — how "Find co-riders" searches end. */
export type ShareSearchOutcome = "hosted" | "joined" | "bookedAlone" | "abandoned" | "searching";

export type ShareSearchStats = {
  days: number;
  searches: number;
  outcomes: Record<ShareSearchOutcome, number>;
  /** % of finished searches that ended in a shared ride; null with none finished. */
  sharedRate: number | null;
  requests: {
    sent: number;
    accepted: number;
    declined: number;
    pending: number;
    joinedCarOnTheWay: number;
  };
  daily: { date: string; searches: number; shared: number }[];
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
  /** Off by default: no commission is recorded while false. */
  commissionEnabled: boolean;
  /** GH₵ of unpaid commission allowed before the driver can't accept rides. */
  commissionLimit: string;
  commissionOwed: string;
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
  isSuspended: boolean;
  suspendedReason: string | null;
  suspendedAt: string | null;
  /** Times a driver waited out the free time and this rider never came. */
  noShowCount?: number;
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

/** One row of the commission ledger (replaces the wallet). */
export type CommissionEntry = {
  id: string;
  driverId: string;
  /** charge = a completed trip's commission; payment = MoMo via Paystack; waiver = cleared by an admin. */
  type: "charge" | "payment" | "waiver";
  status: "pending" | "completed" | "failed";
  amount: string;
  reference: string;
  tripId: string | null;
  fare: string | null;
  rate: string | null;
  phone: string | null;
  provider: string | null;
  note: string | null;
  createdAt: string;
  driver?: AdminUserSummary;
};

/** A row on the Commission page (GET /admin/commission/drivers). */
export type CommissionDriver = {
  userId: string;
  name: string;
  phone: string;
  avatarUrl: string | null;
  commissionEnabled: boolean;
  commissionRate: number;
  commissionLimit: number;
  commissionOwed: number;
  blocked: boolean;
  totalTrips: number;
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
  commissionEntries: CommissionEntry[];
  kycSubmissions: KycSubmissionSummary[];
};

export type NotificationAudience = "all" | "riders" | "drivers" | "user";

export interface AudienceAppStats {
  users: number;
  devices: number;
  configured: boolean;
}

export interface NotificationAudienceStats {
  rider: AudienceAppStats;
  driver: AudienceAppStats;
}

export interface NotificationAppResult {
  users: number;
  devices: number;
  successCount: number;
  failureCount: number;
  error?: "not_configured" | "send_error";
}

export interface SendNotificationResult {
  results: { rider: NotificationAppResult; driver: NotificationAppResult };
  totals: { users: number; devices: number; successCount: number; failureCount: number };
}
