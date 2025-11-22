import assert from 'node:assert/strict';
import test from 'node:test';
import { BookingInterval, hasConflict } from './checkConflicts';

const base: BookingInterval[] = [
  {
    serviceId: 'haircut',
    staffId: 'amy',
    startsAt: '2025-02-01T09:00:00.000Z',
    endsAt: '2025-02-01T09:30:00.000Z',
  },
  {
    serviceId: 'haircut',
    staffId: 'ben',
    startsAt: '2025-02-01T09:30:00.000Z',
    endsAt: '2025-02-01T10:00:00.000Z',
  },
];

test('detects overlapping bookings for same staff', () => {
  const candidate: BookingInterval = {
    serviceId: 'haircut',
    staffId: 'amy',
    startsAt: '2025-02-01T09:15:00.000Z',
    endsAt: '2025-02-01T09:45:00.000Z',
  };

  assert.ok(hasConflict(base, candidate));
});

test('allows back-to-back bookings', () => {
  const candidate: BookingInterval = {
    serviceId: 'haircut',
    staffId: 'amy',
    startsAt: '2025-02-01T09:30:00.000Z',
    endsAt: '2025-02-01T10:00:00.000Z',
  };

  assert.equal(hasConflict(base, candidate), false);
});

test('ignores other services by default', () => {
  const candidate: BookingInterval = {
    serviceId: 'massage',
    staffId: null,
    startsAt: '2025-02-01T09:10:00.000Z',
    endsAt: '2025-02-01T09:40:00.000Z',
  };

  assert.equal(hasConflict(base, candidate), false);
});
