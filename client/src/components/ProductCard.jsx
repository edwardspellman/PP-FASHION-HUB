import React, { useState } from 'react';
import { 
  ArrowUpRight, 
  Heart, 
  Tag, 
  Copy, 
  Check, 
  Info,
  ExternalLink 
} from 'lucide-react';
import { formatINR, calculateSavings } from '../utils/formatters';

export default function ProductCard({
  product,
  isWishlisted,
  onToggleWishlist,
  onQuickView,
  onAffiliateClick,
  onShowToast
}) {
  const [copiedCoupon, setCopiedCoupon] = useState(false);
  const savings = calculateSavings(product.originalPrice, product.dealPrice);

  const handleCopyCoupon = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!product.couponCode) return;
    navigator.clipboard.writeText(product.couponCode);
    setCopiedCoupon(true);
    onShowToast(`Coupon code "${product.couponCode}" copied!`);
    setTimeout(() => {
      setCopiedCoupon(false);
    }, 2000);
  };

  const handleDirectClick = () => {
    // Fire click telemetry to server
    try {
      if (navigator.sendBeacon) {
        navigator.sendBeacon(`/api/click/${product.id}`);
      } else {
        fetch(`/api/click/${product.id}`, { method: 'POST', keepalive: true }).catch(() => {});
      }
    } catch (e) {
      // Telemetry fallback
    }
  };

  return (
    <div className="group bg-white border border-neutral-200 hover:border-neutral-900 transition-colors duration-200 flex flex-col justify-between relative">
      
      {/* Top Image + Overlay */}
      <div className="relative aspect-[3/4] bg-neutral-100 overflow-hidden">
        {/* Direct Link on image */}
        <a
          href={product.affiliateUrl || '#'}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleDirectClick}
          className="block w-full h-full cursor-pointer"
          title={`Shop ${product.title} on ${product.marketplace}`}
        >
          <img
            src={product.imageUrl || 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80'}
            alt={product.title}
            loading="lazy"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80';
            }}
            className="w-full h-full object-cover object-top group-hover:scale-102 transition-transform duration-300"
          />
        </a>

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start pointer-events-none">
          {product.discountPercent > 0 && (
            <span className="bg-red-600 text-white font-bold text-xs px-2 py-0.5 tracking-tight">
              -{product.discountPercent}%
            </span>
          )}
          {product.badge && (
            <span className="bg-neutral-900 text-white font-medium text-[10px] uppercase tracking-wider px-2 py-0.5">
              {product.badge}
            </span>
          )}
        </div>

        {/* Top Right Action: Wishlist */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onToggleWishlist(product);
          }}
          className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-colors cursor-pointer border ${
            isWishlisted
              ? 'bg-red-600 text-white border-red-600'
              : 'bg-white/90 text-neutral-800 border-neutral-200 hover:bg-white hover:text-red-600'
          }`}
          title={isWishlisted ? 'Saved in wishlist' : 'Save to wishlist'}
        >
          <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-current' : ''}`} />
        </button>

        {/* Store Badge on Bottom Left of Image */}
        <div className="absolute bottom-3 left-3 pointer-events-none">
          <span className="bg-white/95 text-neutral-900 font-bold text-[10px] uppercase tracking-wider px-2.5 py-1 border border-neutral-200">
            {product.marketplace}
          </span>
        </div>

        {/* Quick Info Modal Trigger button on Bottom Right */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onQuickView(product);
          }}
          className="absolute bottom-3 right-3 w-7 h-7 bg-white/90 hover:bg-white text-neutral-700 hover:text-neutral-950 rounded-full flex items-center justify-center border border-neutral-200 shadow-sm cursor-pointer"
          title="View product specifications & coupons"
        >
          <Info className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Details Area */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Brand & Category */}
          <div className="flex items-center justify-between text-[11px] font-semibold text-neutral-500 uppercase tracking-widest mb-1">
            <span>{product.brand}</span>
            <span>{product.category}</span>
          </div>

          {/* Product Title - Direct Affiliate Link */}
          <a
            href={product.affiliateUrl || '#'}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleDirectClick}
            className="block font-medium text-neutral-900 text-sm leading-snug line-clamp-2 hover:underline mb-2.5"
            title={product.title}
          >
            {product.title}
          </a>

          {/* Pricing Row */}
          <div className="flex items-baseline space-x-2.5 mb-2.5">
            <span className="text-lg font-extrabold text-neutral-950">
              {formatINR(product.dealPrice)}
            </span>
            {product.originalPrice > product.dealPrice && (
              <span className="text-xs text-neutral-400 line-through">
                {formatINR(product.originalPrice)}
              </span>
            )}
            {savings > 0 && (
              <span className="text-xs font-semibold text-red-600">
                Save {formatINR(savings)}
              </span>
            )}
          </div>

          {/* Coupon Code Row (if available) */}
          {product.couponCode && (
            <div className="bg-neutral-50 border border-dashed border-neutral-300 px-2.5 py-1.5 mb-3 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-1.5 min-w-0">
                <Tag className="w-3 h-3 text-red-600 shrink-0" />
                <span className="font-mono font-bold text-neutral-900 truncate">
                  {product.couponCode}
                </span>
                {product.couponDiscount && (
                  <span className="text-[10px] text-neutral-500 hidden sm:inline">
                    ({product.couponDiscount})
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={handleCopyCoupon}
                className="text-[10px] font-bold text-neutral-700 hover:text-black shrink-0 underline ml-2 cursor-pointer flex items-center space-x-1"
              >
                {copiedCoupon ? (
                  <span className="text-red-600 font-bold flex items-center space-x-0.5">
                    <Check className="w-2.5 h-2.5" />
                    <span>Copied</span>
                  </span>
                ) : (
                  <span>Copy</span>
                )}
              </button>
            </div>
          )}
        </div>

        {/* PRIMARY CTA: Direct Redirect to Platform */}
        <div className="pt-2 border-t border-neutral-100">
          <a
            href={product.affiliateUrl || '#'}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleDirectClick}
            className="w-full py-2.5 px-3 bg-neutral-950 hover:bg-neutral-800 text-white text-xs sm:text-sm font-bold flex items-center justify-center space-x-1.5 transition-colors cursor-pointer text-center"
          >
            <span>Buy on {product.marketplace}</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </a>
        </div>

      </div>

    </div>
  );
}
