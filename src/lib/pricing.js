import { PACKAGES, ADDONS, TWO_STORY_PERCENT } from '../config/site.js';

export const money = (n) => `$${Math.round(n).toLocaleString('en-US')}`;
export const priceLabel = (price) => (price == null ? 'Online quoting' : `Starting at ${money(price)}`);

export function addonPriceLabel(a) {
  if (a.price == null) return 'Online quoting';
  return a.id === 'own-lights' ? money(a.price) : `+${money(a.price)}`;
}

export function visibleAddons(type) {
  return ADDONS.filter((a) => !(a.seasonalOnly && type === 'Permanent'));
}

/* "Starting at" estimate. Anything unpriced (or Permanent) reads "Online quoting". */
export function estimate(draft) {
  const pkg = PACKAGES.find((p) => p.id === draft.pkg);
  if (!pkg || draft.type === 'Permanent' || pkg.price == null) return 'Online quoting';
  let total = pkg.price;
  if (draft.stories === 2) total += (pkg.price * TWO_STORY_PERCENT) / 100;
  for (const id of draft.addons || []) {
    const a = ADDONS.find((x) => x.id === id);
    if (!a) continue;
    if (a.price == null) return 'Online quoting';
    total += a.price;
  }
  return `Starting at ${money(total)}`;
}

/* Stored in the D1 `vehicle` column: "Permanent · 2-Story · Front & Sides · +Tree wrap". */
export function vehicleString(draft) {
  const parts = [draft.type, draft.stories === 2 ? '2-Story' : '1-Story', draft.pkg];
  for (const id of draft.addons || []) {
    const a = ADDONS.find((x) => x.id === id);
    if (a) parts.push(`+${a.short}`);
  }
  return parts.filter(Boolean).join(' · ');
}

export function addonNames(ids) {
  return (ids || []).map((id) => ADDONS.find((a) => a.id === id)?.short).filter(Boolean);
}
