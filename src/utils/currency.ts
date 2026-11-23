import {
  Currency,
  InstalmentFrequency,
  InstalmentScheduleItem,
  Market,
  Product,
  StoreSettings,
} from '../types';

export function getCurrencyForMarket(market: Market): Currency {
  return market === 'NG' ? 'NGN' : 'AUD';
}

export function formatMoney(amount: number, currency: Currency): string {
  const safe = Number.isFinite(amount) ? amount : 0;
  if (currency === 'NGN') {
    return `₦${Math.round(safe).toLocaleString('en-NG')}`;
  }
  return `A$${safe.toLocaleString('en-AU', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function getProductPrice(
  product: Pick<Product, 'priceNGN' | 'priceAUD'>,
  market: Market,
  settings: StoreSettings
): number {
  if (market === 'NG') {
    if (product.priceNGN > 0) return product.priceNGN;
    return Math.round(product.priceAUD * settings.ngnPerAud);
  }
  if (product.priceAUD > 0) return product.priceAUD;
  return Math.round((product.priceNGN / Math.max(1, settings.ngnPerAud)) * 100) / 100;
}

export function getComparePrice(
  product: Pick<Product, 'comparePriceNGN' | 'comparePriceAUD'>,
  market: Market
): number | undefined {
  return market === 'NG' ? product.comparePriceNGN : product.comparePriceAUD;
}

export function addDaysISO(baseDate: Date, days: number): string {
  const copy = new Date(baseDate.getTime());
  copy.setDate(copy.getDate() + days);
  return copy.toISOString();
}

export function frequencyToDays(frequency: InstalmentFrequency): number {
  if (frequency === 'daily') return 1;
  if (frequency === 'weekly') return 7;
  if (frequency === 'biweekly') return 14;
  return 30;
}

export function formatShortDate(isoOrTimestamp: unknown): string {
  if (!isoOrTimestamp) return '—';
  let date: Date;
  if (typeof isoOrTimestamp === 'string') {
    date = new Date(isoOrTimestamp);
  } else if (
    typeof isoOrTimestamp === 'object' &&
    isoOrTimestamp !== null &&
    'toDate' in isoOrTimestamp &&
    typeof (isoOrTimestamp as { toDate: () => Date }).toDate === 'function'
  ) {
    date = (isoOrTimestamp as { toDate: () => Date }).toDate();
  } else {
    date = new Date();
  }
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export interface PaySmallSmallBreakdown {
  depositPercent: number;
  depositAmount: number;
  remainingBalance: number;
  instalmentCount: number;
  instalmentAmount: number;
  nextPaymentDate: string;
  schedule: InstalmentScheduleItem[];
}

export function calculatePaySmallSmall(
  totalAmount: number,
  depositPercent: number,
  frequency: InstalmentFrequency,
  instalmentCount: number,
  currency: Currency,
  startDate: Date = new Date(),
  fixedInstalmentAmount?: number
): PaySmallSmallBreakdown {
  const safeTotal = Math.max(0, totalAmount);
  const clampedDepositPct = Math.min(90, Math.max(10, depositPercent));
  const rawDeposit = (safeTotal * clampedDepositPct) / 100;
  const depositAmount =
    currency === 'NGN' ? Math.round(rawDeposit) : Math.round(rawDeposit * 100) / 100;
  const remainingBalance =
    currency === 'NGN'
      ? Math.max(0, Math.round(safeTotal - depositAmount))
      : Math.max(0, Math.round((safeTotal - depositAmount) * 100) / 100);
  const count = Math.max(1, Math.min(frequency === 'daily' ? 365 : 12, instalmentCount));
  const stepDays = frequencyToDays(frequency);
  const baseInstalment =
    currency === 'NGN'
      ? Math.floor(remainingBalance / count)
      : Math.floor((remainingBalance / count) * 100) / 100;

  const schedule: InstalmentScheduleItem[] = [];
  let allocated = 0;
  for (let i = 1; i <= count; i++) {
    const isLast = i === count;
    const amt = fixedInstalmentAmount && frequency === 'daily'
      ? (isLast
          ? currency === 'NGN'
            ? Math.round(remainingBalance - allocated)
            : Math.round((remainingBalance - allocated) * 100) / 100
          : Math.min(fixedInstalmentAmount, Math.max(0, remainingBalance - allocated)))
      : isLast
        ? currency === 'NGN'
          ? Math.round(remainingBalance - allocated)
          : Math.round((remainingBalance - allocated) * 100) / 100
        : baseInstalment;
    allocated += amt;
    schedule.push({
      index: i,
      dueDate: addDaysISO(startDate, stepDays * i),
      amount: amt,
      status: i === 1 ? 'due' : 'upcoming',
    });
  }

  return {
    depositPercent: clampedDepositPct,
    depositAmount,
    remainingBalance,
    instalmentCount: count,
    instalmentAmount: schedule[0]?.amount || 0,
    nextPaymentDate: schedule[0]?.dueDate || addDaysISO(startDate, stepDays),
    schedule,
  };
}
