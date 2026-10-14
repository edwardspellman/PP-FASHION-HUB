import React, { useEffect } from 'react';
import { 
  X, 
  ShoppingBag, 
  ExternalLink, 
  Heart, 
  Link2, 
  Check, 
  Percent, 
  Lock, 
  Tag, 
  Sparkles 
} from 'lucide-react';

const STORES = [
  { name: 'All', label: 'All Stores', badge: 'AGGREGATED' },
  { name: 'Myntra', label: 'Myntra Fashion', badge: 'TOP DEALS' },
  { name: 'Flipkart', label: 'Flipkart Deals', badge: 'MEGA DROPS' },
  { name: 'Amazon', label: 'Amazon India', badge: 'PRIME DISCOUNTS' }
];

const CATEGORIES = [
  { name: 'All', label: 'All Categories' },
  { name: 'Women', label: "Women's Ethnic & Western" },
  { name: 'Men', label: "Men's Casuals & Streetwear" },
  { name: 'Footwear', label: 'Sneakers & Shoes' },
  { name: 'Accessories', label: 'Watches & Bags' },
  { name: 'Beauty', label: 'Makeup & Skincare' }
];

const DISCOUNTS = [
  { label: 'All Discounts', value: '' },
  { label: '50%+ Off', value: '50' },
  { label: '60%+ Off', value: '60' },
  { label: '70%+ Off', value: '70' }
];

export default function MobileDrawer({
  isOpen,
  onClose,
  selectedMarketplace,
  setSelectedMarketplace,
  selectedCategory,
  setSelectedCategory,
  minDiscount,
  setMinDiscount,
  wishlistCount,
  openWishlist,
  openLinkConverter,
  settings,
  onOpenAdmin,
  onScrollToDeals
}) {
  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSelectStore = (storeName) => {
    setSelectedMarketplace(storeName);
    onClose();
    if (onScrollToDeals) onScrollToDeals();
  };

  const handleSelectCategory = (catName) => {
    setSelectedCategory(catName);
    onClose();
    if (onScrollToDeals) onScrollToDeals();
  };

  const handleSelectDiscount = (val) => {
    setMinDiscount(val);
    onClose();
    if (onScrollToDeals) onScrollToDeals();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-out Sidebar Drawer - Right Side (Android & iOS) */}
      <div 
        className="relative w-4/5 max-w-xs sm:max-w-sm bg-white text-neutral-900 h-full shadow-2xl flex flex-col z-10 border-l border-neutral-300 transform transition-transform duration-300 ease-out animate-in slide-in-from-right"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-neutral-200 flex items-center justify-between bg-neutral-950 text-white">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 bg-white text-neutral-950 flex items-center justify-center font-bold">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-baseline space-x-1.5">
                <span className="font-extrabold text-sm tracking-tight text-white">
                  THE FASHION HUB
                </span>
                <span className="text-[9px] font-bold text-red-500 uppercase tracking-widest">
                  DEALS
                </span>
              </div>
              <p className="text-[9px] text-neutral-400 uppercase tracking-wider">
                Android & iOS Mobile Navigation
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full border border-neutral-700 hover:border-white text-neutral-300 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
            aria-label="Close menu"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto divide-y divide-neutral-100 text-xs">
          
          {/* 1. STORE SELECTION SECTION */}
          <div className="p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 flex items-center space-x-1.5">
                <Tag className="w-3 h-3 text-red-600" />
                <span>Featured Stores</span>
              </span>
              <span className="text-[10px] font-mono text-neutral-400">
                {selectedMarketplace}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-1.5">
              {STORES.map((s) => {
                const isSelected = selectedMarketplace === s.name;
                return (
                  <button
                    key={s.name}
                    onClick={() => handleSelectStore(s.name)}
                    className={`w-full text-left px-3 py-2.5 flex items-center justify-between border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-neutral-950 text-white border-neutral-950'
                        : 'bg-neutral-50 hover:bg-neutral-100 text-neutral-800 border-neutral-200'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-red-500' : 'bg-neutral-300'}`} />
                      <span className="font-bold text-xs uppercase tracking-wider">
                        {s.label}
                      </span>
                    </div>

                    <div className="flex items-center space-x-1.5">
                      <span className={`text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 ${
                        isSelected ? 'bg-neutral-800 text-neutral-300' : 'bg-neutral-200 text-neutral-600'
                      }`}>
                        {s.badge}
                      </span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. CATEGORIES SECTION */}
          <div className="p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 flex items-center space-x-1.5">
                <Sparkles className="w-3 h-3 text-neutral-900" />
                <span>Fashion Categories</span>
              </span>
              <span className="text-[10px] font-mono text-neutral-400">
                {selectedCategory}
              </span>
            </div>

            <div className="flex flex-col space-y-1">
              {CATEGORIES.map((c) => {
                const isSelected = selectedCategory === c.name;
                return (
                  <button
                    key={c.name}
                    onClick={() => handleSelectCategory(c.name)}
                    className={`w-full text-left px-3 py-2 flex items-center justify-between transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-neutral-950 text-white font-bold'
                        : 'text-neutral-700 hover:bg-neutral-100 hover:text-black'
                    }`}
                  >
                    <span>{c.label}</span>
                    {isSelected && <span className="text-red-500 text-xs font-bold">•</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. DISCOUNT TIERS SECTION */}
          <div className="p-4 space-y-2.5">
            <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 flex items-center space-x-1.5">
              <Percent className="w-3 h-3 text-red-600" />
              <span>Discount Threshold</span>
            </span>

            <div className="grid grid-cols-2 gap-1.5">
              {DISCOUNTS.map((d) => {
                const isSelected = minDiscount === d.value;
                return (
                  <button
                    key={d.label}
                    onClick={() => handleSelectDiscount(d.value)}
                    className={`px-2.5 py-1.5 text-center text-[11px] font-bold uppercase tracking-wider border cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-neutral-950 text-white border-neutral-950'
                        : 'bg-white text-neutral-700 border-neutral-200 hover:border-black'
                    }`}
                  >
                    {d.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. CUSTOMER TOOLS SECTION (Saved Deals Wishlist) */}
          <div className="p-4 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">
              Shopper Tools
            </span>

            <div className="space-y-1.5">
              {/* Saved Wishlist */}
              <button
                onClick={() => {
                  onClose();
                  openWishlist();
                }}
                className="w-full text-left px-3 py-2.5 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 flex items-center justify-between cursor-pointer transition-colors font-bold text-neutral-900"
              >
                <div className="flex items-center space-x-2">
                  <Heart className={`w-3.5 h-3.5 ${wishlistCount > 0 ? 'text-red-600 fill-red-600' : 'text-neutral-700'}`} />
                  <span>Saved Deals Wishlist</span>
                </div>
                {wishlistCount > 0 ? (
                  <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {wishlistCount}
                  </span>
                ) : (
                  <span className="text-neutral-400 text-[10px]">0</span>
                )}
              </button>
            </div>
          </div>

          {/* 5. COMMUNITY CHANNELS */}
          {settings?.telegramChannel && (
            <div className="p-4 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">
                Deal Communities
              </span>

              <a
                href={settings.telegramChannel}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full px-3 py-2.5 bg-neutral-950 text-white font-bold flex items-center justify-between text-xs tracking-wider uppercase hover:bg-neutral-800 transition-colors"
              >
                <span>Join Telegram Alerts</span>
                <ExternalLink className="w-3.5 h-3.5 text-neutral-300" />
              </a>
            </div>
          )}

        </div>

        {/* Drawer Footer with Discreet Admin Lock */}
        <div className="p-4 border-t border-neutral-200 bg-neutral-50 flex items-center justify-between text-[11px] text-neutral-500">
          <span>Direct Merchant Checkout</span>

          <button
            onClick={() => {
              onClose();
              if (onOpenAdmin) onOpenAdmin();
            }}
            className="text-neutral-500 hover:text-black flex items-center space-x-1 cursor-pointer font-bold"
            title="Merchant Portal"
          >
            <Lock className="w-3 h-3" />
            <span>Merchant CRM</span>
          </button>
        </div>

      </div>
    </div>
  );
}
