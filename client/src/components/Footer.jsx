import React from 'react';
import { ShoppingBag, ExternalLink, ShieldCheck, Lock } from 'lucide-react';

export default function Footer({ settings, onCategorySelect, onOpenAdmin, isAdminAuthenticated, currentView }) {
  const isCrmActive = Boolean(isAdminAuthenticated || currentView === 'admin');

  return (
    <footer className="bg-neutral-950 text-neutral-400 text-xs border-t border-neutral-900 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand Info */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 bg-white text-neutral-950 flex items-center justify-center font-bold">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-base text-white tracking-tight">
                THE FASHION HUB
              </span>
            </div>
            <p className="text-neutral-400 text-xs leading-relaxed">
              Curated affiliate fashion deals aggregator. We curate genuine price drops, promo codes, and trending styles across Myntra, Flipkart, and Amazon.
            </p>
            {settings?.telegramChannel && (
              <a
                href={settings.telegramChannel}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-1 text-xs font-bold text-white hover:underline"
              >
                <span>Telegram Deal Alerts</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>

          {/* Categories */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-bold text-white uppercase tracking-widest">Categories</h4>
            <ul className="space-y-2 text-neutral-400">
              <li>
                <button onClick={() => onCategorySelect('Women')} className="hover:text-white transition-colors cursor-pointer">
                  Women's Ethnic & Kurtis
                </button>
              </li>
              <li>
                <button onClick={() => onCategorySelect('Women')} className="hover:text-white transition-colors cursor-pointer">
                  Western Wear & Dresses
                </button>
              </li>
              <li>
                <button onClick={() => onCategorySelect('Men')} className="hover:text-white transition-colors cursor-pointer">
                  Men's Shirts & Streetwear
                </button>
              </li>
              <li>
                <button onClick={() => onCategorySelect('Footwear')} className="hover:text-white transition-colors cursor-pointer">
                  Sneakers & Loafers
                </button>
              </li>
              <li>
                <button onClick={() => onCategorySelect('Accessories')} className="hover:text-white transition-colors cursor-pointer">
                  Watches & Handbags
                </button>
              </li>
            </ul>
          </div>

          {/* Partner Marketplaces */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-bold text-white uppercase tracking-widest">Supported Marketplaces</h4>
            <ul className="space-y-2 text-neutral-400">
              <li className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 bg-red-600 rounded-full" />
                <span>Myntra Fashion</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 bg-neutral-300 rounded-full" />
                <span>Flipkart Marketplace</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 bg-neutral-300 rounded-full" />
                <span>Amazon India</span>
              </li>
              <li className="flex items-center space-x-2 pt-1 border-t border-neutral-900">
                <button
                  type="button"
                  onClick={onOpenAdmin}
                  className={`flex items-center space-x-2 text-left cursor-pointer transition-colors ${
                    isCrmActive
                      ? 'text-emerald-400 font-bold hover:text-emerald-300'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                  title={isCrmActive ? "Merchant CRM Portal (Admin Active)" : "Access Merchant CRM"}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full transition-all ${
                      isCrmActive
                        ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.9)] animate-pulse'
                        : 'bg-neutral-500'
                    }`}
                  />
                  <span className={isCrmActive ? 'text-emerald-400 font-bold tracking-wide' : ''}>
                    CRM
                  </span>
                  {isCrmActive && (
                    <span className="text-[9px] uppercase tracking-wider font-extrabold text-emerald-400 bg-emerald-950/80 border border-emerald-700/80 px-1.5 py-0.5 rounded ml-1">
                      Active
                    </span>
                  )}
                </button>
              </li>
            </ul>
          </div>

          {/* Direct Checkout & Safety */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-bold text-white uppercase tracking-widest">Safe Direct Checkout</h4>
            <div className="space-y-2 text-neutral-400">
              <div className="flex items-start space-x-2">
                <ShieldCheck className="w-4 h-4 text-white shrink-0 mt-0.5" />
                <span>All purchases and payments take place directly on the official merchant site. We never handle customer payment details.</span>
              </div>
            </div>
          </div>

        </div>

        {/* Affiliate Disclosure Notice */}
        <div className="mt-10 pt-8 border-t border-neutral-900 text-[11px] text-neutral-500 space-y-2">
          <p className="leading-relaxed">
            <strong className="text-neutral-400">Affiliate Disclosure:</strong> The Fashion Hub is an affiliate marketing and deal aggregation website. When users click product links to partner platforms (Amazon, Flipkart, Myntra) and make a qualifying purchase, we may earn an affiliate commission at no extra cost to the buyer. All prices and discounts are subject to change by respective retailers.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-between text-neutral-600 pt-2 gap-2 text-[10px]">
            <span>© {new Date().getFullYear()} The Fashion Hub. All rights reserved.</span>
            
            {/* Discreet Merchant CRM Link */}
            <div className="flex items-center space-x-4">
              <span>Minimalist Editorial Deals</span>
              <button
                onClick={onOpenAdmin}
                className="text-neutral-600 hover:text-neutral-300 flex items-center space-x-1 transition-colors cursor-pointer"
                title="Merchant Administration CRM"
              >
                <Lock className="w-3 h-3" />
                <span>Merchant CRM</span>
              </button>
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
}
