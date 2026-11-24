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
  Operations: [
    "users.manage",
    "drivers.manage",
    "trips.view",
    "analytics.view",
  ],
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
export type ShareSearchOutcome =
  "hosted" | "joined" | "bookedAlone" | "abandoned" | "searching";

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
  approvalStatus?: "pending" | "approved" | "rejected";
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
  "planning" | "searching" | "matched" | "ongoing" | "completed" | "cancelled";

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
  updatedAt?: string;
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

export type DriverDocumentType =
  | "drivers_license"
  | "ghana_card"
  | "vehicle_registration"
  | "insurance"
  | "roadworthy"
  | "profile_photo"
  | "vehicle_photo";

export type DriverDocument = {
  id: string;
  userId: string;
  type: DriverDocumentType;
  docNumber: string | null;
  expiresAt: string | null;
  status: "pending" | "approved" | "rejected";
  rejectionReason: string | null;
  reviewedAt: string | null;
  createdAt: string;
};

export type ActivityEntry = {
  id: string;
  action: string;
  targetType: string | null;
  targetId: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  admin?: { id: string; name: string; username: string } | null;
};

/** A shared ride this rider joined, with their own part of it. */
export type JoinedTrip = Trip & {
  joinedAs: {
    id: string;
    joinLabel: string;
    dropoffLabel: string | null;
    fare: number;
    noShow: boolean;
  };
};

export type PersonStats = {
  rider: {
    tripsRequested: number;
    tripsCompleted: number;
    tripsCancelled: number;
    spent: number;
    sharedRides: number;
    joinedRides: number;
    noShows: number;
    rating: number;
    ratedTrips: number;
    lastTripAt: string | null;
  };
  driver: {
    tripsCompleted: number;
    tripsCancelled: number;
    earnings: number;
    sharedRides: number;
    commissionCharged: number;
    lastTripAt: string | null;
  } | null;
};

/** GET /admin/users/:id — a rider's or driver's page. */
export type UserDetail = {
  user: AdminUser;
  stats: PersonStats;
  riderTrips: (Trip & { paid: number | null })[];
  joinedTrips: JoinedTrip[];
  driverTrips: (Trip & { takings: number })[];
  commissionEntries: CommissionEntry[];
  kycSubmissions: KycSubmissionSummary[];
  documents: DriverDocument[];
  requiredDocumentTypes: DriverDocumentType[];
  activity: ActivityEntry[];
};

/** One stop on a trip, in the driver's order (backend utils/serializeTrip.js). */
export type TripStop = {
  key: string;
  type: "pickup" | "dropoff";
  person: "rider" | "coRider";
  personId: string;
  name: string;
  label: string | null;
  fare: number;
  done: boolean;
  doneAt: string | null;
  skipped?: boolean;
};

export type TripCoRider = {
  id: string;
  riderId: string | null;
  name: string;
  status: string;
  joinLabel: string;
  dropoffLabel: string | null;
  partySize?: number;
  fare: number;
  soloFare: number;
  finalFare: number;
  waitingFee: number;
  pickedUpAt: string | null;
  droppedOffAt: string | null;
  noShowAt: string | null;
  rider?: (AdminUserSummary & { avatarUrl?: string | null }) | null;
};

/** GET /admin/trips/:id — the trip page. */
export type TripDetail = {
  trip: Omit<Trip, "coRiders" | "offers" | "rider"> & {
    acceptedDriverOfferId: string | null;
    partySize: number;
    waitingFee: number;
    liveFare: number;
    soloFare: number;
    fareTotal: number;
    finalFare: number;
    takings: number | null;
    stops: TripStop[];
    coRiders: TripCoRider[];
    driverRating: number | null;
    cancelledReason: string | null;
    cancelledBy: "rider" | "driver" | "system" | null;
    cancelledAt: string | null;
    completedAt: string | null;
    arrivedAt: string | null;
    pickedUpAt: string | null;
    droppedOffAt: string | null;
    riderNoShow: boolean;
    seatsLeft: number;
    rider?: AdminUserSummary & { avatarUrl?: string | null; rating?: string };
    offers?: (DriverOffer & {
      driver?: (AdminUserSummary & { avatarUrl?: string | null }) | null;
    })[];
  };
  commissionEntries: CommissionEntry[];
  sosAlerts: {
    id: string;
    createdAt: string;
    lat: string | null;
    lng: string | null;
    user?: AdminUserSummary;
  }[];
  messageCount: number;
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
  totals: {
    users: number;
    devices: number;
    successCount: number;
    failureCount: number;
  };
}

export type DashboardPeriod = "today" | "week" | "month" | "all";

/** A number for the period and its % change vs the period before (null: nothing to compare). */
export type Kpi = { value: number; change?: number | null };

/** GET /admin/analytics/dashboard */
export type DashboardData = {
  period: DashboardPeriod;
  from: string;
  to: string;
  kpis: {
    tripsRequested: Kpi;
    tripsCompleted: Kpi;
    /** Every rider's fare plus waiting fees, all paid to drivers directly. */
    fares: Kpi;
    commission: Kpi;
    averageFare: Kpi;
    sharedRides: Kpi & { rate: number | null };
    cancelled: Kpi;
    newRiders: Kpi;
  };
  now: {
    liveTrips: number;
    searching: number;
    driversOnline: number;
    driversPending: number;
  };
  totals: { riders: number; drivers: number };
  trend: { date: string; fares: number; commission: number; trips: number }[];
  tripsByStatus: { status: string; count: number }[];
};

// ---- Insights & settlements (GET /admin/insights/*, /admin/settlements) ----

export type DateRange = { from: string; to: string };

export type DriverInsightRow = {
  driverId: string;
  name: string;
  phone: string | null;
  avatarUrl: string | null;
  plate: string | null;
  rating: number | null;
  trips: number;
  fares: number;
  averageFare: number;
  commission: number;
  sharedRides: number;
  cancelled: number;
  owed: number;
};

export type DriversInsights = {
  range: DateRange;
  totals: {
    activeDrivers: number;
    trips: number;
    fares: number;
    commission: number;
    averageFare: number;
    sharedRate: number | null;
    cancelledByDrivers: number;
  };
  drivers: DriverInsightRow[];
};

export type RiderInsightRow = {
  riderId: string;
  name: string;
  phone: string | null;
  avatarUrl: string | null;
  rating: number | null;
  trips: number;
  spent: number;
  averageFare: number;
  sharedRides: number;
  joined: number;
  cancelled: number;
  noShows: number;
};

export type RidersInsights = {
  range: DateRange;
  totals: {
    activeRiders: number;
    trips: number;
    spent: number;
    averageFare: number;
    sharedRate: number | null;
    cancelled: number;
    noShows: number;
  };
  riders: RiderInsightRow[];
};

export type CommissionStatement = {
  opening: number;
  charged: number;
  paid: number;
  waived: number;
  closing: number;
};

export type DriverReport = {
  range: DateRange;
  driver: AdminUser;
  summary: {
    trips: number;
    fares: number;
    averageFare: number;
    sharedRides: number;
    ridersCarried: number;
  };
  statement: CommissionStatement;
  daily: { date: string; trips: number; fares: number; commission: number }[];
  trips: {
    id: string;
    completedAt: string;
    pickupLabel: string;
    destinationLabel: string | null;
    rider: { id: string; name: string } | null;
    riders: number;
    shared: boolean;
    fares: number;
  }[];
  entries: CommissionEntry[];
};

export type RiderReport = {
  range: DateRange;
  rider: AdminUser;
  summary: {
    trips: number;
    spent: number;
    averageFare: number;
    sharedRides: number;
    joined: number;
  };
  daily: { date: string; trips: number; spent: number }[];
  trips: {
    id: string;
    completedAt: string;
    pickupLabel: string;
    destinationLabel: string | null;
    driver: { id: string | null; name: string } | null;
    shared: boolean;
    joined: boolean;
    paid: number;
  }[];
};

export type SettlementRow = CommissionStatement & {
  driverId: string;
  name: string;
  phone: string | null;
  plate: string | null;
  trips: number;
  fares: number;
  status: "settled" | "part_paid" | "unpaid";
};

export type Settlements = {
  month: string;
  range: DateRange;
  totals: {
    drivers: number;
    charged: number;
    paid: number;
    waived: number;
    outstanding: number;
    settled: number;
  };
  drivers: SettlementRow[];
};
