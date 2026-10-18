import React from 'react';
import { X, Trash2, ArrowUpRight, Heart } from 'lucide-react';
import { formatINR, calculateSavings } from '../utils/formatters';

export default function WishlistDrawer({
  isOpen,
  onClose,
  wishlistItems,
  onRemoveItem,
  onClearWishlist
}) {
  if (!isOpen) return null;

  const totalOriginal = wishlistItems.reduce((acc, item) => acc + (item.originalPrice || item.dealPrice), 0);
  const totalDeal = wishlistItems.reduce((acc, item) => acc + item.dealPrice, 0);
  const totalSavings = totalOriginal - totalDeal;

  const handleTrackClick = (id) => {
    try {
      if (navigator.sendBeacon) {
        navigator.sendBeacon(`/api/click/${id}`);
      } else {
        fetch(`/api/click/${id}`, { method: 'POST', keepalive: true }).catch(() => {});
      }
    } catch (e) {}
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex justify-end animate-in fade-in duration-150">
      <div 
        className="w-full max-w-md bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white h-full shadow-2xl flex flex-col border-l border-neutral-300 dark:border-neutral-800 transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Heart className="w-4 h-4 text-red-600 fill-red-600" />
            <h2 className="font-bold text-base text-neutral-950 dark:text-white uppercase tracking-wide">
              Saved Deals ({wishlistItems.length})
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List of items */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
          {wishlistItems.length === 0 ? (
            <div className="text-center py-20 space-y-2">
              <div className="w-12 h-12 border border-neutral-200 dark:border-neutral-800 text-neutral-400 mx-auto flex items-center justify-center">
                <Heart className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-neutral-800 dark:text-neutral-200 text-sm uppercase">Wishlist is Empty</h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-xs mx-auto">
                Save your favorite fashion deals to track prices and checkout anytime.
              </p>
            </div>
          ) : (
            wishlistItems.map((item) => {
              const savings = calculateSavings(item.originalPrice, item.dealPrice);
              const isMeesho = item.marketplace?.toLowerCase() === 'meesho';
              return (
                <div
                  key={item.id}
                  className="flex space-x-3 p-3 border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950"
                >
                  <img
                    src={item.imageUrl || 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=400&q=80'}
                    alt={item.title}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=400&q=80';
                    }}
                    className="w-16 h-20 object-cover object-top border border-neutral-200 dark:border-neutral-800 shrink-0"
                  />

                  <div className="flex-1 flex flex-col justify-between min-w-0">
                    <div>
                      <div className="flex items-center justify-between text-[10px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                        <span>{item.brand}</span>
                        <span className={`border px-1 ${
                          isMeesho 
                            ? 'text-fuchsia-700 dark:text-fuchsia-300 border-fuchsia-300 dark:border-fuchsia-800 bg-fuchsia-50 dark:bg-fuchsia-950/60' 
                            : 'text-neutral-900 dark:text-neutral-200 border-neutral-200 dark:border-neutral-700'
                        }`}>
                          {item.marketplace}
                        </span>
                      </div>
                      <h4 className="text-xs font-medium text-neutral-900 dark:text-white truncate mt-0.5" title={item.title}>
                        {item.title}
                      </h4>
                      <div className="flex items-baseline space-x-1.5 mt-1">
                        <span className="text-sm font-extrabold text-neutral-950 dark:text-white">
                          {formatINR(item.dealPrice)}
                        </span>
                        {item.originalPrice > item.dealPrice && (
                          <span className="text-[11px] text-neutral-400 dark:text-neutral-500 line-through">
                            {formatINR(item.originalPrice)}
                          </span>
                        )}
                        {savings > 0 && (
                          <span className="text-[11px] font-bold text-red-600 dark:text-red-400">
                            (-{item.discountPercent}%)
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <a
                        href={item.affiliateUrl || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => handleTrackClick(item.id)}
                        className="text-[11px] font-bold uppercase tracking-wider text-neutral-950 dark:text-white hover:underline inline-flex items-center space-x-1"
                      >
                        <span>Buy on {item.marketplace}</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </a>
                      <button
                        onClick={() => onRemoveItem(item.id)}
                        className="text-neutral-400 hover:text-red-600 p-1 cursor-pointer"
                        title="Remove"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {wishlistItems.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 space-y-3">
            <div className="space-y-1 text-xs">
              <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                <span>Total Items Deal Value:</span>
                <span className="font-bold text-neutral-950 dark:text-white">{formatINR(totalDeal)}</span>
              </div>
              {totalSavings > 0 && (
                <div className="flex justify-between text-red-600 dark:text-red-400 font-bold">
                  <span>Total Savings:</span>
                  <span>{formatINR(totalSavings)}</span>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2 pt-1">
              <button
                onClick={onClearWishlist}
                className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-300 hover:text-black dark:hover:text-white border border-neutral-300 dark:border-neutral-700 transition-colors cursor-pointer"
              >
                Clear
              </button>
              <button
                onClick={onClose}
                className="flex-1 py-2.5 bg-neutral-950 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-neutral-950 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer text-center"
              >
                Close Drawer
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
