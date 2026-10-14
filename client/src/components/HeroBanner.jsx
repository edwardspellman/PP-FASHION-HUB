import React from 'react';
import { ArrowDown, ExternalLink } from 'lucide-react';

export default function HeroBanner({ settings, onExploreClick }) {
  return (
    <div className="hidden lg:block bg-neutral-950 text-white border-b border-neutral-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Main Editorial Text */}
          <div className="lg:col-span-8 space-y-4">
            <div className="inline-block bg-neutral-900 border border-neutral-800 text-neutral-300 text-[11px] font-bold uppercase tracking-widest px-3 py-1">
              Curated Fashion Deals & Affiliate Storefront
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight uppercase">
              Curated Deals From <br className="hidden sm:inline" />
              <span className="text-red-500">Myntra, Flipkart & Amazon</span>
            </h1>

            <p className="text-neutral-400 text-sm sm:text-base max-w-2xl leading-relaxed">
              Every deal is verified and linked directly to the official merchant site. Browse real-time price drops, exclusive coupon codes, and grab up to 80% off premium apparel, footwear, and accessories.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-3">
              <button
                onClick={onExploreClick}
                className="px-6 py-3 bg-white text-neutral-950 hover:bg-neutral-200 font-bold text-xs uppercase tracking-wider inline-flex items-center space-x-2 transition-colors cursor-pointer"
              >
                <span>Browse Deals</span>
                <ArrowDown className="w-4 h-4" />
              </button>

              {settings?.telegramChannel && (
                <a
                  href={settings.telegramChannel}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-3 border border-neutral-700 hover:border-white text-white text-xs font-bold uppercase tracking-wider transition-colors inline-flex items-center space-x-2"
                >
                  <span>Telegram Alerts</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>

          {/* Right Partner Stores Minimal Grid - Hidden on Mobile (Android & iOS) */}
          <div className="hidden lg:block lg:col-span-4 border border-neutral-800 bg-neutral-900/60 p-5 space-y-4">
            <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest border-b border-neutral-800 pb-2">
              Featured Marketplaces
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between py-1">
                <div>
                  <div className="font-bold text-sm text-white">MYNTRA</div>
                  <div className="text-xs text-neutral-400">Kurtas, Dresses & Ethnic Wear</div>
                </div>
                <span className="text-red-500 font-bold text-xs">UP TO 75% OFF</span>
              </div>

              <div className="flex items-center justify-between py-1 border-t border-neutral-800/60">
                <div>
                  <div className="font-bold text-sm text-white">FLIPKART</div>
                  <div className="text-xs text-neutral-400">Denims, Shirts & Casual Wear</div>
                </div>
                <span className="text-red-500 font-bold text-xs">UP TO 70% OFF</span>
              </div>

              <div className="flex items-center justify-between py-1 border-t border-neutral-800/60">
                <div>
                  <div className="font-bold text-sm text-white">AMAZON</div>
                  <div className="text-xs text-neutral-400">Sneakers, Watches & Jewellery</div>
                </div>
                <span className="text-red-500 font-bold text-xs">UP TO 80% OFF</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
