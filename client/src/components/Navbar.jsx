import React from 'react';
import { 
  ShoppingBag, 
  Search, 
  Heart, 
  Link2, 
  X, 
  ExternalLink,
  Menu,
  Sun,
  Moon
} from 'lucide-react';

export default function Navbar({ 
  searchQuery, 
  setSearchQuery, 
  selectedMarketplace, 
  setSelectedMarketplace, 
  wishlistCount, 
  openWishlist, 
  openLinkConverter,
  settings,
  onOpenMobileDrawer,
  theme,
  onToggleTheme
}) {
  const stores = ['All', 'Myntra', 'Flipkart', 'Amazon', 'Meesho'];
  const announcement = settings?.announcementText || 'Flat up to 80% Off on Myntra, Flipkart, Amazon & Meesho Top Fashion Brands! Verified Coupons inside.';

  return (
    <header className="sticky top-0 z-40 w-full bg-white dark:bg-neutral-950 border-b border-neutral-200 dark:border-neutral-800 transition-colors">
      
      {/* Editorial Announcement Bar - Hidden on Mobile (Android & iOS) */}
      <div className="hidden md:block bg-neutral-950 dark:bg-black text-white text-xs py-2 px-4 border-b border-neutral-900 dark:border-neutral-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="bg-red-600 text-white font-bold text-[10px] uppercase px-1.5 py-0.5 tracking-wider shrink-0">
              SALE ALERTS
            </span>
            <span className="text-neutral-300 dark:text-neutral-400 text-xs truncate">
              {announcement}
            </span>
          </div>

          {settings?.telegramChannel && (
            <a 
              href={settings.telegramChannel} 
              target="_blank" 
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center space-x-1 text-xs text-neutral-300 dark:text-neutral-400 hover:text-white transition-colors underline shrink-0"
            >
              <span>Join Telegram Alerts</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          
          {/* Brand Logo */}
          <div 
            className="flex items-center space-x-2 sm:space-x-3 select-none shrink-0"
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 flex items-center justify-center font-bold">
              <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <div className="flex items-baseline space-x-2">
                <span className="font-extrabold text-lg sm:text-xl tracking-tight text-neutral-950 dark:text-white">
                  {settings?.siteName ? settings.siteName.toUpperCase() : 'PP FASHION HUB'}
                </span>
                <span className="text-[10px] font-bold text-red-600 tracking-widest uppercase">
                  DEALS
                </span>
              </div>
              <p className="text-[10px] text-neutral-500 dark:text-neutral-400 uppercase tracking-wider hidden sm:block">
                Myntra • Flipkart • Amazon • Meesho
              </p>
            </div>
          </div>

          {/* Search Input */}
          <div className="flex-1 max-w-lg mx-2 sm:mx-6 hidden md:block">
            <div className="relative">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search kurtas, sarees, jeans, sneakers, Meesho, brands..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-9 py-2 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-xs sm:text-sm text-neutral-900 dark:text-white focus:bg-white dark:focus:bg-neutral-950 focus:border-neutral-950 dark:focus:border-neutral-400 focus:outline-none transition-colors"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-900 dark:hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Customer Tools & Mobile Right Menu */}
          <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
            {/* Affiliate Link Generator Tool - Hidden on Mobile (Android & iOS) */}
            <button
              onClick={openLinkConverter}
              className="hidden md:inline-flex items-center space-x-1.5 px-3 py-2 border border-neutral-300 dark:border-neutral-700 hover:border-black dark:hover:border-white text-neutral-900 dark:text-neutral-200 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
              title="Convert any Amazon, Flipkart, Myntra or Meesho link"
            >
              <Link2 className="w-3.5 h-3.5" />
              <span>Link Converter</span>
            </button>

            {/* Dark Mode Toggle */}
            <button
              type="button"
              onClick={onToggleTheme}
              className="p-2 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-200 hover:text-neutral-950 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Wishlist */}
            <button
              onClick={openWishlist}
              className="relative p-2 text-neutral-700 dark:text-neutral-200 hover:text-neutral-950 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer border border-neutral-200 dark:border-neutral-700"
              title="Saved deals"
            >
              <Heart className="w-4 h-4" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Mobile Hamburger Button (Placed on Right Side for Android & iOS) */}
            <button
              type="button"
              onClick={onOpenMobileDrawer}
              className="p-2 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-neutral-200 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 md:hidden cursor-pointer focus:outline-none transition-colors"
              aria-label="Open mobile navigation menu"
              title="Open stores, categories & tools menu"
            >
              <Menu className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="pb-3 md:hidden">
          <div className="relative">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search deals, Meesho & brands..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-9 py-2 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-xs text-neutral-900 dark:text-white focus:bg-white dark:focus:bg-neutral-950 focus:outline-none"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-900 dark:hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Store Tabs - Hidden on Mobile (Android & iOS, available inside Mobile Sidebar Drawer) */}
        <div className="hidden md:flex items-center space-x-2 py-2.5 overflow-x-auto border-t border-neutral-100 dark:border-neutral-800 text-xs">
          <span className="text-neutral-400 uppercase text-[10px] font-bold tracking-wider shrink-0 mr-1">
            Store:
          </span>
          {stores.map((store) => {
            const isActive = selectedMarketplace === store;
            return (
              <button
                key={store}
                onClick={() => setSelectedMarketplace(store)}
                className={`px-3 py-1 font-bold text-xs uppercase tracking-wider transition-colors shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-neutral-950 dark:bg-white text-white dark:text-neutral-950'
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                }`}
              >
                {store === 'All' ? 'All Stores' : store}
              </button>
            );
          })}
        </div>

      </div>
    </header>
  );
}
