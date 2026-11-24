import {
  LayoutDashboard,
  ShieldCheck,
  LifeBuoy,
  Users,
  Car,
  Route,
  Percent,
  ShieldEllipsis,
  SlidersHorizontal,
  History,
  Bell,
  UsersRound,
  BarChart3,
  ReceiptText,
} from "lucide-react";
import type { Permission } from "@/lib/types";

export type NavLink = {
  href: string;
  label: string;
  /** One line under the page title. */
  description: string;
  icon: typeof LayoutDashboard;
  permission?: Permission;
};

export type NavGroup = { heading?: string; links: NavLink[] };

/** The sidebar, in groups. Pages are hidden from admins without the permission. */
export const NAV_GROUPS: NavGroup[] = [
  {
    links: [
      {
        href: "/",
        label: "Dashboard",
        description: "A live snapshot of rides, riders and drivers.",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    heading: "Operations",
    links: [
      {
        href: "/trips",
        label: "Trips",
        description: "Every ride request, from search to drop-off.",
        icon: Route,
        permission: "trips.view",
      },
      {
        href: "/co-riders",
        label: "Co-rider search",
        description: "How riders find each other to share a ride.",
        icon: UsersRound,
        permission: "analytics.view",
      },
      {
        href: "/support",
        label: "Support Tickets",
        description: "Questions and problems riders and drivers have sent in.",
        icon: LifeBuoy,
        permission: "support.manage",
      },
    ],
  },
  {
    heading: "People",
    links: [
      {
        href: "/users",
        label: "Riders",
        description: "Everyone who books rides on Jamogo.",
        icon: Users,
        permission: "users.manage",
      },
      {
        href: "/drivers",
        label: "Drivers",
        description: "Drivers, their status and their commission.",
        icon: Car,
        permission: "drivers.manage",
      },
      {
        href: "/kyc",
        label: "KYC Review",
        description: "ID and driver documents waiting to be checked.",
        icon: ShieldCheck,
        permission: "kyc.review",
      },
    ],
  },
  {
    heading: "Money",
    links: [
      {
        href: "/commission",
        label: "Commission",
        description: "What drivers owe Jamogo, and what they've paid.",
        icon: Percent,
        permission: "wallet.manage",
      },
      {
        href: "/settlements",
        label: "Settlements",
        description:
          "Each driver's commission for the month: owed, charged, paid and cleared, with PDF statements.",
        icon: ReceiptText,
        permission: "wallet.manage",
      },
    ],
  },
  {
    heading: "Reports",
    links: [
      {
        href: "/insights",
        label: "Insights",
        description:
          "How drivers and riders did over any period, with a report for each.",
        icon: BarChart3,
        permission: "analytics.view",
      },
    ],
  },
  {
    heading: "Engagement",
    links: [
      {
        href: "/notifications",
        label: "Notifications",
        description: "Send push notifications to riders and drivers.",
        icon: Bell,
        permission: "notifications.send",
      },
    ],
  },
  {
    heading: "Admin",
    links: [
      {
        href: "/admins",
        label: "Admins",
        description: "Who can sign in here, and what they can do.",
        icon: ShieldEllipsis,
        permission: "admins.manage",
      },
      {
        href: "/settings",
        label: "Configurations",
        description: "Fares, sharing, commission and app settings.",
        icon: SlidersHorizontal,
        permission: "settings.manage",
      },
      {
        href: "/activity-logs",
        label: "Activity Logs",
        description: "Everything admins have changed, and when.",
        icon: History,
        permission: "logs.view",
      },
    ],
  },
];

export const NAV_LINKS: NavLink[] = NAV_GROUPS.flatMap((g) => g.links);

/** The nav entry for a path (its own page, or a page under it). */
export function navLinkFor(pathname: string): NavLink | undefined {
  return (
    NAV_LINKS.find((l) => l.href === pathname) ??
    NAV_LINKS.filter(
      (l) => l.href !== "/" && pathname.startsWith(`${l.href}/`),
    ).sort((a, b) => b.href.length - a.href.length)[0]
  );
}
