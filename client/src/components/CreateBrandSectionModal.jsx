import React, { useState } from 'react';
import { X, Sparkles, Plus, Tag, Layers, Check } from 'lucide-react';

export default function CreateBrandSectionModal({
  isOpen,
  onClose,
  onSuccess,
  onShowToast,
  existingBrands = []
}) {
  const [title, setTitle] = useState('');
  const [brandOrStore, setBrandOrStore] = useState('');
  const [type, setType] = useState('brand'); // 'brand' | 'marketplace'
  const [subtitle, setSubtitle] = useState('');
  const [badge, setBadge] = useState('HOT DROP');
  const [minDiscount, setMinDiscount] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const quickPills = [
    { label: 'Meesho', type: 'marketplace' },
    { label: 'Myntra', type: 'marketplace' },
    { label: 'Roadster', type: 'brand' },
    { label: 'Zara', type: 'brand' },
    { label: 'H&M', type: 'brand' },
    { label: 'Nike', type: 'brand' },
    { label: 'Dennis Lingo', type: 'brand' },
    { label: 'Flipkart', type: 'marketplace' },
    { label: 'Amazon', type: 'marketplace' }
  ];

  const badgePresets = ['HOT DROP', 'UNDER ₹499', 'FLAT 70% OFF', 'BESTSELLERS', 'BUDGET FINDS', 'EXCLUSIVE'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !brandOrStore.trim()) {
      if (onShowToast) onShowToast('Please provide both Section Title and Brand/Store name');
      return;
    }

    setLoading(true);
    const newSectionData = {
      id: `sec_${Date.now()}`,
      title: title.trim(),
      brandOrStore: brandOrStore.trim(),
      type,
      subtitle: subtitle.trim(),
      badge: badge.trim(),
      minDiscount: minDiscount.trim(),
      isActive: true,
      sortOrder: Date.now()
    };

    try {
      const res = await fetch('/api/brand-sections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSectionData)
      });
      const data = await res.json();
      if (data.success) {
        onSuccess(data.data);
        if (onShowToast) onShowToast(`Created brand section "${title.trim()}"`);
        onClose();
      } else {
        // Fallback local persistence
        onSuccess(newSectionData);
        if (onShowToast) onShowToast(`Created brand section "${title.trim()}"`);
        onClose();
      }
    } catch (err) {
      // Local fallback
      onSuccess(newSectionData);
      if (onShowToast) onShowToast(`Created brand section "${title.trim()}" (saved locally)`);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="relative bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white w-full max-w-lg border border-neutral-300 dark:border-neutral-800 shadow-2xl p-6 sm:p-7 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-400 hover:text-black dark:hover:text-white cursor-pointer p-1"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="mb-5 space-y-1">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 bg-red-600 rounded-full" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-red-600">
              Custom Showcase Builder
            </span>
          </div>
          <h3 className="text-xl font-black uppercase tracking-tight text-neutral-950 dark:text-white">
            Create Brand / Store Section
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Build a dedicated showcase on the storefront for Meesho, specific fashion brands, or curated marketplaces.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Section Title */}
          <div>
            <label className="block text-[10px] font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-widest mb-1.5">
              Section Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Meesho Saree Bazaar or Zara Streetwear Edit"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 px-3 py-2 text-neutral-900 dark:text-white focus:outline-none focus:border-neutral-950 dark:focus:border-white font-medium text-xs"
            />
          </div>

          {/* Target Brand / Store Selection */}
          <div>
            <label className="block text-[10px] font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-widest mb-1.5">
              Brand or Store to Showcase *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Meesho, Roadster, Nike, Zara, Myntra..."
              value={brandOrStore}
              onChange={(e) => setBrandOrStore(e.target.value)}
              className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 px-3 py-2 text-neutral-900 dark:text-white focus:outline-none focus:border-neutral-950 dark:focus:border-white font-medium text-xs mb-2"
            />

            {/* Quick Pills */}
            <div className="flex flex-wrap gap-1.5 items-center pt-1">
              <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider mr-1">
                Popular:
              </span>
              {quickPills.map((pill) => (
                <button
                  type="button"
                  key={pill.label}
                  onClick={() => {
                    setBrandOrStore(pill.label);
                    setType(pill.type);
                    if (!title) {
                      setTitle(`${pill.label} Curated Deals`);
                    }
                  }}
                  className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border cursor-pointer transition-colors ${
                    brandOrStore.toLowerCase() === pill.label.toLowerCase()
                      ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 border-neutral-950 dark:border-white'
                      : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700 hover:border-black dark:hover:border-white'
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>
          </div>

          {/* Subtitle / Description */}
          <div>
            <label className="block text-[10px] font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-widest mb-1.5">
              Tagline / Subtitle
            </label>
            <input
              type="text"
              placeholder="e.g. Top budget ethnic wear direct from verified suppliers"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 px-3 py-2 text-neutral-900 dark:text-white focus:outline-none focus:border-neutral-950 dark:focus:border-white font-medium text-xs"
            />
          </div>

          {/* Badge & Minimum Discount Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-widest mb-1.5">
                Section Badge
              </label>
              <input
                type="text"
                placeholder="e.g. HOT DROP"
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 px-3 py-2 text-neutral-900 dark:text-white focus:outline-none focus:border-neutral-950 dark:focus:border-white font-medium text-xs mb-1.5"
              />
              <div className="flex flex-wrap gap-1">
                {badgePresets.slice(0, 3).map((b) => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => setBadge(b)}
                    className="text-[9px] px-1.5 py-0.5 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:text-black dark:hover:text-white cursor-pointer font-bold"
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-widest mb-1.5">
                Min. Discount Filter
              </label>
              <select
                value={minDiscount}
                onChange={(e) => setMinDiscount(e.target.value)}
                className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 px-3 py-2 text-neutral-900 dark:text-white focus:outline-none focus:border-neutral-950 dark:focus:border-white font-medium text-xs"
              >
                <option value="">Any Discount</option>
                <option value="50">50%+ Off Only</option>
                <option value="60">60%+ Off Only</option>
                <option value="70">70%+ Off Only</option>
              </select>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="pt-3 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-neutral-950 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-neutral-950 font-bold text-xs uppercase tracking-wider cursor-pointer inline-flex items-center space-x-1.5 transition-colors disabled:opacity-50"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{loading ? 'Creating...' : 'Create Section'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
