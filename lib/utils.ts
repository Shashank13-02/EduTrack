import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
export function calculatePercentage(part: number, total: number): number {
  if (!total || total === 0) return 0;
  return Math.round((part / total) * 100);
}

export function calculateAverage(numbers: number[]): number {
  if (!numbers || numbers.length === 0) return 0;
  const sum = numbers.reduce((acc, curr) => acc + (curr || 0), 0);
  return Math.round(sum / numbers.length);
}

export function calculateWeightedAverage(components: { score: number; max: number }[]): number {
  if (!components || components.length === 0) return 0;
  let totalScore = 0;
  let totalMax = 0;

  components.forEach(c => {
    totalScore += (c.score || 0);
    totalMax += (c.max || 1);
  });

  return Math.round((totalScore / totalMax) * 100);
}
export function formatReadableDate(date: Date | string | number): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

export function getPastDates(days: number): Date[] {
  const dates: Date[] = [];
  const today = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);
    dates.push(date);
  }

  return dates;
}
