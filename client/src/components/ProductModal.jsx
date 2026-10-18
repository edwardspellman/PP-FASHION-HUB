import React, { useState } from 'react';
import { 
  X, 
  ArrowUpRight, 
  Heart, 
  Tag, 
  Check, 
  ShieldCheck, 
  Clock 
} from 'lucide-react';
import { formatINR, calculateSavings } from '../utils/formatters';

export default function ProductModal({
  product,
  isOpen,
  onClose,
  isWishlisted,
  onToggleWishlist,
  onShowToast
}) {
  const [copiedCoupon, setCopiedCoupon] = useState(false);

  if (!isOpen || !product) return null;

  const savings = calculateSavings(product.originalPrice, product.dealPrice);

  const handleCopyCoupon = () => {
    if (!product.couponCode) return;
    navigator.clipboard.writeText(product.couponCode);
    setCopiedCoupon(true);
    onShowToast(`Coupon "${product.couponCode}" copied!`);
    setTimeout(() => {
      setCopiedCoupon(false);
    }, 2000);
  };

  const handleAffiliateClick = () => {
    try {
      if (navigator.sendBeacon) {
        navigator.sendBeacon(`/api/click/${product.id}`);
      } else {
        fetch(`/api/click/${product.id}`, { method: 'POST', keepalive: true }).catch(() => {});
      }
    } catch (e) {}
  };

  const isMeesho = product.marketplace?.toLowerCase() === 'meesho';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="relative bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 w-full max-w-2xl max-h-[90vh] flex flex-col md:flex-row overflow-hidden shadow-2xl transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-20 w-8 h-8 bg-white/90 dark:bg-neutral-800/90 text-neutral-900 dark:text-white border border-neutral-200 dark:border-neutral-700 flex items-center justify-center cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-700"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Product Image */}
        <div className="md:w-1/2 relative bg-neutral-100 dark:bg-neutral-950 aspect-[3/4] md:aspect-auto">
          <img
            src={product.imageUrl || 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80'}
            alt={product.title}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80';
            }}
            className="w-full h-full object-cover object-top"
          />

          <div className="absolute top-3 left-3 flex flex-col gap-1 items-start">
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 ${
              isMeesho 
                ? 'bg-fuchsia-700 text-white' 
                : 'bg-neutral-950 dark:bg-white text-white dark:text-neutral-950'
            }`}>
              {product.marketplace}
            </span>
            {product.discountPercent > 0 && (
              <span className="bg-red-600 text-white font-bold text-xs px-2 py-0.5">
                -{product.discountPercent}%
              </span>
            )}
          </div>
        </div>

        {/* Product Info & Actions */}
        <div className="md:w-1/2 p-6 flex flex-col justify-between overflow-y-auto">
          <div className="space-y-4">
            <div>
              <div className="text-[10px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-widest mb-1">
                {product.brand} • {product.category}
              </div>

              <h2 className="text-base font-bold text-neutral-950 dark:text-white leading-snug">
                {product.title}
              </h2>
            </div>

            {/* Price Box */}
            <div className="bg-neutral-50 dark:bg-neutral-950 p-3.5 border border-neutral-200 dark:border-neutral-800">
              <div className="flex items-baseline space-x-2.5">
                <span className="text-2xl font-black text-neutral-950 dark:text-white">
                  {formatINR(product.dealPrice)}
                </span>
                {product.originalPrice > product.dealPrice && (
                  <span className="text-xs text-neutral-400 dark:text-neutral-500 line-through">
                    {formatINR(product.originalPrice)}
                  </span>
                )}
                {savings > 0 && (
                  <span className="text-xs font-bold text-red-600 dark:text-red-400">
                    Save {formatINR(savings)}
                  </span>
                )}
              </div>
              <p className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-1 flex items-center space-x-1">
                <Clock className="w-3 h-3 text-neutral-400" />
                <span>Verified deal price. Direct checkout at merchant store.</span>
              </p>
            </div>

            {/* Coupon Section */}
            {product.couponCode && (
              <div className="border border-dashed border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 p-2.5 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-neutral-600 dark:text-neutral-300 uppercase tracking-wider flex items-center space-x-1">
                    <Tag className="w-3 h-3 text-red-600" />
                    <span>Promo Coupon</span>
                  </span>
                  <div className="flex items-center space-x-2 mt-0.5">
                    <span className="font-mono font-bold text-neutral-950 dark:text-white text-xs">
                      {product.couponCode}
                    </span>
                    {product.couponDiscount && (
                      <span className="text-[10px] text-neutral-500 dark:text-neutral-400">({product.couponDiscount})</span>
                    )}
                  </div>
                </div>

                <button
                  onClick={handleCopyCoupon}
                  className="px-2.5 py-1 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 hover:border-black dark:hover:border-white text-neutral-900 dark:text-white text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer"
                >
                  {copiedCoupon ? 'Copied' : 'Copy'}
                </button>
              </div>
            )}

            {/* Description */}
            <div>
              <h4 className="text-[10px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-widest mb-1">
                Details
              </h4>
              <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
                {product.description || 'Premium quality fashion product sourced from official merchant store.'}
              </p>
            </div>

            <div className="flex items-center space-x-1.5 text-[11px] text-neutral-500 dark:text-neutral-400 pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-neutral-700 dark:text-neutral-300" />
              <span>Fulfilled directly by {product.marketplace}.</span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 space-y-2">
            <a
              href={product.affiliateUrl || '#'}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleAffiliateClick}
              className={`w-full py-3 px-4 font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-1.5 transition-colors cursor-pointer text-center ${
                isMeesho
                  ? 'bg-fuchsia-700 hover:bg-fuchsia-800 text-white'
                  : 'bg-neutral-950 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-neutral-950'
              }`}
            >
              <span>Buy on {product.marketplace}</span>
              <ArrowUpRight className="w-4 h-4" />
            </a>

            <button
              onClick={() => onToggleWishlist(product)}
              className={`w-full py-2 px-3 border text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-1.5 transition-colors cursor-pointer ${
                isWishlisted
                  ? 'border-red-600 text-red-600 bg-red-50 dark:bg-red-950/40'
                  : 'border-neutral-300 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 hover:border-black dark:hover:border-white'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-current' : ''}`} />
              <span>{isWishlisted ? 'Saved in Wishlist' : 'Add to Wishlist'}</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
