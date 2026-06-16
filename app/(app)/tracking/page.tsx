import { requireRole } from "@/lib/auth";
import { ROLES } from "@/lib/constants";
import { TrackingClient } from "./TrackingClient";

export default async function TrackingPage() {
  await requireRole(ROLES.ADMIN, ROLES.ISSUER, ROLES.DRIVER);
  return <TrackingClient />;
}
