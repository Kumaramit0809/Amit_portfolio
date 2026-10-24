export function splitTitle(s) {
  s = String(s);
  const m = s.match(/^(.{2,34}?)\s*(?:[:–—-]|\()\s*(.*)$/);
  return m ? [m[1].trim(), m[2].replace(/\)$/, '').trim()] : s.length <= 60 ? [s, ''] : [s.slice(0, 40).trim() + '…', s];
}

export const initials = (name) =>
  name.split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase();