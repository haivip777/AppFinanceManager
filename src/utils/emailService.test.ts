import { describe, it, expect } from 'vitest';
import { getPreviousMonthKey, isEligibleForAutoReport } from './emailService';

describe('Email Service Utils', () => {
  it('correctly calculates previous month for normal months', () => {
    const novDate = new Date('2026-11-05T10:00:00Z');
    expect(getPreviousMonthKey(novDate)).toBe('2026-10');

    const julyDate = new Date('2026-07-04T10:00:00Z');
    expect(getPreviousMonthKey(julyDate)).toBe('2026-06');
  });

  it('correctly rolls back to December of previous year for January', () => {
    const janDate = new Date('2027-01-05T10:00:00Z');
    expect(getPreviousMonthKey(janDate)).toBe('2026-12');
  });

  it('evaluates auto report eligibility from day 4 onwards', () => {
    expect(isEligibleForAutoReport(new Date('2026-11-01T10:00:00Z'))).toBe(false);
    expect(isEligibleForAutoReport(new Date('2026-11-03T10:00:00Z'))).toBe(false);
    expect(isEligibleForAutoReport(new Date('2026-11-04T10:00:00Z'))).toBe(true);
    expect(isEligibleForAutoReport(new Date('2026-11-05T10:00:00Z'))).toBe(true);
    expect(isEligibleForAutoReport(new Date('2026-11-06T10:00:00Z'))).toBe(true);
    expect(isEligibleForAutoReport(new Date('2026-11-20T10:00:00Z'))).toBe(true);
  });
});

