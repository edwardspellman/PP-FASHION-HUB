// Editorial formatting utilities conforming to 2-3 colors design

export function formatINR(amount) {
  if (amount === undefined || amount === null) return '₹0';
  return '₹' + Number(amount).toLocaleString('en-IN');
}

export function calculateSavings(original, deal) {
  const orig = Number(original) || 0;
  const dl = Number(deal) || 0;
  if (orig <= dl) return 0;
  return orig - dl;
}

// Consistent, high-fashion styling using only Black, White, and Crimson Red
export function getMarketplaceColor(marketplace) {
  const store = (marketplace || 'Store').toUpperCase();
  return {
    bg: 'bg-white',
    text: 'text-neutral-900',
    border: 'border-neutral-200',
    badge: 'bg-neutral-900 text-white',
    btn: 'bg-neutral-950 hover:bg-neutral-800 text-white',
    name: store
  };
}
