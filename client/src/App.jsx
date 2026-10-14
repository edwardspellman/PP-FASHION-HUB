import React, { useState, useEffect, useRef } from 'react';
import Navbar from './components/Navbar';
import HeroBanner from './components/HeroBanner';
import FilterBar from './components/FilterBar';
import ProductCard from './components/ProductCard';
import ProductModal from './components/ProductModal';
import WishlistDrawer from './components/WishlistDrawer';
import MobileDrawer from './components/MobileDrawer';
import AffiliateLinkGeneratorModal from './components/AffiliateLinkGeneratorModal';
import AdminDashboard from './components/AdminDashboard';
import AdminAuthModal from './components/AdminAuthModal';
import Footer from './components/Footer';
import Toast from './components/Toast';
import { RefreshCw } from 'lucide-react';

const CATEGORIES = ['All', 'Women', 'Men', 'Footwear', 'Accessories', 'Beauty'];

export default function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState('deals'); // 'deals' or 'admin'
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(() => {
    return sessionStorage.getItem('tfh_crm_auth') === 'true';
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedMarketplace, setSelectedMarketplace] = useState('All');
  const [minDiscount, setMinDiscount] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState('featured');

  // Modals & Drawers
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [isLinkConverterOpen, setIsLinkConverterOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Settings
  const [settings, setSettings] = useState(null);

  // Wishlist persisted in localStorage
  const [wishlist, setWishlist] = useState(() => {
    try {
      const saved = localStorage.getItem('tfh_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const dealsSectionRef = useRef(null);

  // Save wishlist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('tfh_wishlist', JSON.stringify(wishlist));
    } catch (e) {
      console.error(e);
    }
  }, [wishlist]);

  // Check URL parameter or hash for hidden admin access (e.g. ?admin=true or #admin)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('admin') === 'true' || window.location.hash === '#admin') {
      handleOpenAdmin();
    }
  }, []);

  // Toast helper
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
    }, 3500);
  };

  // Fetch Settings
  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      if (data.success) {
        setSettings(data.data);
      }
    } catch (err) {
      console.warn('Backend offline or starting');
    }
  };

  // Update Settings
  const handleUpdateSettings = async (newSettings) => {
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings)
      });
      const data = await res.json();
      if (data.success) {
        setSettings(data.data);
      }
    } catch (err) {
      console.error('Failed to update settings:', err);
    }
  };

  // Fetch Products
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory !== 'All') params.append('category', selectedCategory);
      if (selectedMarketplace !== 'All') params.append('marketplace', selectedMarketplace);
      if (searchQuery.trim()) params.append('search', searchQuery.trim());
      if (minDiscount) params.append('minDiscount', minDiscount);
      if (maxPrice) params.append('maxPrice', maxPrice);
      if (sortBy) params.append('sort', sortBy);

      const res = await fetch(`/api/products?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setProducts(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, selectedMarketplace, searchQuery, minDiscount, maxPrice, sortBy]);

  // Admin access entry
  const handleOpenAdmin = () => {
    if (isAdminAuthenticated) {
      setCurrentView('admin');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setIsAuthModalOpen(true);
    }
  };

  const handleAdminAuthSuccess = (token) => {
    setIsAdminAuthenticated(true);
    sessionStorage.setItem('tfh_crm_auth', 'true');
    setCurrentView('admin');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleExitAdmin = () => {
    setCurrentView('deals');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Direct affiliate redirect handler
  const handleAffiliateClick = (product) => {
    try {
      if (navigator.sendBeacon) {
        navigator.sendBeacon(`/api/click/${product.id}`);
      } else {
        fetch(`/api/click/${product.id}`, { method: 'POST', keepalive: true }).catch(() => {});
      }
    } catch (e) {}

    if (product.affiliateUrl && product.affiliateUrl !== '#') {
      window.open(product.affiliateUrl, '_blank', 'noopener,noreferrer');
    } else {
      showToast(`Redirecting to ${product.marketplace}`);
    }
  };

  // Wishlist Toggle
  const handleToggleWishlist = (product) => {
    setWishlist((prev) => {
      const exists = prev.some((item) => item.id === product.id);
      if (exists) {
        showToast(`Removed from wishlist`);
        return prev.filter((item) => item.id !== product.id);
      } else {
        showToast(`Saved to wishlist`);
        return [...prev, product];
      }
    });
  };

  const handleRemoveWishlistItem = (id) => {
    setWishlist((prev) => prev.filter((item) => item.id !== id));
  };

  const handleClearWishlist = () => {
    setWishlist([]);
    showToast('Wishlist cleared');
  };

  const handleResetFilters = () => {
    setSelectedCategory('All');
    setSelectedMarketplace('All');
    setSearchQuery('');
    setMinDiscount('');
    setMaxPrice('');
    setSortBy('featured');
  };

  const scrollToDeals = () => {
    dealsSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Separate Deal of the Day items
  const dealOfTheDayItems = products.filter((p) => p.isDealOfTheDay && p.inStock !== false);

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans text-neutral-900">
      {/* Toast Notification */}
      <Toast message={toastMessage} onClose={() => setToastMessage('')} />

      {/* Admin Passcode Modal */}
      <AdminAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleAdminAuthSuccess}
        onShowToast={showToast}
      />

      {/* VIEW: ADMIN CRM DASHBOARD (When authenticated) */}
      {currentView === 'admin' ? (
        <div className="flex-1 flex flex-col w-full min-h-screen">
          <main className="flex-1 w-full">
            <AdminDashboard
              products={products}
              onRefreshProducts={fetchProducts}
              settings={settings}
              onUpdateSettings={handleUpdateSettings}
              onShowToast={showToast}
              onExitAdmin={handleExitAdmin}
            />
          </main>
          <Footer
            settings={settings}
            onCategorySelect={(cat) => {
              setSelectedCategory(cat);
              setCurrentView('deals');
              scrollToDeals();
            }}
            onOpenAdmin={handleOpenAdmin}
            isAdminAuthenticated={isAdminAuthenticated}
            currentView={currentView}
          />
        </div>
      ) : (
        /* VIEW: PUBLIC DEALS STOREFRONT (Completely clean of admin buttons) */
        <div className="flex-1 flex flex-col">
          {/* Main Navbar */}
          <Navbar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedMarketplace={selectedMarketplace}
            setSelectedMarketplace={setSelectedMarketplace}
            wishlistCount={wishlist.length}
            openWishlist={() => setIsWishlistOpen(true)}
            openLinkConverter={() => setIsLinkConverterOpen(true)}
            settings={settings}
            onOpenMobileDrawer={() => setIsMobileDrawerOpen(true)}
          />

          <main className="flex-1 w-full">
            {/* Hero Banner */}
            <HeroBanner 
              settings={settings} 
              onExploreClick={scrollToDeals}
              isAdminAuthenticated={isAdminAuthenticated}
            />

            <div ref={dealsSectionRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8 lg:py-12">
              
              {/* Filter Product Section - Placed right after Curated Fashion Deals & Affiliate Storefront */}
              <FilterBar
                categories={CATEGORIES}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                selectedMarketplace={selectedMarketplace}
                setSelectedMarketplace={setSelectedMarketplace}
                sortBy={sortBy}
                setSortBy={setSortBy}
                minDiscount={minDiscount}
                setMinDiscount={setMinDiscount}
                maxPrice={maxPrice}
                setMaxPrice={setMaxPrice}
                totalResults={products.length}
                resetFilters={handleResetFilters}
              />

              {/* DEAL OF THE DAY HIGHLIGHT ROW (if available) */}
              {dealOfTheDayItems.length > 0 && selectedCategory === 'All' && !searchQuery && (
                <section className="mb-12">
                  <div className="flex items-center justify-between pb-3 mb-6 border-b border-neutral-200">
                    <div className="flex items-center space-x-2">
                      <span className="w-2.5 h-2.5 bg-red-600 rounded-full" />
                      <h2 className="text-lg sm:text-xl font-black uppercase tracking-tight text-neutral-950">
                        Deals of the Day • Handpicked Drops
                      </h2>
                    </div>
                    <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-widest hidden sm:inline">
                      Direct Store Checkout
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {dealOfTheDayItems.slice(0, 4).map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        isWishlisted={wishlist.some((w) => w.id === product.id)}
                        onToggleWishlist={handleToggleWishlist}
                        onQuickView={setQuickViewProduct}
                        onAffiliateClick={handleAffiliateClick}
                        onShowToast={showToast}
                      />
                    ))}
                  </div>
                </section>
              )}

              {/* SECTION HEADER & ALL DEALS */}
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-neutral-200">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 bg-neutral-950 rounded-full" />
                  <h2 className="text-lg sm:text-xl font-black uppercase tracking-tight text-neutral-950">
                    {selectedMarketplace !== 'All' ? `${selectedMarketplace} Deals` : 'Curated Fashion Catalog'}
                  </h2>
                </div>
                <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-widest hidden sm:inline">
                  Verified Prices & Direct Affiliate Links
                </span>
              </div>

              {/* PRODUCT GRID */}
              {loading ? (
                <div className="text-center py-24 space-y-3">
                  <RefreshCw className="w-6 h-6 text-neutral-950 animate-spin mx-auto" />
                  <p className="text-xs uppercase tracking-wider font-bold text-neutral-500">
                    Loading verified deals...
                  </p>
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-20 border border-neutral-200 p-8 space-y-3">
                  <h3 className="text-base font-bold uppercase text-neutral-900">No Matching Deals</h3>
                  <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                    Try clearing your search keyword or adjusting your filters to view more items.
                  </p>
                  <button
                    onClick={handleResetFilters}
                    className="px-5 py-2.5 bg-neutral-950 text-white font-bold text-xs uppercase tracking-wider hover:bg-neutral-800 cursor-pointer transition-colors"
                  >
                    Reset All Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {products.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      isWishlisted={wishlist.some((w) => w.id === product.id)}
                      onToggleWishlist={handleToggleWishlist}
                      onQuickView={setQuickViewProduct}
                      onAffiliateClick={handleAffiliateClick}
                      onShowToast={showToast}
                    />
                  ))}
                </div>
              )}

            </div>
          </main>

          {/* FOOTER (With Discreet Merchant CRM Access) */}
          <Footer
            settings={settings}
            onCategorySelect={(cat) => {
              setSelectedCategory(cat);
              scrollToDeals();
            }}
            onOpenAdmin={handleOpenAdmin}
            isAdminAuthenticated={isAdminAuthenticated}
            currentView={currentView}
          />
        </div>
      )}

      {/* QUICK VIEW PRODUCT MODAL */}
      <ProductModal
        product={quickViewProduct}
        isOpen={Boolean(quickViewProduct)}
        onClose={() => setQuickViewProduct(null)}
        isWishlisted={quickViewProduct ? wishlist.some((w) => w.id === quickViewProduct.id) : false}
        onToggleWishlist={handleToggleWishlist}
        onShowToast={showToast}
      />

      {/* WISHLIST DRAWER */}
      <WishlistDrawer
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
        wishlistItems={wishlist}
        onRemoveItem={handleRemoveWishlistItem}
        onClearWishlist={handleClearWishlist}
      />

      {/* MOBILE NAVIGATION SIDEBAR DRAWER (Android & iOS) */}
      <MobileDrawer
        isOpen={isMobileDrawerOpen}
        onClose={() => setIsMobileDrawerOpen(false)}
        selectedMarketplace={selectedMarketplace}
        setSelectedMarketplace={setSelectedMarketplace}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        minDiscount={minDiscount}
        setMinDiscount={setMinDiscount}
        wishlistCount={wishlist.length}
        openWishlist={() => setIsWishlistOpen(true)}
        openLinkConverter={() => setIsLinkConverterOpen(true)}
        settings={settings}
        onOpenAdmin={handleOpenAdmin}
        onScrollToDeals={scrollToDeals}
      />

      {/* AFFILIATE LINK GENERATOR MODAL */}
      <AffiliateLinkGeneratorModal
        isOpen={isLinkConverterOpen}
        onClose={() => setIsLinkConverterOpen(false)}
        settings={settings}
        onShowToast={showToast}
      />
    </div>
  );
}
