import React, { useEffect } from 'react';
import { 
  X, 
  ShoppingBag, 
  Flame, 
  BarChart3, 
  KeyRound, 
  Plus, 
  Eye, 
  Megaphone, 
  ShieldCheck, 
  Sparkles,
  Database,
  Sun,
  Moon
} from 'lucide-react';
import { formatINR } from '../utils/formatters';

export default function AdminMobileDrawer({
  isOpen,
  onClose,
  activeTab,
  setActiveTab,
  products = [],
  offers = [],
  brandSections = [],
  analytics,
  onOpenAddProduct,
  onOpenAddOffer,
  onExitAdmin,
  theme,
  onToggleTheme
}) {
  // Lock body scroll when mobile drawer is open (Android & iOS)
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

  const handleSelectTab = (tab) => {
    setActiveTab(tab);
    onClose();
  };

  const handleListDeal = () => {
    onClose();
    if (onOpenAddProduct) onOpenAddProduct();
  };

  const handlePublishOffer = () => {
    onClose();
    if (onOpenAddOffer) onOpenAddOffer();
  };

  const handleViewStore = () => {
    onClose();
    if (onExitAdmin) onExitAdmin();
  };

  const navItems = [
    {
      id: 'products',
      label: 'Product Catalog',
      icon: ShoppingBag,
      count: products.length,
      badge: 'DEALS'
    },
    {
      id: 'offers',
      label: 'Offers & Flash Sales',
      icon: Flame,
      count: offers.length,
      badge: 'PROMOS'
    },
    {
      id: 'sections',
      label: 'Brand Sections',
      icon: Sparkles,
      count: brandSections.length,
      badge: 'CUSTOM'
    },
    {
      id: 'analytics',
      label: 'Click Telemetry',
      icon: BarChart3,
      count: analytics?.totalClicks || 0,
      badge: 'TELEMETRY'
    },
    {
      id: 'settings',
      label: 'Affiliate Tags & Keys',
      icon: KeyRound,
      badge: 'CONFIG'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/75 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-out Sidebar Drawer */}
      <div 
        className="relative w-4/5 max-w-xs bg-neutral-950 dark:bg-black text-white h-full shadow-2xl flex flex-col justify-between overflow-y-auto border-l border-neutral-800 z-50 animate-in slide-in-from-right duration-200"
        role="dialog"
        aria-modal="true"
        aria-label="Merchant CRM Navigation"
      >
        <div className="p-5 space-y-6">
          
          {/* Header */}
          <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 bg-white text-neutral-950 flex items-center justify-center font-bold">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <span className="font-extrabold text-sm tracking-tight uppercase text-white">
                    PP FASHION HUB
                  </span>
                </div>
                <div className="flex items-center space-x-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.9)] animate-pulse" />
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">
                    CRM ONLINE
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-sm cursor-pointer transition-colors"
              aria-label="Close CRM menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Metrics Snapshot */}
          <div className="bg-neutral-900 border border-neutral-800 p-3 rounded-none">
            <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest block mb-2">
              Performance Snapshot
            </span>
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="bg-neutral-950 p-2 border border-neutral-800/80">
                <span className="text-[9px] text-neutral-400 uppercase tracking-wider block">Products</span>
                <span className="text-sm font-black text-white">{products.length}</span>
              </div>
              <div className="bg-neutral-950 p-2 border border-neutral-800/80">
                <span className="text-[9px] text-neutral-400 uppercase tracking-wider block">Outbound Clicks</span>
                <span className="text-sm font-black text-white">{analytics?.totalClicks || 0}</span>
              </div>
              <div className="bg-neutral-950 p-2 border border-neutral-800/80 col-span-2 flex items-center justify-between px-3">
                <span className="text-[9px] text-neutral-400 uppercase tracking-wider">Est. Earnings</span>
                <span className="text-xs font-black text-emerald-400">{formatINR(analytics?.estimatedEarnings || 0)}</span>
              </div>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block">
              Quick Actions
            </span>
            
            <button
              onClick={handleListDeal}
              className="w-full py-2.5 px-3 bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-2 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>List New Deal</span>
            </button>

            <button
              onClick={handlePublishOffer}
              className="w-full py-2.5 px-3 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-2 transition-colors cursor-pointer"
            >
              <Megaphone className="w-3.5 h-3.5 text-amber-400" />
              <span>Publish Flash Offer</span>
            </button>
          </div>

          {/* CRM Navigation Workspaces */}
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block mb-2">
              CRM Workspaces
            </span>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer border ${
                    isActive
                      ? 'bg-white text-neutral-950 border-white font-black'
                      : 'bg-neutral-900/60 text-neutral-300 hover:bg-neutral-900 border-neutral-800/80 hover:text-white'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-neutral-950' : 'text-neutral-400'}`} />
                    <span>{item.label}</span>
                  </div>

                  {item.count !== undefined ? (
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded-none ${
                        isActive 
                          ? 'bg-neutral-950 text-white' 
                          : 'bg-neutral-800 text-neutral-300 border border-neutral-700'
                      }`}
                    >
                      {item.count}
                    </span>
                  ) : (
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 tracking-wider ${
                        isActive
                          ? 'bg-neutral-950 text-white'
                          : 'bg-neutral-800 text-neutral-400'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Theme Toggle & Storefront Access */}
          <div className="pt-2 border-t border-neutral-900 space-y-2">
            {onToggleTheme && (
              <button
                type="button"
                onClick={onToggleTheme}
                className="w-full py-2 px-3 border border-neutral-800 bg-neutral-900/80 text-neutral-300 hover:text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-2 transition-colors cursor-pointer"
              >
                {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5" />}
                <span>{theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}</span>
              </button>
            )}

            <button
              onClick={handleViewStore}
              className="w-full py-2.5 px-3 border border-neutral-700 hover:border-white text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-2 transition-colors cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5 text-neutral-300" />
              <span>View Customer Storefront</span>
            </button>
          </div>

        </div>

        {/* Footer / System Meta */}
        <div className="p-4 border-t border-neutral-900 bg-neutral-900/40 text-[10px] text-neutral-400 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="flex items-center space-x-1.5">
              <Database className="w-3 h-3 text-emerald-400" />
              <span>Database Engine</span>
            </span>
            <span className="font-mono text-neutral-300">SQLite v3</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-neutral-400">Security Gate</span>
            <span className="text-emerald-400 font-bold">SHA-256 Protected</span>
          </div>

          <div className="pt-2 text-center text-[9px] text-neutral-400 uppercase tracking-widest border-t border-neutral-800">
            PP FASHION HUB &bull; MERCHANT CRM
          </div>
        </div>

      </div>
    </div>
  );
}
