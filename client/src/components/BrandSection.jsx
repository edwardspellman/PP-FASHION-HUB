import React from 'react';
import ProductCard from './ProductCard';
import { Sparkles, Plus, Trash2, ArrowRight, Tag } from 'lucide-react';

export default function BrandSection({
  section,
  products = [],
  wishlist = [],
  onToggleWishlist,
  onQuickView,
  onAffiliateClick,
  onShowToast,
  onCreateNewSection,
  onDeleteSection,
  isAdmin = false
}) {
  if (!section || section.isActive === false) return null;

  // Filter products matching this section's brand or store
  const target = (section.brandOrStore || '').toLowerCase().trim();
  const minDisc = Number(section.minDiscount) || 0;

  const matchingProducts = products.filter((p) => {
    const matchBrand = (p.brand || '').toLowerCase().includes(target);
    const matchStore = (p.marketplace || '').toLowerCase().includes(target);
    const isTargetMatch = matchBrand || matchStore;
    const discountMatch = minDisc > 0 ? (p.discountPercent >= minDisc) : true;
    return isTargetMatch && discountMatch && p.inStock !== false;
  });

  return (
    <section className="mb-14 relative">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between pb-3.5 mb-6 border-b border-neutral-200 dark:border-neutral-800 gap-3">
        <div className="space-y-1.5">
          <div className="flex items-center space-x-2 flex-wrap gap-y-1">
            {section.badge && (
              <span className="bg-red-600 text-white font-bold text-[10px] uppercase tracking-wider px-2 py-0.5 shadow-xs">
                {section.badge}
              </span>
            )}
            <span className="inline-flex items-center space-x-1 text-[11px] font-bold uppercase tracking-wider bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 px-2 py-0.5 border border-neutral-200 dark:border-neutral-700">
              <Tag className="w-3 h-3 text-red-600 shrink-0" />
              <span>{section.brandOrStore}</span>
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-neutral-950 dark:text-white">
            {section.title}
          </h2>

          {section.subtitle && (
            <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-2xl">
              {section.subtitle}
            </p>
          )}
        </div>

        {/* Right side controls - Strictly for Authenticated Admin */}
        {isAdmin ? (
          <div className="flex items-center space-x-2 shrink-0">
            {onCreateNewSection && (
              <button
                type="button"
                onClick={onCreateNewSection}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-900 dark:text-white border border-neutral-200 dark:border-neutral-700 text-xs font-bold uppercase tracking-wider cursor-pointer transition-colors"
                title="Create another custom brand or store section"
              >
                <Plus className="w-3.5 h-3.5 text-red-600" />
                <span>+ Add Brand Section</span>
              </button>
            )}

            {onDeleteSection && (
              <button
                type="button"
                onClick={() => onDeleteSection(section.id)}
                className="p-1.5 text-neutral-400 hover:text-red-600 dark:hover:text-red-400 border border-neutral-200 dark:border-neutral-800 hover:border-red-300 dark:hover:border-red-900 cursor-pointer transition-colors"
                title="Remove this custom section"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ) : (
          <div className="hidden sm:flex items-center space-x-1.5 text-[11px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-widest">
            <span className="w-1.5 h-1.5 bg-red-600 rounded-full" />
            <span>Verified Drops</span>
          </div>
        )}
      </div>

      {/* Matching Products Grid */}
      {matchingProducts.length === 0 ? (
        <div className="text-center py-12 px-4 border border-dashed border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/30 space-y-2">
          <p className="text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
            No active deals found matching "{section.brandOrStore}"
          </p>
          <p className="text-[11px] text-neutral-400 dark:text-neutral-500">
            Deals tagged with {section.brandOrStore} in Merchant CRM will appear here automatically.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {matchingProducts.slice(0, 8).map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              isWishlisted={wishlist.some((w) => w.id === product.id)}
              onToggleWishlist={onToggleWishlist}
              onQuickView={onQuickView}
              onAffiliateClick={onAffiliateClick}
              onShowToast={onShowToast}
            />
          ))}
        </div>
      )}
    </section>
  );
}
