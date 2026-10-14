import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Copy as CopyIcon,
  MousePointerClick, 
  DollarSign, 
  ShoppingBag, 
  Search, 
  Save, 
  ArrowUpRight, 
  X,
  ExternalLink,
  ShieldCheck,
  Check,
  Upload,
  Image as ImageIcon,
  Tag,
  Flame,
  Layers,
  Sparkles,
  LogOut,
  Eye,
  ToggleLeft,
  ToggleRight,
  Megaphone,
  CheckCircle2,
  AlertCircle,
  Menu
} from 'lucide-react';
import { formatINR } from '../utils/formatters';
import AdminMobileDrawer from './AdminMobileDrawer';

export default function AdminDashboard({
  products,
  onRefreshProducts,
  settings,
  onUpdateSettings,
  onShowToast,
  onExitAdmin,
  autoOpenAddModal,
  onCloseAutoOpenAddModal
}) {
  const [activeTab, setActiveTab] = useState('products'); // 'products', 'offers', 'analytics', 'settings'
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [analytics, setAnalytics] = useState(null);
  const [offers, setOffers] = useState([]);
  const [loadingOffers, setLoadingOffers] = useState(false);

  // Product Search / Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [storeFilter, setStoreFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');

  // Product Modal State (Add / Edit)
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadPreview, setUploadPreview] = useState('');
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    title: '',
    brand: '',
    category: 'Women',
    subCategory: 'Ethnic Wear',
    marketplace: 'Myntra',
    originalPrice: '',
    dealPrice: '',
    discountPercent: '',
    imageUrl: '',
    affiliateUrl: '',
    couponCode: '',
    couponDiscount: '',
    badge: 'HOT DEAL',
    isFeatured: true,
    isDealOfTheDay: false,
    inStock: true,
    description: ''
  });

  // Offer Modal State
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);
  const [offerFormData, setOfferFormData] = useState({
    title: '',
    store: 'Myntra',
    badge: 'HOT OFFER',
    discount: 'Up to 70% Off',
    couponCode: '',
    validTill: 'Limited Period',
    affiliateUrl: '',
    isActive: true,
    description: ''
  });

  // Settings State
  const [settingsForm, setSettingsForm] = useState({
    siteName: settings?.siteName || 'The Fashion Hub',
    telegramChannel: settings?.telegramChannel || '',
    whatsappGroup: settings?.whatsappGroup || '',
    adminPasscode: settings?.adminPasscode || 'Admin@5678901234',
    announcementText: settings?.announcementText || 'Flat up to 80% Off on Myntra, Flipkart & Amazon Top Fashion Brands! Verified Coupons inside.',
    amazonTag: settings?.affiliateTags?.amazon || 'fashionhub-21',
    flipkartTag: settings?.affiliateTags?.flipkart || 'fashionhub_flipkart',
    myntraTag: settings?.affiliateTags?.myntra || 'fashionhub_myntra',
    ajioTag: settings?.affiliateTags?.ajio || 'fashionhub_ajio'
  });

  useEffect(() => {
    if (settings) {
      setSettingsForm((prev) => ({
        ...prev,
        siteName: settings.siteName || prev.siteName,
        telegramChannel: settings.telegramChannel || prev.telegramChannel,
        whatsappGroup: settings.whatsappGroup || prev.whatsappGroup,
        adminPasscode: settings.adminPasscode || prev.adminPasscode,
        announcementText: settings.announcementText || prev.announcementText,
        amazonTag: settings.affiliateTags?.amazon || prev.amazonTag,
        flipkartTag: settings.affiliateTags?.flipkart || prev.flipkartTag,
        myntraTag: settings.affiliateTags?.myntra || prev.myntraTag,
        ajioTag: settings.affiliateTags?.ajio || prev.ajioTag
      }));
    }
  }, [settings]);

  // Fetch Analytics & Offers
  const fetchAnalytics = async () => {
    try {
      const res = await fetch('/api/analytics');
      const data = await res.json();
      if (data.success) setAnalytics(data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchOffers = async () => {
    setLoadingOffers(true);
    try {
      const res = await fetch('/api/offers');
      const data = await res.json();
      if (data.success) setOffers(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingOffers(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
    fetchOffers();
  }, []);

  // Open Add Product
  const handleOpenAdd = () => {
    setEditingProduct(null);
    setUploadPreview('');
    setFormData({
      title: '',
      brand: '',
      category: 'Women',
      subCategory: 'Ethnic Wear',
      marketplace: 'Myntra',
      originalPrice: '',
      dealPrice: '',
      discountPercent: '',
      imageUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80',
      affiliateUrl: '',
      couponCode: '',
      couponDiscount: '',
      badge: 'HOT DEAL',
      isFeatured: true,
      isDealOfTheDay: false,
      inStock: true,
      description: ''
    });
    setShowProductModal(true);
  };

  // Open Edit Product
  const handleOpenEdit = (prod) => {
    setEditingProduct(prod);
    setUploadPreview(prod.imageUrl || '');
    setFormData({
      title: prod.title || '',
      brand: prod.brand || '',
      category: prod.category || 'Women',
      subCategory: prod.subCategory || '',
      marketplace: prod.marketplace || 'Myntra',
      originalPrice: prod.originalPrice || '',
      dealPrice: prod.dealPrice || '',
      discountPercent: prod.discountPercent || '',
      imageUrl: prod.imageUrl || '',
      affiliateUrl: prod.affiliateUrl || '',
      couponCode: prod.couponCode || '',
      couponDiscount: prod.couponDiscount || '',
      badge: prod.badge || '',
      isFeatured: Boolean(prod.isFeatured),
      isDealOfTheDay: Boolean(prod.isDealOfTheDay),
      inStock: prod.inStock !== false,
      description: prod.description || ''
    });
    setShowProductModal(true);
  };

  // Duplicate / Clone Deal
  const handleCloneProduct = (prod) => {
    setEditingProduct(null);
    setUploadPreview(prod.imageUrl || '');
    setFormData({
      ...prod,
      title: `${prod.title} (Copy)`,
      id: undefined,
      clicks: 0
    });
    setShowProductModal(true);
    onShowToast(`Duplicated deal. You can edit and save.`);
  };

  // Inline Quick Toggle (e.g. inStock, isDealOfTheDay, isFeatured)
  const handleInlineToggle = async (prod, field) => {
    const updatedValue = !prod[field];
    try {
      const res = await fetch(`/api/products/${prod.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: updatedValue })
      });
      const data = await res.json();
      if (data.success) {
        onShowToast(`Updated "${prod.title.slice(0, 20)}..."`);
        onRefreshProducts();
      }
    } catch (err) {
      onShowToast('Failed to update product state');
    }
  };

  // Handle Image File Upload (Computer file -> Base64 -> /api/upload)
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit: 10MB
    if (file.size > 10 * 1024 * 1024) {
      alert('Image size exceeds 10MB. Please choose a smaller file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const base64Data = reader.result;
      setUploadPreview(base64Data);
      setUploadingImage(true);

      try {
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64: base64Data,
            filename: file.name
          })
        });
        const data = await res.json();
        if (data.success) {
          setFormData((prev) => ({ ...prev, imageUrl: data.imageUrl }));
          onShowToast('Product image uploaded successfully!');
        } else {
          // Fallback to base64 preview directly
          setFormData((prev) => ({ ...prev, imageUrl: base64Data }));
          onShowToast('Using local image preview');
        }
      } catch (err) {
        // Fallback to base64
        setFormData((prev) => ({ ...prev, imageUrl: base64Data }));
        onShowToast('Saved image data');
      } finally {
        setUploadingImage(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle Save Product
  const handleSaveProduct = async (e) => {
    e.preventDefault();
    try {
      const url = editingProduct ? `/api/products/${editingProduct.id}` : '/api/products';
      const method = editingProduct ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        onShowToast(editingProduct ? 'Deal updated successfully!' : 'New affiliate deal listed!');
        setShowProductModal(false);
        onRefreshProducts();
        fetchAnalytics();
      } else {
        onShowToast(data.message || 'Error saving product');
      }
    } catch (err) {
      onShowToast('Failed to save product');
    }
  };

  // Handle Delete Product
  const handleDeleteProduct = async (id, title) => {
    if (!window.confirm(`Permanently remove deal "${title}"?`)) return;

    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        onShowToast('Product removed');
        onRefreshProducts();
        fetchAnalytics();
      }
    } catch (err) {
      onShowToast('Network error while deleting');
    }
  };

  // Open Offer Modal
  const handleOpenAddOffer = () => {
    setEditingOffer(null);
    setOfferFormData({
      title: '',
      store: 'Myntra',
      badge: 'HOT OFFER',
      discount: 'Up to 70% Off',
      couponCode: '',
      validTill: 'Limited Period',
      affiliateUrl: '',
      isActive: true,
      description: ''
    });
    setShowOfferModal(true);
  };

  const handleOpenEditOffer = (offer) => {
    setEditingOffer(offer);
    setOfferFormData({ ...offer });
    setShowOfferModal(true);
  };

  const handleSaveOffer = async (e) => {
    e.preventDefault();
    try {
      const url = editingOffer ? `/api/offers/${editingOffer.id}` : '/api/offers';
      const method = editingOffer ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(offerFormData)
      });
      const data = await res.json();
      if (data.success) {
        onShowToast(editingOffer ? 'Offer campaign updated!' : 'New offer campaign published!');
        setShowOfferModal(false);
        fetchOffers();
      }
    } catch (err) {
      onShowToast('Failed to save offer');
    }
  };

  const handleDeleteOffer = async (id, title) => {
    if (!window.confirm(`Delete offer "${title}"?`)) return;
    try {
      const res = await fetch(`/api/offers/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        onShowToast('Offer deleted');
        fetchOffers();
      }
    } catch (err) {
      onShowToast('Failed to delete offer');
    }
  };

  // Save Settings
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    const payload = {
      siteName: settingsForm.siteName,
      telegramChannel: settingsForm.telegramChannel,
      whatsappGroup: settingsForm.whatsappGroup,
      adminPasscode: settingsForm.adminPasscode,
      announcementText: settingsForm.announcementText,
      affiliateTags: {
        amazon: settingsForm.amazonTag,
        flipkart: settingsForm.flipkartTag,
        myntra: settingsForm.myntraTag,
        ajio: settingsForm.ajioTag
      }
    };
    await onUpdateSettings(payload);
    onShowToast('Merchant settings & affiliate IDs updated!');
  };

  // Filter products
  const filteredProducts = products.filter((p) => {
    const matchSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStore = storeFilter === 'All' || p.marketplace === storeFilter;
    const matchCat = categoryFilter === 'All' || p.category.toLowerCase() === categoryFilter.toLowerCase();
    return matchSearch && matchStore && matchCat;
  });

  return (
    <div className="bg-neutral-50 min-h-screen pb-16">
      
      {/* Top CRM App Bar */}
      <div className="bg-neutral-950 text-white border-b border-neutral-900 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-white text-neutral-950 flex items-center justify-center font-bold">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-sm sm:text-base tracking-tight uppercase text-white">
                  THE FASHION HUB
                </span>
                <span className="text-[10px] font-bold bg-emerald-600 text-white px-2 py-0.5 tracking-wider uppercase flex items-center space-x-1.5 shadow-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  <span>CRM ONLINE</span>
                </span>
              </div>
              <p className="text-[10px] text-neutral-400 hidden sm:block">
                Merchant Operations & Product Listing Control Center
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-3">
            <button
              onClick={handleOpenAdd}
              className="px-3 sm:px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider flex items-center space-x-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>List Deal</span>
            </button>

            <button
              onClick={onExitAdmin}
              className="px-2.5 sm:px-3 py-2 border border-neutral-700 hover:border-white text-white font-bold text-xs uppercase tracking-wider flex items-center space-x-1.5 transition-colors cursor-pointer"
              title="Return to customer storefront"
            >
              <Eye className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">View Store</span>
            </button>

            {/* Mobile Sidebar Hamburger (Right Side for Android & iOS) */}
            <button
              type="button"
              onClick={() => setIsMobileDrawerOpen(true)}
              className="p-2 border border-neutral-700 text-neutral-300 hover:text-white hover:bg-neutral-900 md:hidden cursor-pointer focus:outline-none transition-colors"
              aria-label="Open CRM mobile navigation sidebar"
              title="Open CRM mobile sidebar"
            >
              <Menu className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* CRM Tab Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex space-x-1 border-t border-neutral-900 overflow-x-auto text-xs">
          <button
            onClick={() => setActiveTab('products')}
            className={`py-3 px-4 font-bold uppercase tracking-wider transition-colors shrink-0 cursor-pointer border-b-2 ${
              activeTab === 'products'
                ? 'border-white text-white bg-neutral-900'
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            Product Catalog ({products.length})
          </button>

          <button
            onClick={() => setActiveTab('offers')}
            className={`py-3 px-4 font-bold uppercase tracking-wider transition-colors shrink-0 cursor-pointer border-b-2 ${
              activeTab === 'offers'
                ? 'border-white text-white bg-neutral-900'
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            Offers & Flash Sales ({offers.length})
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`py-3 px-4 font-bold uppercase tracking-wider transition-colors shrink-0 cursor-pointer border-b-2 ${
              activeTab === 'analytics'
                ? 'border-white text-white bg-neutral-900'
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            Click Telemetry ({analytics?.totalClicks || 0})
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`py-3 px-4 font-bold uppercase tracking-wider transition-colors shrink-0 cursor-pointer border-b-2 ${
              activeTab === 'settings'
                ? 'border-white text-white bg-neutral-900'
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            Affiliate Tags & Keys
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">

        {/* CRM Metric Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white p-4 border border-neutral-200">
            <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block">Total Products</span>
            <div className="text-xl sm:text-2xl font-black text-neutral-950 mt-1">{products.length}</div>
          </div>

          <div className="bg-white p-4 border border-neutral-200">
            <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block">In-Stock Deals</span>
            <div className="text-xl sm:text-2xl font-black text-neutral-950 mt-1">
              {products.filter((p) => p.inStock !== false).length}
            </div>
          </div>

          <div className="bg-white p-4 border border-neutral-200">
            <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block">Total Outbound Clicks</span>
            <div className="text-xl sm:text-2xl font-black text-neutral-950 mt-1">{analytics?.totalClicks || 0}</div>
          </div>

          <div className="bg-white p-4 border border-neutral-200">
            <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block">Est. Commissions</span>
            <div className="text-xl sm:text-2xl font-black text-red-600 mt-1">
              {formatINR(analytics?.estimatedEarnings || 0)}
            </div>
          </div>
        </div>

        {/* TAB 1: PRODUCT LISTING & MANAGEMENT */}
        {activeTab === 'products' && (
          <div className="bg-white border border-neutral-200">
            
            {/* Table Filters & Actions Header */}
            <div className="p-4 sm:p-5 border-b border-neutral-200 flex flex-col md:flex-row items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2 w-full md:w-auto flex-1">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search by title or brand..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-neutral-50 border border-neutral-200 text-xs text-neutral-900 focus:bg-white focus:outline-none focus:border-black"
                  />
                </div>

                <select
                  value={storeFilter}
                  onChange={(e) => setStoreFilter(e.target.value)}
                  className="bg-neutral-50 border border-neutral-200 px-3 py-2 text-xs font-bold uppercase text-neutral-800"
                >
                  <option value="All">All Stores</option>
                  <option value="Myntra">Myntra</option>
                  <option value="Flipkart">Flipkart</option>
                  <option value="Amazon">Amazon</option>
                  <option value="Ajio">Ajio</option>
                </select>

                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="bg-neutral-50 border border-neutral-200 px-3 py-2 text-xs font-bold uppercase text-neutral-800"
                >
                  <option value="All">All Categories</option>
                  <option value="Women">Women</option>
                  <option value="Men">Men</option>
                  <option value="Footwear">Footwear</option>
                  <option value="Accessories">Accessories</option>
                  <option value="Beauty">Beauty</option>
                </select>
              </div>

              <button
                onClick={handleOpenAdd}
                className="w-full md:w-auto px-4 py-2 bg-neutral-950 hover:bg-neutral-800 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-1.5 cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Add Product</span>
              </button>
            </div>

            {/* Products Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-100 border-b border-neutral-200 text-neutral-700 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-3">Product</th>
                    <th className="p-3">Store</th>
                    <th className="p-3">Pricing (₹)</th>
                    <th className="p-3">Coupon</th>
                    <th className="p-3 text-center">In Stock</th>
                    <th className="p-3 text-center">Deal of Day</th>
                    <th className="p-3">Clicks</th>
                    <th className="p-3">Test Link</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {filteredProducts.map((p) => (
                    <tr key={p.id} className="hover:bg-neutral-50">
                      
                      {/* Thumbnail & Title */}
                      <td className="p-3 flex items-center space-x-3">
                        <img
                          src={p.imageUrl || 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=400&q=80'}
                          alt={p.title}
                          className="w-10 h-12 object-cover object-top border border-neutral-200 shrink-0 bg-neutral-100"
                        />
                        <div className="min-w-0 max-w-xs">
                          <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">{p.brand}</span>
                          <p className="font-semibold text-neutral-950 truncate" title={p.title}>{p.title}</p>
                          <span className="text-[10px] text-neutral-500">{p.category}</span>
                        </div>
                      </td>

                      {/* Store */}
                      <td className="p-3">
                        <span className="px-2 py-0.5 text-[10px] font-bold uppercase border border-neutral-300 text-neutral-900">
                          {p.marketplace}
                        </span>
                      </td>

                      {/* Price & Discount */}
                      <td className="p-3">
                        <div className="font-black text-neutral-950">{formatINR(p.dealPrice)}</div>
                        <div className="text-[10px] text-neutral-400">
                          MRP: <span className="line-through">{formatINR(p.originalPrice)}</span>
                          <span className="text-red-600 font-bold ml-1">(-{p.discountPercent}%)</span>
                        </div>
                      </td>

                      {/* Coupon */}
                      <td className="p-3">
                        {p.couponCode ? (
                          <span className="font-mono text-xs font-bold bg-neutral-100 px-1.5 py-0.5 border border-neutral-200 text-neutral-900">
                            {p.couponCode}
                          </span>
                        ) : (
                          <span className="text-neutral-400 text-xs italic">—</span>
                        )}
                      </td>

                      {/* Stock Toggle */}
                      <td className="p-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleInlineToggle(p, 'inStock')}
                          className={`px-2 py-0.5 text-[10px] font-bold uppercase cursor-pointer border ${
                            p.inStock !== false
                              ? 'bg-neutral-950 text-white border-neutral-950'
                              : 'bg-white text-neutral-400 border-neutral-300'
                          }`}
                          title="Click to toggle Stock Status"
                        >
                          {p.inStock !== false ? 'In Stock' : 'Out'}
                        </button>
                      </td>

                      {/* Deal of the Day Toggle */}
                      <td className="p-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleInlineToggle(p, 'isDealOfTheDay')}
                          className={`px-2 py-0.5 text-[10px] font-bold uppercase cursor-pointer border ${
                            p.isDealOfTheDay
                              ? 'bg-red-600 text-white border-red-600'
                              : 'bg-white text-neutral-400 border-neutral-300'
                          }`}
                          title="Click to toggle Deal of the Day status"
                        >
                          {p.isDealOfTheDay ? 'Yes' : 'No'}
                        </button>
                      </td>

                      {/* Clicks */}
                      <td className="p-3 font-bold text-neutral-900">
                        {p.clicks || 0}
                      </td>

                      {/* Test Affiliate Link */}
                      <td className="p-3">
                        <a
                          href={p.affiliateUrl || '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-1 px-2 py-0.5 text-[10px] font-bold uppercase border border-neutral-300 hover:border-black text-neutral-800"
                          title="Test direct merchant destination"
                        >
                          <span>Test</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      </td>

                      {/* Actions */}
                      <td className="p-3 text-right space-x-1 shrink-0">
                        <button
                          onClick={() => handleCloneProduct(p)}
                          className="p-1 text-neutral-500 hover:text-black cursor-pointer"
                          title="Duplicate Deal"
                        >
                          <CopyIcon className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(p)}
                          className="p-1 text-neutral-600 hover:text-black cursor-pointer"
                          title="Edit Deal"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(p.id, p.title)}
                          className="p-1 text-neutral-400 hover:text-red-600 cursor-pointer"
                          title="Delete Deal"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: OFFERS & FLASH SALES MANAGEMENT */}
        {activeTab === 'offers' && (
          <div className="space-y-6">
            
            {/* Top Announcement Bar Manager */}
            <div className="bg-white p-5 border border-neutral-200">
              <div className="flex items-center space-x-2 mb-2">
                <Megaphone className="w-4 h-4 text-red-600" />
                <h3 className="font-bold text-xs uppercase tracking-wider text-neutral-950">
                  Global Storefront Announcement Bar
                </h3>
              </div>
              <p className="text-xs text-neutral-500 mb-3">
                This notice appears across the top of the website for all shoppers.
              </p>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={settingsForm.announcementText}
                  onChange={(e) => setSettingsForm({ ...settingsForm, announcementText: e.target.value })}
                  placeholder="e.g. Mega Weekend Fashion Sale - Extra 20% off on Myntra!"
                  className="flex-1 px-3 py-2 bg-neutral-50 border border-neutral-300 text-xs focus:bg-white focus:outline-none focus:border-black"
                />
                <button
                  onClick={handleSaveSettings}
                  className="px-4 py-2 bg-neutral-950 hover:bg-neutral-800 text-white font-bold text-xs uppercase tracking-wider cursor-pointer"
                >
                  Save Notice
                </button>
              </div>
            </div>

            {/* Offers List & Creator */}
            <div className="bg-white border border-neutral-200">
              <div className="p-4 sm:p-5 border-b border-neutral-200 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm uppercase tracking-wider text-neutral-950">
                    Active Promotional Offers & Campaigns
                  </h3>
                  <p className="text-xs text-neutral-500">
                    Curate sitewide flash sales, coupon codes, and bank discount deals.
                  </p>
                </div>
                <button
                  onClick={handleOpenAddOffer}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider flex items-center space-x-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Offer</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-neutral-100 border-b border-neutral-200 text-neutral-700 font-bold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="p-3">Campaign Title</th>
                      <th className="p-3">Store</th>
                      <th className="p-3">Discount Details</th>
                      <th className="p-3">Coupon Code</th>
                      <th className="p-3">Validity</th>
                      <th className="p-3 text-center">Status</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200">
                    {offers.map((offer) => (
                      <tr key={offer.id} className="hover:bg-neutral-50">
                        <td className="p-3">
                          <p className="font-bold text-neutral-950">{offer.title}</p>
                          <span className="text-[10px] text-neutral-500">{offer.description}</span>
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 text-[10px] font-bold uppercase border border-neutral-300">
                            {offer.store}
                          </span>
                        </td>
                        <td className="p-3 font-bold text-red-600">{offer.discount}</td>
                        <td className="p-3">
                          {offer.couponCode ? (
                            <span className="font-mono text-xs font-bold bg-neutral-100 px-1.5 py-0.5 border border-neutral-200">
                              {offer.couponCode}
                            </span>
                          ) : (
                            <span className="text-neutral-400 italic">—</span>
                          )}
                        </td>
                        <td className="p-3 text-neutral-600 text-[11px]">{offer.validTill}</td>
                        <td className="p-3 text-center">
                          <span className={`px-2 py-0.5 text-[10px] font-bold uppercase border ${
                            offer.isActive
                              ? 'bg-neutral-950 text-white border-neutral-950'
                              : 'bg-white text-neutral-400 border-neutral-300'
                          }`}>
                            {offer.isActive ? 'Active' : 'Paused'}
                          </span>
                        </td>
                        <td className="p-3 text-right space-x-1">
                          <button
                            onClick={() => handleOpenEditOffer(offer)}
                            className="p-1 text-neutral-600 hover:text-black cursor-pointer"
                            title="Edit Offer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteOffer(offer.id, offer.title)}
                            className="p-1 text-neutral-400 hover:text-red-600 cursor-pointer"
                            title="Delete Offer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* TAB 3: CLICK TELEMETRY & ANALYTICS */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="bg-white p-6 border border-neutral-200">
                <h3 className="font-bold text-xs uppercase tracking-wider text-neutral-950 mb-4">
                  Outbound Clicks by Marketplace
                </h3>
                <div className="space-y-3 text-xs">
                  {['Myntra', 'Flipkart', 'Amazon'].map((store) => {
                    const count = analytics?.marketplaceClicks?.[store] || 0;
                    const total = analytics?.totalClicks || 1;
                    const pct = Math.round((count / total) * 100);

                    return (
                      <div key={store} className="space-y-1">
                        <div className="flex justify-between font-bold text-neutral-800">
                          <span>{store}</span>
                          <span>{count} clicks ({pct}%)</span>
                        </div>
                        <div className="w-full bg-neutral-100 h-2">
                          <div className="h-full bg-neutral-950" style={{ width: `${Math.max(pct, 3)}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-white p-6 border border-neutral-200">
                <h3 className="font-bold text-xs uppercase tracking-wider text-neutral-950 mb-4">
                  Top Converting Deals
                </h3>
                <div className="space-y-2.5 text-xs">
                  {analytics?.topProducts?.map((tp, idx) => (
                    <div key={tp.id} className="flex items-center justify-between p-2 border border-neutral-100">
                      <div className="flex items-center space-x-2 truncate max-w-[240px]">
                        <span className="font-bold text-neutral-400">#{idx + 1}</span>
                        <img src={tp.imageUrl || 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=400&q=80'} alt="" className="w-7 h-7 object-cover border border-neutral-200" />
                        <span className="font-semibold text-neutral-900 truncate">{tp.title}</span>
                      </div>
                      <span className="font-bold text-neutral-950 bg-neutral-100 px-2 py-0.5">
                        {tp.clicks} Clicks
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Click Stream Feed */}
            <div className="bg-white p-6 border border-neutral-200">
              <h3 className="font-bold text-xs uppercase tracking-wider text-neutral-950 mb-4">
                Real-Time Outbound Click Feed
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-neutral-100 text-neutral-700 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="p-2.5">Deal Product</th>
                      <th className="p-2.5">Store</th>
                      <th className="p-2.5">Timestamp</th>
                      <th className="p-2.5">Device/User-Agent</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {analytics?.recentClicks?.map((click, i) => (
                      <tr key={i} className="hover:bg-neutral-50">
                        <td className="p-2.5 font-semibold text-neutral-900">{click.productTitle}</td>
                        <td className="p-2.5 font-bold">{click.marketplace}</td>
                        <td className="p-2.5 text-neutral-500">{new Date(click.timestamp).toLocaleTimeString()}</td>
                        <td className="p-2.5 text-neutral-500 font-mono text-[10px] truncate max-w-xs">{click.userAgent}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: AFFILIATE KEYS & SETTINGS */}
        {activeTab === 'settings' && (
          <div className="bg-white p-6 sm:p-8 border border-neutral-200 max-w-2xl space-y-5 text-xs">
            <div>
              <h2 className="text-base font-black uppercase text-neutral-950 mb-1">
                Affiliate Tags & Platform Settings
              </h2>
              <p className="text-neutral-500 text-xs">
                These tags are appended to all product affiliate links to ensure your store commission is properly attributed.
              </p>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-neutral-600 uppercase mb-1">
                    Amazon Associate Tag
                  </label>
                  <input
                    type="text"
                    value={settingsForm.amazonTag}
                    onChange={(e) => setSettingsForm({ ...settingsForm, amazonTag: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 font-mono text-xs focus:bg-white focus:outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-neutral-600 uppercase mb-1">
                    Flipkart Affiliate ID
                  </label>
                  <input
                    type="text"
                    value={settingsForm.flipkartTag}
                    onChange={(e) => setSettingsForm({ ...settingsForm, flipkartTag: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 font-mono text-xs focus:bg-white focus:outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-neutral-600 uppercase mb-1">
                    Myntra Partner Tag
                  </label>
                  <input
                    type="text"
                    value={settingsForm.myntraTag}
                    onChange={(e) => setSettingsForm({ ...settingsForm, myntraTag: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 font-mono text-xs focus:bg-white focus:outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-neutral-600 uppercase mb-1">
                    Ajio Partner Tag
                  </label>
                  <input
                    type="text"
                    value={settingsForm.ajioTag}
                    onChange={(e) => setSettingsForm({ ...settingsForm, ajioTag: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 font-mono text-xs focus:bg-white focus:outline-none focus:border-black"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-neutral-100">
                <label className="block text-[10px] font-bold text-neutral-600 uppercase mb-1">
                  Telegram Deals Channel URL
                </label>
                <input
                  type="url"
                  value={settingsForm.telegramChannel}
                  onChange={(e) => setSettingsForm({ ...settingsForm, telegramChannel: e.target.value })}
                  placeholder="https://t.me/FashionHubDeals"
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 text-xs focus:bg-white focus:outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-neutral-600 uppercase mb-1">
                  Admin Security Passcode
                </label>
                <input
                  type="password"
                  value={settingsForm.adminPasscode}
                  onChange={(e) => setSettingsForm({ ...settingsForm, adminPasscode: e.target.value })}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 font-mono text-xs focus:bg-white focus:outline-none focus:border-black"
                />
                <p className="text-[10px] text-neutral-400 mt-1">
                  This key locks and unlocks the Merchant CRM portal. Keep it confidential.
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-neutral-950 hover:bg-neutral-800 text-white font-bold text-xs uppercase tracking-wider cursor-pointer"
                >
                  Save Settings
                </button>
              </div>
            </form>
          </div>
        )}

      </div>

      {/* FULL PRODUCT CREATION & EDIT MODAL WITH IMAGE UPLOAD */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 animate-in fade-in">
          <div 
            className="relative bg-white w-full max-w-2xl border border-neutral-300 p-6 sm:p-8 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowProductModal(false)}
              className="absolute top-5 right-5 w-8 h-8 text-neutral-500 hover:text-black flex items-center justify-center cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-base sm:text-lg font-black uppercase text-neutral-950 mb-1">
              {editingProduct ? 'Edit Affiliate Product Deal' : 'List New Affiliate Product'}
            </h2>
            <p className="text-xs text-neutral-500 mb-6">
              Upload product image, set offer prices, and input target affiliate link.
            </p>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              
              {/* IMAGE UPLOAD DROPZONE */}
              <div className="border-2 border-dashed border-neutral-300 p-4 bg-neutral-50 flex flex-col sm:flex-row items-center gap-4">
                {uploadPreview ? (
                  <div className="relative w-24 h-28 bg-white border border-neutral-200 shrink-0">
                    <img
                      src={uploadPreview}
                      alt="Preview"
                      className="w-full h-full object-cover object-top"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setUploadPreview('');
                        setFormData((prev) => ({ ...prev, imageUrl: '' }));
                      }}
                      className="absolute -top-2 -right-2 bg-neutral-950 text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px]"
                      title="Clear image"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <div className="w-24 h-28 border border-neutral-200 bg-white flex flex-col items-center justify-center text-neutral-400 shrink-0">
                    <ImageIcon className="w-6 h-6 mb-1" />
                    <span className="text-[10px]">No Image</span>
                  </div>
                )}

                <div className="flex-1 space-y-2 text-center sm:text-left">
                  <div>
                    <span className="font-bold text-neutral-900 block text-xs">Product Imagery</span>
                    <p className="text-[11px] text-neutral-500">
                      Upload product photo directly from your device (JPG, PNG, WebP).
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3.5 py-2 bg-neutral-950 hover:bg-neutral-800 text-white font-bold text-xs uppercase tracking-wider inline-flex items-center space-x-1.5 cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{uploadingImage ? 'Uploading Image...' : uploadPreview ? 'Change Product Image' : 'Upload Image from Device'}</span>
                    </button>
                    {uploadPreview && (
                      <span className="text-[11px] text-emerald-600 font-semibold flex items-center space-x-1">
                        <Check className="w-3 h-3" />
                        <span>Image Ready</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Title & Brand */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold text-neutral-700 uppercase mb-1">
                    Product Title <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Libas Floral Printed Pure Cotton Anarkali Kurta"
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 text-xs focus:bg-white focus:outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-neutral-700 uppercase mb-1">
                    Brand Name <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    placeholder="e.g. Puma, Libas, Levi's"
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 text-xs focus:bg-white focus:outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-neutral-700 uppercase mb-1">
                    Marketplace <span className="text-red-600">*</span>
                  </label>
                  <select
                    value={formData.marketplace}
                    onChange={(e) => setFormData({ ...formData, marketplace: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 text-xs font-bold uppercase focus:outline-none focus:border-black"
                  >
                    <option value="Myntra">Myntra</option>
                    <option value="Flipkart">Flipkart</option>
                    <option value="Amazon">Amazon</option>
                    <option value="Ajio">Ajio</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-neutral-700 uppercase mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 text-xs focus:outline-none focus:border-black"
                  >
                    <option value="Women">Women</option>
                    <option value="Men">Men</option>
                    <option value="Footwear">Footwear</option>
                    <option value="Accessories">Accessories</option>
                    <option value="Beauty">Beauty</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-neutral-700 uppercase mb-1">Subcategory</label>
                  <input
                    type="text"
                    value={formData.subCategory}
                    onChange={(e) => setFormData({ ...formData, subCategory: e.target.value })}
                    placeholder="e.g. Ethnic Wear, Sneakers"
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 text-xs focus:bg-white focus:outline-none focus:border-black"
                  />
                </div>

                {/* Pricing & Offer */}
                <div>
                  <label className="block text-[10px] font-bold text-neutral-700 uppercase mb-1">
                    Original MRP (₹) <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.originalPrice}
                    onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                    placeholder="2999"
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 text-xs focus:bg-white focus:outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-neutral-700 uppercase mb-1">
                    Deal / Offer Price (₹) <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.dealPrice}
                    onChange={(e) => setFormData({ ...formData, dealPrice: e.target.value })}
                    placeholder="899"
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 text-xs font-bold text-red-600 focus:bg-white focus:outline-none focus:border-black"
                  />
                </div>

                {/* Target Affiliate Link */}
                <div className="sm:col-span-2">
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[10px] font-bold text-neutral-900 uppercase">
                      Target Affiliate Redirect URL <span className="text-red-600">*</span>
                    </label>
                    {formData.affiliateUrl && (
                      <a
                        href={formData.affiliateUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] text-neutral-700 hover:text-black underline flex items-center space-x-0.5"
                      >
                        <span>Test Outbound URL</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )}
                  </div>
                  <input
                    type="url"
                    required
                    value={formData.affiliateUrl}
                    onChange={(e) => setFormData({ ...formData, affiliateUrl: e.target.value })}
                    placeholder="https://www.myntra.com/... or https://www.amazon.in/... with affiliate tag"
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-400 font-mono text-xs focus:bg-white focus:outline-none focus:border-black"
                  />
                  <p className="text-[10px] text-neutral-500 mt-1">
                    When shoppers click the deal on your website, they redirect immediately to this exact URL.
                  </p>
                </div>

                {/* Coupon Code */}
                <div>
                  <label className="block text-[10px] font-bold text-neutral-700 uppercase mb-1">Coupon Code (Optional)</label>
                  <input
                    type="text"
                    value={formData.couponCode}
                    onChange={(e) => setFormData({ ...formData, couponCode: e.target.value.toUpperCase() })}
                    placeholder="e.g. FLASH20"
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 font-mono text-xs focus:bg-white focus:outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-neutral-700 uppercase mb-1">Coupon Discount Label</label>
                  <input
                    type="text"
                    value={formData.couponDiscount}
                    onChange={(e) => setFormData({ ...formData, couponDiscount: e.target.value })}
                    placeholder="e.g. Extra 20% OFF"
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 text-xs focus:bg-white focus:outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-neutral-700 uppercase mb-1">Badge Tag</label>
                  <select
                    value={formData.badge}
                    onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 text-xs font-bold uppercase focus:outline-none focus:border-black"
                  >
                    <option value="HOT DEAL">HOT DEAL</option>
                    <option value="PRICE DROP">PRICE DROP</option>
                    <option value="BESTSELLER">BESTSELLER</option>
                    <option value="LIMITED TIME">LIMITED TIME</option>
                    <option value="LUXURY DEAL">LUXURY DEAL</option>
                    <option value="TRENDING">TRENDING</option>
                  </select>
                </div>

                {/* Toggles */}
                <div className="flex items-center space-x-6 pt-5">
                  <label className="inline-flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.inStock}
                      onChange={(e) => setFormData({ ...formData, inStock: e.target.checked })}
                      className="w-4 h-4 accent-black"
                    />
                    <span className="font-bold text-neutral-900 text-xs">In Stock</span>
                  </label>

                  <label className="inline-flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isDealOfTheDay}
                      onChange={(e) => setFormData({ ...formData, isDealOfTheDay: e.target.checked })}
                      className="w-4 h-4 accent-black"
                    />
                    <span className="font-bold text-neutral-900 text-xs">Deal of Day</span>
                  </label>

                  <label className="inline-flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isFeatured}
                      onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                      className="w-4 h-4 accent-black"
                    />
                    <span className="font-bold text-neutral-900 text-xs">Featured</span>
                  </label>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end space-x-3 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="px-4 py-2 border border-neutral-300 text-neutral-700 hover:text-black font-bold uppercase text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-neutral-950 hover:bg-neutral-800 text-white font-bold uppercase text-xs cursor-pointer"
                >
                  {editingProduct ? 'Save Deal Updates' : 'Publish Product to Store'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* CREATE / EDIT OFFER CAMPAIGN MODAL */}
      {showOfferModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 animate-in fade-in">
          <div 
            className="relative bg-white w-full max-w-lg border border-neutral-300 p-6 sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowOfferModal(false)}
              className="absolute top-4 right-4 text-neutral-500 hover:text-black cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-base font-black uppercase text-neutral-950 mb-1">
              {editingOffer ? 'Edit Promotional Offer' : 'Create New Promotional Campaign'}
            </h2>
            <p className="text-xs text-neutral-500 mb-5">
              Highlight marketplace discount events and promo codes on the storefront.
            </p>

            <form onSubmit={handleSaveOffer} className="space-y-3 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-neutral-700 uppercase mb-1">
                  Offer Title <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={offerFormData.title}
                  onChange={(e) => setOfferFormData({ ...offerFormData, title: e.target.value })}
                  placeholder="e.g. Myntra Fashion Carnival 75% Off"
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 text-xs focus:bg-white focus:outline-none focus:border-black"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-neutral-700 uppercase mb-1">Marketplace</label>
                  <select
                    value={offerFormData.store}
                    onChange={(e) => setOfferFormData({ ...offerFormData, store: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 text-xs font-bold uppercase focus:outline-none"
                  >
                    <option value="Myntra">Myntra</option>
                    <option value="Flipkart">Flipkart</option>
                    <option value="Amazon">Amazon</option>
                    <option value="Ajio">Ajio</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-neutral-700 uppercase mb-1">Discount Headline</label>
                  <input
                    type="text"
                    required
                    value={offerFormData.discount}
                    onChange={(e) => setOfferFormData({ ...offerFormData, discount: e.target.value })}
                    placeholder="e.g. Flat 70% Off + 15%"
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 text-xs font-bold text-red-600 focus:bg-white focus:outline-none focus:border-black"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-neutral-700 uppercase mb-1">Coupon Code (Optional)</label>
                  <input
                    type="text"
                    value={offerFormData.couponCode}
                    onChange={(e) => setOfferFormData({ ...offerFormData, couponCode: e.target.value.toUpperCase() })}
                    placeholder="e.g. EORS15"
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 font-mono text-xs focus:bg-white focus:outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-neutral-700 uppercase mb-1">Valid Till</label>
                  <input
                    type="text"
                    value={offerFormData.validTill}
                    onChange={(e) => setOfferFormData({ ...offerFormData, validTill: e.target.value })}
                    placeholder="e.g. Tonight 11:59 PM"
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 text-xs focus:bg-white focus:outline-none focus:border-black"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-neutral-700 uppercase mb-1">Target Campaign URL</label>
                <input
                  type="url"
                  value={offerFormData.affiliateUrl}
                  onChange={(e) => setOfferFormData({ ...offerFormData, affiliateUrl: e.target.value })}
                  placeholder="https://www.myntra.com/... or https://www.amazon.in/..."
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 font-mono text-xs focus:bg-white focus:outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-neutral-700 uppercase mb-1">Short Description</label>
                <textarea
                  rows={2}
                  value={offerFormData.description}
                  onChange={(e) => setOfferFormData({ ...offerFormData, description: e.target.value })}
                  placeholder="Offer summary or terms"
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 text-xs focus:bg-white focus:outline-none focus:border-black resize-none"
                />
              </div>

              <div className="pt-1">
                <label className="inline-flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={offerFormData.isActive}
                    onChange={(e) => setOfferFormData({ ...offerFormData, isActive: e.target.checked })}
                    className="w-4 h-4 accent-black"
                  />
                  <span className="font-bold text-neutral-900 text-xs">Campaign is Active</span>
                </label>
              </div>

              <div className="pt-3 flex items-center justify-end space-x-2 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setShowOfferModal(false)}
                  className="px-4 py-2 border border-neutral-300 text-neutral-700 font-bold uppercase text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-neutral-950 hover:bg-neutral-800 text-white font-bold uppercase text-xs cursor-pointer"
                >
                  Save Campaign
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Mobile Sidebar Navigation Drawer (Android & iOS) */}
      <AdminMobileDrawer
        isOpen={isMobileDrawerOpen}
        onClose={() => setIsMobileDrawerOpen(false)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        products={products}
        offers={offers}
        analytics={analytics}
        onOpenAddProduct={handleOpenAdd}
        onOpenAddOffer={handleOpenAddOffer}
        onExitAdmin={onExitAdmin}
      />

    </div>
  );
}
