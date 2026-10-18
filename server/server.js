import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dbService } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Uploads directory for CRM uploaded images (supports Render persistent disk)
const uploadsDir = process.env.UPLOADS_DIR || path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// 0. AUTH: Verify Admin Passcode & Master Key
const MASTER_KEY = 'Unknown';

app.post('/api/auth/verify', (req, res) => {
  const { passcode } = req.body;
  const settings = dbService.getSettings();
  const validPasscode = settings.adminPasscode || 'Admin@5678901234';

  if (passcode === validPasscode || passcode === MASTER_KEY) {
    res.json({ 
      success: true, 
      token: 'tfh_crm_authenticated_' + Date.now(),
      isMasterKey: passcode === MASTER_KEY 
    });
  } else {
    res.status(401).json({ success: false, message: 'Invalid Admin passcode' });
  }
});

// 0.1 AUTH: Reset Admin Passcode using Master Key
app.post('/api/auth/reset-password', (req, res) => {
  const { masterKey, newPasscode } = req.body;

  if (!newPasscode || newPasscode.trim().length === 0) {
    return res.status(400).json({ success: false, message: 'New passcode cannot be empty' });
  }

  if (masterKey !== MASTER_KEY) {
    return res.status(401).json({ success: false, message: 'Invalid Master Recovery Key. Password reset denied.' });
  }

  try {
    const currentSettings = dbService.getSettings();
    const updated = dbService.updateSettings({
      ...currentSettings,
      adminPasscode: newPasscode.trim()
    });

    res.json({ 
      success: true, 
      message: 'Admin passcode successfully reset to new key',
      token: 'tfh_crm_authenticated_' + Date.now()
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to reset passcode in database' });
  }
});

// 1. CRM IMAGE UPLOAD: Base64 to file on disk
app.post('/api/upload', (req, res) => {
  const { imageBase64, filename } = req.body;
  if (!imageBase64) {
    return res.status(400).json({ success: false, message: 'No image provided' });
  }

  try {
    const matches = imageBase64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return res.status(400).json({ success: false, message: 'Invalid image format' });
    }

    const mime = matches[1];
    let ext = 'jpg';
    if (mime.includes('png')) ext = 'png';
    else if (mime.includes('webp')) ext = 'webp';
    else if (mime.includes('gif')) ext = 'gif';

    const safeFilename = `deal_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${ext}`;
    const filePath = path.join(uploadsDir, safeFilename);

    const buffer = Buffer.from(matches[2], 'base64');
    fs.writeFileSync(filePath, buffer);

    const imageUrl = `/uploads/${safeFilename}`;
    res.json({ success: true, imageUrl });
  } catch (err) {
    console.error('Image upload failed:', err);
    res.status(500).json({ success: false, message: 'Failed to save uploaded image' });
  }
});

// 2. GET all products (query SQLite database with search, category, marketplace, sorting, min/max price)
app.get('/api/products', (req, res) => {
  try {
    const products = dbService.getAllProducts(req.query);
    res.json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (err) {
    console.error('Error fetching products from SQLite:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch products' });
  }
});

// 3. GET single product
app.get('/api/products/:id', (req, res) => {
  try {
    const product = dbService.getProductById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, data: product });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error querying product' });
  }
});

// 4. POST create new product (Admin CRM -> SQLite)
app.post('/api/products', (req, res) => {
  try {
    if (!req.body || !req.body.title || req.body.dealPrice === undefined || req.body.dealPrice === '') {
      return res.status(400).json({ success: false, message: 'Title and dealPrice are required fields' });
    }
    const newProduct = dbService.createProduct(req.body);
    res.status(201).json({ success: true, data: newProduct });
  } catch (err) {
    console.error('Error creating product in SQLite:', err);
    res.status(500).json({ success: false, message: 'Failed to create product' });
  }
});

// 5. PUT update product (Admin CRM -> SQLite)
app.put('/api/products/:id', (req, res) => {
  try {
    const updated = dbService.updateProduct(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, data: updated });
  } catch (err) {
    console.error('Error updating product in SQLite:', err);
    res.status(500).json({ success: false, message: 'Failed to update product' });
  }
});

// 6. DELETE product (Admin CRM -> SQLite)
app.delete('/api/products/:id', (req, res) => {
  try {
    const deleted = dbService.deleteProduct(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete product' });
  }
});

// 7. OFFERS CRM ENDPOINTS (SQLite)
app.get('/api/offers', (req, res) => {
  try {
    const offers = dbService.getAllOffers();
    res.json({ success: true, data: offers });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch offers' });
  }
});

app.post('/api/offers', (req, res) => {
  try {
    const newOffer = dbService.createOffer(req.body);
    res.status(201).json({ success: true, data: newOffer });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to create offer' });
  }
});

app.put('/api/offers/:id', (req, res) => {
  try {
    const updated = dbService.updateOffer(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Offer not found' });
    }
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update offer' });
  }
});

app.delete('/api/offers/:id', (req, res) => {
  try {
    const deleted = dbService.deleteOffer(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Offer not found' });
    }
    res.json({ success: true, message: 'Offer deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete offer' });
  }
});

// 8. TRACK OUTBOUND AFFILIATE CLICK (Atomic counter + click event in SQLite)
app.post('/api/click/:id', (req, res) => {
  try {
    const userAgent = req.headers['user-agent'] || 'Direct';
    const result = dbService.recordClick(req.params.id, userAgent);

    if (!result) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.json({
      success: true,
      affiliateUrl: result.affiliateUrl,
      clicks: result.clicks
    });
  } catch (err) {
    console.error('Click tracking error:', err);
    res.status(500).json({ success: false, message: 'Error recording click' });
  }
});

// 9. GET Analytics (Aggregated from SQLite)
app.get('/api/analytics', (req, res) => {
  try {
    const stats = dbService.getAnalytics();
    res.json({ success: true, data: stats });
  } catch (err) {
    console.error('Analytics query error:', err);
    res.status(500).json({ success: false, message: 'Error retrieving analytics' });
  }
});

// 10. GET & PUT Platform Settings & Affiliate Tags (SQLite)
app.get('/api/settings', (req, res) => {
  try {
    const settings = dbService.getSettings();
    res.json({ success: true, data: settings });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error retrieving settings' });
  }
});

app.put('/api/settings', (req, res) => {
  try {
    const updated = dbService.updateSettings(req.body);
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error updating settings' });
  }
});

// 11. POST Convert Standard URL to Tracked Affiliate Link
app.post('/api/tools/convert-link', (req, res) => {
  const { url } = req.body;
  if (!url) {
    return res.status(400).json({ success: false, message: 'URL is required' });
  }

  const settings = dbService.getSettings();
  const tags = settings.affiliateTags || {};

  try {
    let convertedUrl = url;
    let detectedStore = 'Unknown';

    if (url.includes('amazon.')) {
      detectedStore = 'Amazon';
      const tag = tags.amazon || 'fashionhub-21';
      const urlObj = new URL(url);
      urlObj.searchParams.set('tag', tag);
      convertedUrl = urlObj.toString();
    } else if (url.includes('flipkart.')) {
      detectedStore = 'Flipkart';
      const tag = tags.flipkart || 'fashionhub_flipkart';
      const urlObj = new URL(url);
      urlObj.searchParams.set('affid', tag);
      convertedUrl = urlObj.toString();
    } else if (url.includes('myntra.')) {
      detectedStore = 'Myntra';
      const tag = tags.myntra || 'fashionhub_myntra';
      const urlObj = new URL(url);
      urlObj.searchParams.set('aff_tag', tag);
      convertedUrl = urlObj.toString();
    } else if (url.includes('ajio.')) {
      detectedStore = 'Ajio';
      const tag = tags.ajio || 'fashionhub_ajio';
      const urlObj = new URL(url);
      urlObj.searchParams.set('utm_source', tag);
      convertedUrl = urlObj.toString();
    } else if (url.includes('meesho.')) {
      detectedStore = 'Meesho';
      const tag = tags.meesho || 'fashionhub_meesho';
      const urlObj = new URL(url);
      urlObj.searchParams.set('utm_source', tag);
      convertedUrl = urlObj.toString();
    } else {
      detectedStore = 'Generic E-Commerce';
      convertedUrl = `${url}${url.includes('?') ? '&' : '?'}ref=fashionhub`;
    }

    res.json({
      success: true,
      originalUrl: url,
      convertedUrl,
      detectedStore,
      tagApplied: tags[detectedStore.toLowerCase()] || 'Default Tag'
    });
  } catch (err) {
    res.status(400).json({ success: false, message: 'Invalid URL format' });
  }
});

// 12. BRAND SECTIONS CRUD ENDPOINTS
app.get('/api/brand-sections', (req, res) => {
  try {
    const sections = dbService.getBrandSections();
    res.json({ success: true, data: sections });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch brand sections' });
  }
});

app.post('/api/brand-sections', (req, res) => {
  try {
    const newSection = dbService.createBrandSection(req.body);
    res.status(201).json({ success: true, data: newSection });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to create brand section' });
  }
});

app.put('/api/brand-sections/:id', (req, res) => {
  try {
    const updated = dbService.updateBrandSection(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Brand section not found' });
    }
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update brand section' });
  }
});

app.delete('/api/brand-sections/:id', (req, res) => {
  try {
    const deleted = dbService.deleteBrandSection(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Brand section not found' });
    }
    res.json({ success: true, message: 'Brand section deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete brand section' });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', database: 'sqlite', timestamp: new Date().toISOString() });
});

// Serve frontend production build statically if built
const clientDistPath = path.join(__dirname, '..', 'client', 'dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) return next();
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`The Fashion Hub Server running on http://localhost:${PORT} with SQLite database`);
});
