import React from 'react';
import { RotateCcw } from 'lucide-react';

export default function FilterBar({
  categories,
  selectedCategory,
  setSelectedCategory,
  selectedMarketplace,
  setSelectedMarketplace,
  sortBy,
  setSortBy,
  minDiscount,
  setMinDiscount,
  maxPrice,
  setMaxPrice,
  totalResults,
  resetFilters
}) {
  const marketplaces = ['All', 'Myntra', 'Flipkart', 'Amazon', 'Meesho'];
  const discountOptions = [
    { label: 'All Discounts', value: '' },
    { label: '50%+ Off', value: '50' },
    { label: '60%+ Off', value: '60' },
    { label: '70%+ Off', value: '70' }
  ];

  const priceOptions = [
    { label: 'Any Budget', value: '' },
    { label: 'Under ₹500', value: '500' },
    { label: 'Under ₹1,000', value: '1000' },
    { label: 'Under ₹2,000', value: '2000' }
  ];

  const isFiltered = selectedCategory !== 'All' || selectedMarketplace !== 'All' || minDiscount || maxPrice || sortBy !== 'featured';

  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-4 sm:p-5 mb-8 space-y-4 transition-colors">
      {/* Categories Row */}
      <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-neutral-100 dark:border-neutral-800">
        <div className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto py-1">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors whitespace-nowrap cursor-pointer border ${
                  isSelected
                    ? 'bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 border-neutral-950 dark:border-white'
                    : 'bg-white dark:bg-neutral-950 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700 hover:border-neutral-950 dark:hover:border-neutral-300 hover:text-black dark:hover:text-white'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {isFiltered && (
          <button
            onClick={resetFilters}
            className="inline-flex items-center space-x-1 text-xs text-red-600 hover:text-red-700 font-bold uppercase tracking-wider cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Dropdown Filters Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        {/* Marketplace */}
        <div>
          <label className="block text-[10px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-widest mb-1">
            Store
          </label>
          <select
            value={selectedMarketplace}
            onChange={(e) => setSelectedMarketplace(e.target.value)}
            className="w-full bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-none px-2.5 py-2 font-medium text-neutral-900 dark:text-white focus:outline-none focus:border-neutral-950 dark:focus:border-white"
          >
            {marketplaces.map((m) => (
              <option key={m} value={m} className="dark:bg-neutral-950 dark:text-white">
                {m === 'All' ? 'All Stores' : m}
              </option>
            ))}
          </select>
        </div>

        {/* Discount */}
        <div>
          <label className="block text-[10px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-widest mb-1">
            Discount
          </label>
          <select
            value={minDiscount}
            onChange={(e) => setMinDiscount(e.target.value)}
            className="w-full bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-none px-2.5 py-2 font-medium text-neutral-900 dark:text-white focus:outline-none focus:border-neutral-950 dark:focus:border-white"
          >
            {discountOptions.map((opt) => (
              <option key={opt.label} value={opt.value} className="dark:bg-neutral-950 dark:text-white">
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Budget */}
        <div>
          <label className="block text-[10px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-widest mb-1">
            Max Price
          </label>
          <select
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="w-full bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-none px-2.5 py-2 font-medium text-neutral-900 dark:text-white focus:outline-none focus:border-neutral-950 dark:focus:border-white"
          >
            {priceOptions.map((opt) => (
              <option key={opt.label} value={opt.value} className="dark:bg-neutral-950 dark:text-white">
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Sort */}
        <div>
          <label className="block text-[10px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-widest mb-1">
            Sort
          </label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-none px-2.5 py-2 font-medium text-neutral-900 dark:text-white focus:outline-none focus:border-neutral-950 dark:focus:border-white"
          >
            <option value="featured" className="dark:bg-neutral-950 dark:text-white">Featured Deals</option>
            <option value="popular" className="dark:bg-neutral-950 dark:text-white">Most Clicked</option>
            <option value="discount-high" className="dark:bg-neutral-950 dark:text-white">Highest Discount %</option>
            <option value="price-low" className="dark:bg-neutral-950 dark:text-white">Price: Low to High</option>
            <option value="price-high" className="dark:bg-neutral-950 dark:text-white">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400 pt-1">
        <span>
          Showing <strong className="text-neutral-950 dark:text-white font-bold">{totalResults}</strong> curated deals
        </span>
        <span className="hidden sm:inline text-neutral-400 dark:text-neutral-500">
          Clicking any deal takes you directly to the merchant checkout
        </span>
      </div>
    </div>
  );
}
