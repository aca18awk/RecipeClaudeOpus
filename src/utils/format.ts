import type { Difficulty, Ingredient } from '@/types/recipe';

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
};

/** Compact cooking time, e.g. "25 min" or "1 h 30 min". */
export function formatMinutes(total: number): string {
  const hours = Math.floor(total / 60);
  const minutes = total % 60;
  if (hours === 0) return `${minutes} min`;
  if (minutes === 0) return `${hours} h`;
  return `${hours} h ${minutes} min`;
}

/** Spelled-out cooking time for screen readers, e.g. "1 hour 30 minutes". */
export function spokenMinutes(total: number): string {
  const hours = Math.floor(total / 60);
  const minutes = total % 60;
  const parts: string[] = [];
  if (hours > 0) parts.push(`${hours} ${hours === 1 ? 'hour' : 'hours'}`);
  if (minutes > 0 || hours === 0) parts.push(`${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`);
  return parts.join(' ');
}

/** Countdown display, e.g. "08:00" or "1:05:00". */
export function formatClock(totalSeconds: number): string {
  const seconds = Math.max(0, Math.ceil(totalSeconds));
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const mm = String(m).padStart(2, '0');
  const ss = String(s).padStart(2, '0');
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}

export function spokenSeconds(totalSeconds: number): string {
  const seconds = Math.max(0, Math.ceil(totalSeconds));
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  const parts: string[] = [];
  if (m > 0) parts.push(`${m} ${m === 1 ? 'minute' : 'minutes'}`);
  if (s > 0 || m === 0) parts.push(`${s} ${s === 1 ? 'second' : 'seconds'}`);
  return parts.join(' ');
}

const METRIC_UNITS = new Set(['g', 'ml']);
const LARGE_METRIC_UNITS = new Set(['kg', 'l']);
const FRACTIONS: Record<number, string> = { 0.25: '¼', 0.5: '½', 0.75: '¾' };

/** Formats a (possibly rescaled) quantity in a kitchen-friendly way. */
export function formatQuantity(quantity: number, unit: string | null): string {
  if (unit && METRIC_UNITS.has(unit)) {
    return String(quantity >= 10 ? Math.round(quantity) : Math.round(quantity * 10) / 10);
  }
  if (unit && LARGE_METRIC_UNITS.has(unit)) {
    return String(Math.round(quantity * 100) / 100);
  }
  // Spoons, pinches and whole items: round to the nearest quarter.
  const quarters = Math.max(1, Math.round(quantity * 4));
  const whole = Math.floor(quarters / 4);
  const fraction = FRACTIONS[(quarters % 4) / 4] ?? '';
  if (whole === 0) return fraction;
  return `${whole}${fraction}`;
}

export function scaleIngredient(ingredient: Ingredient, factor: number): string {
  if (ingredient.quantity === null) return ingredient.name;
  const amount = formatQuantity(ingredient.quantity * factor, ingredient.unit);
  return ingredient.unit
    ? `${amount} ${ingredient.unit} ${ingredient.name}`
    : `${amount} ${ingredient.name}`;
}

const KNOWN_UNITS = [
  'g',
  'kg',
  'ml',
  'l',
  'tbsp',
  'tsp',
  'cup',
  'cups',
  'pinch',
  'oz',
  'lb',
  'clove',
  'cloves',
];

/**
 * Parses a free-text ingredient line such as "200 g flour", "2 tbsp olive oil",
 * "1/2 tsp salt" or "3 eggs". Lines without a leading number keep `quantity: null`.
 */
export function parseIngredient(line: string): Ingredient {
  const text = line.trim().replace(/\s+/g, ' ');
  const match = text.match(/^(\d+\s+\d+\/\d+|\d+\/\d+|\d+(?:[.,]\d+)?)\s*(.*)$/);
  if (!match) return { name: text, quantity: null, unit: null };

  const quantity = parseAmount(match[1]);
  let rest = match[2];
  let unit: string | null = null;
  const unitMatch = rest.match(/^([a-zA-Z]+)\.?(?:\s+|$)(.*)$/);
  if (unitMatch && KNOWN_UNITS.includes(unitMatch[1].toLowerCase())) {
    unit = unitMatch[1].toLowerCase();
    rest = unitMatch[2];
  }
  return { name: rest.trim() || text, quantity, unit };
}

function parseAmount(value: string): number {
  const parts = value.split(/\s+/);
  return parts.reduce((sum, part) => {
    if (part.includes('/')) {
      const [numerator, denominator] = part.split('/').map(Number);
      return denominator ? sum + numerator / denominator : sum;
    }
    return sum + Number(part.replace(',', '.'));
  }, 0);
}
