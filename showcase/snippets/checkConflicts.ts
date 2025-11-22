export type BookingInterval = {
  serviceId: string;
  staffId: string | null;
  startsAt: string; // ISO string
  endsAt: string; // ISO string
};

/**
 * Detects whether a candidate booking overlaps an existing confirmed booking.
 * The comparison is exclusive of the end time so back-to-back bookings are allowed.
 */
export function hasConflict(existing: BookingInterval[], candidate: BookingInterval): boolean {
  const candidateStart = Date.parse(candidate.startsAt);
  const candidateEnd = Date.parse(candidate.endsAt);

  if (!Number.isFinite(candidateStart) || !Number.isFinite(candidateEnd)) {
    throw new Error('Invalid candidate interval');
  }

  if (candidateStart >= candidateEnd) {
    throw new Error('Invalid duration: startsAt must be before endsAt');
  }

  return existing.some((booking) => {
    if (booking.serviceId !== candidate.serviceId) return false;
    if (booking.staffId && candidate.staffId && booking.staffId !== candidate.staffId) return false;

    const existingStart = Date.parse(booking.startsAt);
    const existingEnd = Date.parse(booking.endsAt);
    if (!Number.isFinite(existingStart) || !Number.isFinite(existingEnd)) return false;

    const overlaps = candidateStart < existingEnd && candidateEnd > existingStart;
    return overlaps;
  });
}
