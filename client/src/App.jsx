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
import BrandSection from './components/BrandSection';
import CreateBrandSectionModal from './components/CreateBrandSectionModal';
import Footer from './components/Footer';
import Toast from './components/Toast';
import { RefreshCw, Sparkles, Plus } from 'lucide-react';

const CATEGORIES = ['All', 'Women', 'Men', 'Footwear', 'Accessories', 'Beauty'];

export default function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState('deals'); // 'deals' or 'admin'
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(() => {
    return sessionStorage.getItem('tfh_crm_auth') === 'true';
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Theme (Dark Mode) State
  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem('tfh_theme');
      if (saved) return saved;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } catch {
      return 'light';
    }
  });

  useEffect(() => {
    try {
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
        document.documentElement.style.colorScheme = 'dark';
      } else {
        document.documentElement.classList.remove('dark');
        document.documentElement.style.colorScheme = 'light';
      }
      localStorage.setItem('tfh_theme', theme);
    } catch (e) {
      console.error(e);
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Custom Brand / Store Sections
  const [brandSections, setBrandSections] = useState([]);
  const [isCreateSectionModalOpen, setIsCreateSectionModalOpen] = useState(false);

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

  // Fetch Brand Sections
  const fetchBrandSections = async () => {
    try {
      const res = await fetch('/api/brand-sections');
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setBrandSections(data.data);
      }
    } catch (err) {
      console.warn('Failed to load brand sections from server');
    }
  };

  const handleCreateBrandSection = (newSection) => {
    setBrandSections((prev) => [newSection, ...prev.filter((s) => s.id !== newSection.id)]);
    fetchBrandSections();
  };

  const handleDeleteBrandSection = async (id) => {
    try {
      await fetch(`/api/brand-sections/${id}`, { method: 'DELETE' });
      setBrandSections((prev) => prev.filter((s) => s.id !== id));
      showToast('Brand section removed');
    } catch (err) {
      setBrandSections((prev) => prev.filter((s) => s.id !== id));
    }
  };

  const handleUpdateBrandSection = async (id, updates) => {
    try {
      const res = await fetch(`/api/brand-sections/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      const data = await res.json();
      if (data.success) {
        setBrandSections((prev) => prev.map((s) => (s.id === id ? data.data : s)));
        showToast('Brand section updated');
      }
    } catch (err) {
      setBrandSections((prev) =>
        prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
      );
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
    fetchBrandSections();
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

  const handleAdminAuthSuccess = (token, deviceId) => {
    setIsAdminAuthenticated(true);
    sessionStorage.setItem('tfh_crm_auth', 'true');
    if (token) sessionStorage.setItem('tfh_crm_token', token);
    setCurrentView('admin');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAdminLogout = async (forced = false) => {
    const token = sessionStorage.getItem('tfh_crm_token');
    const deviceId = localStorage.getItem('tfh_device_id');

    try {
      if (token && !forced) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ token, deviceId })
        });
      }
    } catch (err) {}

    sessionStorage.removeItem('tfh_crm_auth');
    sessionStorage.removeItem('tfh_crm_token');
    setIsAdminAuthenticated(false);
    setCurrentView('deals');
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (forced) {
      showToast('CRM session ended: Another device logged in.', 'error');
    } else {
      showToast('Logged out of CRM. Device lock released.');
    }
  };

  const handleExitAdmin = () => {
    setCurrentView('deals');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Heartbeat to ensure single-device session liveness & detect session termination
  useEffect(() => {
    if (currentView !== 'admin' || !isAdminAuthenticated) return;

    const interval = setInterval(async () => {
      const token = sessionStorage.getItem('tfh_crm_token');
      const deviceId = localStorage.getItem('tfh_device_id');
      if (!token) return;

      try {
        const res = await fetch('/api/auth/heartbeat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ token, deviceId })
        });
        const data = await res.json();
        if (!data.success && data.code === 'SESSION_TERMINATED') {
          handleAdminLogout(true);
        }
      } catch (err) {}
    }, 20000);

    return () => clearInterval(interval);
  }, [currentView, isAdminAuthenticated]);

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
    <div className="min-h-screen bg-white dark:bg-neutral-950 flex flex-col font-sans text-neutral-900 dark:text-neutral-100 transition-colors duration-200">
      {/* Toast Notification */}
      <Toast message={toastMessage} onClose={() => setToastMessage('')} />

      {/* Admin Passcode Modal */}
      <AdminAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleAdminAuthSuccess}
        onShowToast={showToast}
      />

      {/* CREATE BRAND SECTION MODAL */}
      <CreateBrandSectionModal
        isOpen={isCreateSectionModalOpen}
        onClose={() => setIsCreateSectionModalOpen(false)}
        onSuccess={handleCreateBrandSection}
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
              onLogout={handleAdminLogout}
              brandSections={brandSections}
              onRefreshBrandSections={fetchBrandSections}
              onCreateBrandSection={() => setIsCreateSectionModalOpen(true)}
              onDeleteBrandSection={handleDeleteBrandSection}
              onUpdateBrandSection={handleUpdateBrandSection}
              theme={theme}
              onToggleTheme={toggleTheme}
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
            theme={theme}
            onToggleTheme={toggleTheme}
          />
        </div>
      ) : (
        /* VIEW: PUBLIC DEALS STOREFRONT */
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
            theme={theme}
            onToggleTheme={toggleTheme}
          />

          <main className="flex-1 w-full">
            {/* Hero Banner */}
            <HeroBanner 
              settings={settings} 
              onExploreClick={scrollToDeals}
            />

            <div ref={dealsSectionRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8 lg:py-12">
              
              {/* Filter Product Section */}
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
              {dealOfTheDayItems.length > 0 && selectedCategory === 'All' && selectedMarketplace === 'All' && !searchQuery && (
                <section className="mb-12">
                  <div className="flex items-center justify-between pb-3 mb-6 border-b border-neutral-200 dark:border-neutral-800">
                    <div className="flex items-center space-x-2">
                      <span className="w-2.5 h-2.5 bg-red-600 rounded-full" />
                      <h2 className="text-lg sm:text-xl font-black uppercase tracking-tight text-neutral-950 dark:text-white">
                        Deals of the Day • Handpicked Drops
                      </h2>
                    </div>
                    <span className="text-[11px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-widest hidden sm:inline">
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

              {/* CUSTOM BRAND SECTIONS (Curated by Admin, rendered cleanly for Storefront shoppers) */}
              {selectedCategory === 'All' && selectedMarketplace === 'All' && !searchQuery && (
                <div className="space-y-6">
                  {/* Render active custom brand sections */}
                  {brandSections
                    .filter((sec) => sec.isActive !== false)
                    .map((sec) => (
                      <BrandSection
                        key={sec.id}
                        section={sec}
                        products={products}
                        wishlist={wishlist}
                        onToggleWishlist={handleToggleWishlist}
                        onQuickView={setQuickViewProduct}
                        onAffiliateClick={handleAffiliateClick}
                        onShowToast={showToast}
                        onCreateNewSection={isAdminAuthenticated ? () => setIsCreateSectionModalOpen(true) : undefined}
                        onDeleteSection={isAdminAuthenticated ? handleDeleteBrandSection : undefined}
                        isAdmin={isAdminAuthenticated}
                      />
                    ))}
                </div>
              )}

              {/* SECTION HEADER & ALL DEALS */}
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-neutral-200 dark:border-neutral-800">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 bg-neutral-950 dark:bg-white rounded-full" />
                  <h2 className="text-lg sm:text-xl font-black uppercase tracking-tight text-neutral-950 dark:text-white">
                    {selectedMarketplace !== 'All' ? `${selectedMarketplace} Deals` : 'Curated Fashion Catalog'}
                  </h2>
                </div>
                <span className="text-[11px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-widest hidden sm:inline">
                  Verified Prices & Direct Affiliate Links
                </span>
              </div>

              {/* PRODUCT GRID */}
              {loading ? (
                <div className="text-center py-24 space-y-3">
                  <RefreshCw className="w-6 h-6 text-neutral-950 dark:text-white animate-spin mx-auto" />
                  <p className="text-xs uppercase tracking-wider font-bold text-neutral-500 dark:text-neutral-400">
                    Loading verified deals...
                  </p>
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-20 border border-neutral-200 dark:border-neutral-800 p-8 space-y-3">
                  <h3 className="text-base font-bold uppercase text-neutral-900 dark:text-white">No Matching Deals</h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-sm mx-auto">
                    Try clearing your search keyword or adjusting your filters to view more items.
                  </p>
                  <button
                    onClick={handleResetFilters}
                    className="px-5 py-2.5 bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 font-bold text-xs uppercase tracking-wider hover:bg-neutral-800 dark:hover:bg-neutral-200 cursor-pointer transition-colors"
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

          {/* FOOTER */}
          <Footer
            settings={settings}
            onCategorySelect={(cat) => {
              setSelectedCategory(cat);
              scrollToDeals();
            }}
            onOpenAdmin={handleOpenAdmin}
            theme={theme}
            onToggleTheme={toggleTheme}
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
        theme={theme}
        onToggleTheme={toggleTheme}
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
