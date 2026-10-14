import React, { useState } from 'react';
import { 
  X, 
  Link2, 
  Copy, 
  Check, 
  MessageCircle
} from 'lucide-react';

export default function AffiliateLinkGeneratorModal({
  isOpen,
  onClose,
  settings,
  onShowToast
}) {
  const [inputUrl, setInputUrl] = useState('');
  const [productTitle, setProductTitle] = useState('');
  const [dealPrice, setDealPrice] = useState('');
  const [discountPercent, setDiscountPercent] = useState('');
  const [convertedResult, setConvertedResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedMsg, setCopiedMsg] = useState(false);

  if (!isOpen) return null;

  const handleConvert = async (e) => {
    e.preventDefault();
    if (!inputUrl.trim()) return;

    setLoading(true);
    try {
      const res = await fetch('/api/tools/convert-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: inputUrl.trim() })
      });
      const data = await res.json();
      if (data.success) {
        setConvertedResult(data);
      } else {
        onShowToast(data.message || 'Failed to convert URL');
      }
    } catch (err) {
      let store = 'General';
      let converted = inputUrl.trim();
      const tags = settings?.affiliateTags || {};

      try {
        const u = new URL(inputUrl.trim());
        if (inputUrl.includes('amazon.')) {
          store = 'Amazon';
          u.searchParams.set('tag', tags.amazon || 'fashionhub-21');
          converted = u.toString();
        } else if (inputUrl.includes('flipkart.')) {
          store = 'Flipkart';
          u.searchParams.set('affid', tags.flipkart || 'fashionhub_flipkart');
          converted = u.toString();
        } else if (inputUrl.includes('myntra.')) {
          store = 'Myntra';
          u.searchParams.set('aff_tag', tags.myntra || 'fashionhub_myntra');
          converted = u.toString();
        }
        setConvertedResult({
          convertedUrl: converted,
          detectedStore: store,
          tagApplied: tags[store.toLowerCase()] || 'Default'
        });
      } catch (e2) {
        onShowToast('Please enter a valid URL');
      }
    } finally {
      setLoading(false);
    }
  };

  const generatedPromoMessage = convertedResult
    ? `Fashion Deal Alert: ${productTitle || 'Curated Deal'}\nOffer Price: ₹${dealPrice || 'Best Price'}${discountPercent ? ` (${discountPercent}% OFF)` : ''}\nBuy on ${convertedResult.detectedStore}: ${convertedResult.convertedUrl}`
    : '';

  const handleCopyLink = () => {
    if (!convertedResult?.convertedUrl) return;
    navigator.clipboard.writeText(convertedResult.convertedUrl);
    setCopiedLink(true);
    onShowToast('Affiliate URL copied!');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyMessage = () => {
    if (!generatedPromoMessage) return;
    navigator.clipboard.writeText(generatedPromoMessage);
    setCopiedMsg(true);
    onShowToast('Promotional copy copied!');
    setTimeout(() => setCopiedMsg(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 animate-in fade-in duration-150">
      <div 
        className="relative bg-white w-full max-w-xl border border-neutral-300 p-6 sm:p-8 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 text-neutral-500 hover:text-black flex items-center justify-center cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-2 mb-4">
          <div className="w-8 h-8 bg-neutral-950 text-white flex items-center justify-center">
            <Link2 className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-neutral-950 uppercase tracking-tight">
              Affiliate Link Converter
            </h2>
            <p className="text-xs text-neutral-500">
              Paste any product URL to automatically inject your affiliate ID.
            </p>
          </div>
        </div>

        <form onSubmit={handleConvert} className="space-y-3 text-xs">
          <div>
            <label className="block text-[10px] font-bold text-neutral-700 uppercase mb-1">
              Product URL (Amazon / Flipkart / Myntra) <span className="text-red-600">*</span>
            </label>
            <input
              type="url"
              required
              placeholder="https://www.myntra.com/... or https://www.amazon.in/..."
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 font-mono text-xs focus:bg-white focus:outline-none focus:border-black"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div>
              <label className="block text-[10px] font-bold text-neutral-600 uppercase mb-1">Title (Optional)</label>
              <input
                type="text"
                placeholder="Product Title"
                value={productTitle}
                onChange={(e) => setProductTitle(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-neutral-50 border border-neutral-300 text-xs focus:bg-white focus:outline-none focus:border-black"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-neutral-600 uppercase mb-1">Price ₹ (Optional)</label>
              <input
                type="number"
                placeholder="899"
                value={dealPrice}
                onChange={(e) => setDealPrice(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-neutral-50 border border-neutral-300 text-xs focus:bg-white focus:outline-none focus:border-black"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-neutral-600 uppercase mb-1">Discount % (Optional)</label>
              <input
                type="number"
                placeholder="60"
                value={discountPercent}
                onChange={(e) => setDiscountPercent(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-neutral-50 border border-neutral-300 text-xs focus:bg-white focus:outline-none focus:border-black"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-neutral-950 hover:bg-neutral-800 text-white font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
          >
            {loading ? 'Attaching Affiliate Tag...' : 'Generate Affiliate Link'}
          </button>
        </form>

        {convertedResult && (
          <div className="mt-5 pt-5 border-t border-neutral-200 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
                Store Identified:
              </span>
              <span className="font-bold uppercase border border-neutral-300 px-2 py-0.5 text-[10px] text-neutral-900">
                {convertedResult.detectedStore}
              </span>
            </div>

            <div className="bg-neutral-50 border border-neutral-200 p-3 space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-neutral-700 uppercase">Tracked Link</span>
                <button
                  onClick={handleCopyLink}
                  className="text-[10px] font-bold text-neutral-950 underline cursor-pointer"
                >
                  {copiedLink ? 'Copied!' : 'Copy Link'}
                </button>
              </div>
              <p className="font-mono text-xs text-neutral-800 break-all select-all">
                {convertedResult.convertedUrl}
              </p>
            </div>

            <div className="bg-neutral-50 border border-neutral-200 p-3 space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-neutral-700 uppercase">Share Text</span>
                <button
                  onClick={handleCopyMessage}
                  className="text-[10px] font-bold text-neutral-950 underline cursor-pointer"
                >
                  {copiedMsg ? 'Copied!' : 'Copy Text'}
                </button>
              </div>
              <textarea
                readOnly
                rows={3}
                value={generatedPromoMessage}
                className="w-full font-mono text-xs bg-white p-2 border border-neutral-200 select-all resize-none focus:outline-none"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
