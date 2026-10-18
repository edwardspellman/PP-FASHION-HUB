import { DatabaseSync } from 'node:sqlite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Support Render persistent disk via DATA_DIR or default to local data folder
const dataDir = process.env.DATA_DIR || path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'fashionhub.db');
const db = new DatabaseSync(dbPath);

// Enable WAL mode for high concurrent read/write performance
db.exec('PRAGMA journal_mode = WAL;');

// Initialize Tables
db.exec(`
  CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    brand TEXT NOT NULL,
    category TEXT NOT NULL,
    subCategory TEXT,
    marketplace TEXT NOT NULL,
    originalPrice REAL NOT NULL,
    dealPrice REAL NOT NULL,
    discountPercent INTEGER NOT NULL,
    rating REAL DEFAULT 4.5,
    reviewsCount INTEGER DEFAULT 120,
    imageUrl TEXT NOT NULL,
    affiliateUrl TEXT NOT NULL,
    couponCode TEXT,
    couponDiscount TEXT,
    badge TEXT DEFAULT 'HOT DEAL',
    isFeatured INTEGER DEFAULT 1,
    isDealOfTheDay INTEGER DEFAULT 0,
    inStock INTEGER DEFAULT 1,
    description TEXT,
    clicks INTEGER DEFAULT 0,
    createdAt TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS offers (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    store TEXT NOT NULL,
    badge TEXT DEFAULT 'HOT OFFER',
    discount TEXT NOT NULL,
    couponCode TEXT,
    validTill TEXT,
    affiliateUrl TEXT,
    isActive INTEGER DEFAULT 1,
    description TEXT,
    createdAt TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS brand_sections (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    brandOrStore TEXT NOT NULL,
    type TEXT DEFAULT 'brand',
    subtitle TEXT,
    badge TEXT,
    minDiscount TEXT DEFAULT '',
    isActive INTEGER DEFAULT 1,
    sortOrder INTEGER DEFAULT 0,
    createdAt TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS clicks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    productId TEXT NOT NULL,
    productTitle TEXT NOT NULL,
    marketplace TEXT NOT NULL,
    dealPrice REAL NOT NULL,
    timestamp TEXT NOT NULL,
    userAgent TEXT
  );
`);

// Auto-migration from existing JSON files into SQLite
function migrateFromLegacyJson() {
  // 1. Products Migration
  const productCount = db.prepare('SELECT COUNT(*) as count FROM products').get().count;
  if (productCount === 0) {
    const productsJsonPath = path.join(dataDir, 'products.json');
    if (fs.existsSync(productsJsonPath)) {
      try {
        const legacyProducts = JSON.parse(fs.readFileSync(productsJsonPath, 'utf-8'));
        const insertStmt = db.prepare(`
          INSERT INTO products (
            id, title, brand, category, subCategory, marketplace,
            originalPrice, dealPrice, discountPercent, rating, reviewsCount,
            imageUrl, affiliateUrl, couponCode, couponDiscount, badge,
            isFeatured, isDealOfTheDay, inStock, description, clicks, createdAt
          ) VALUES (
            ?, ?, ?, ?, ?, ?,
            ?, ?, ?, ?, ?,
            ?, ?, ?, ?, ?,
            ?, ?, ?, ?, ?, ?
          )
        `);

        for (const p of legacyProducts) {
          insertStmt.run(
            p.id,
            p.title || 'Untitled Deal',
            p.brand || 'Generic',
            p.category || 'Women',
            p.subCategory || '',
            p.marketplace || 'Myntra',
            Number(p.originalPrice) || 0,
            Number(p.dealPrice) || 0,
            Number(p.discountPercent) || 0,
            Number(p.rating) || 4.5,
            Number(p.reviewsCount) || 120,
            p.imageUrl || '',
            p.affiliateUrl || '#',
            p.couponCode || '',
            p.couponDiscount || '',
            p.badge || 'HOT DEAL',
            p.isFeatured ? 1 : 0,
            p.isDealOfTheDay ? 1 : 0,
            p.inStock !== false ? 1 : 0,
            p.description || '',
            Number(p.clicks) || 0,
            p.createdAt || new Date().toISOString()
          );
        }
        console.log(`[SQLite Migration] Migrated ${legacyProducts.length} products into fashionhub.db`);
      } catch (err) {
        console.error('[SQLite Migration] Error migrating products.json:', err);
      }
    }
  }

  // 2. Offers Migration
  const offerCount = db.prepare('SELECT COUNT(*) as count FROM offers').get().count;
  if (offerCount === 0) {
    const offersJsonPath = path.join(dataDir, 'offers.json');
    if (fs.existsSync(offersJsonPath)) {
      try {
        const legacyOffers = JSON.parse(fs.readFileSync(offersJsonPath, 'utf-8'));
        const insertOffer = db.prepare(`
          INSERT INTO offers (
            id, title, store, badge, discount, couponCode, validTill,
            affiliateUrl, isActive, description, createdAt
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        for (const o of legacyOffers) {
          insertOffer.run(
            o.id,
            o.title || '',
            o.store || 'Myntra',
            o.badge || 'HOT OFFER',
            o.discount || '',
            o.couponCode || '',
            o.validTill || '',
            o.affiliateUrl || '',
            o.isActive !== false ? 1 : 0,
            o.description || '',
            o.createdAt || new Date().toISOString()
          );
        }
        console.log(`[SQLite Migration] Migrated ${legacyOffers.length} offers into fashionhub.db`);
      } catch (err) {
        console.error('[SQLite Migration] Error migrating offers.json:', err);
      }
    }
  }

  // 3. Settings Migration
  const settingsCount = db.prepare('SELECT COUNT(*) as count FROM settings').get().count;
  if (settingsCount === 0) {
    const settingsJsonPath = path.join(dataDir, 'settings.json');
    let settingsData = {
      siteName: 'PP Fashion Hub',
      tagline: "India's Curated Fashion Deals & Affiliate Storefront",
      telegramChannel: 'https://t.me/FashionHubDeals',
      whatsappGroup: 'https://chat.whatsapp.com/sampleInviteLink',
      adminPasscode: 'Admin@5678901234',
      announcementText: 'Flat up to 80% Off on Myntra, Flipkart & Amazon Top Fashion Brands! Verified Coupons inside.',
      affiliateTags: {
        amazon: 'fashionhub-21',
        flipkart: 'fashionhub_flipkart',
        myntra: 'fashionhub_myntra',
        ajio: 'fashionhub_ajio'
      }
    };

    if (fs.existsSync(settingsJsonPath)) {
      try {
        const parsed = JSON.parse(fs.readFileSync(settingsJsonPath, 'utf-8'));
        settingsData = { ...settingsData, ...parsed };
      } catch (e) {}
    }

    const insertSetting = db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)');
    insertSetting.run('platform_config', JSON.stringify(settingsData));
    console.log('[SQLite Migration] Migrated settings into fashionhub.db');
  }

  // 4. Analytics Clicks Migration
  const clicksCount = db.prepare('SELECT COUNT(*) as count FROM clicks').get().count;
  if (clicksCount === 0) {
    const analyticsJsonPath = path.join(dataDir, 'analytics.json');
    if (fs.existsSync(analyticsJsonPath)) {
      try {
        const parsed = JSON.parse(fs.readFileSync(analyticsJsonPath, 'utf-8'));
        const insertClick = db.prepare(`
          INSERT INTO clicks (productId, productTitle, marketplace, dealPrice, timestamp, userAgent)
          VALUES (?, ?, ?, ?, ?, ?)
        `);
        for (const c of (parsed.recentClicks || [])) {
          insertClick.run(
            c.productId || '',
            c.productTitle || '',
            c.marketplace || 'Myntra',
            Number(c.dealPrice) || 0,
            c.timestamp || new Date().toISOString(),
            c.userAgent || 'Direct'
          );
        }
      } catch (e) {}
    }
  }

  // 5. Seed Meesho Products if none exist
  try {
    const meeshoCount = db.prepare("SELECT COUNT(*) as count FROM products WHERE marketplace = 'Meesho'").get().count;
    if (meeshoCount === 0) {
      const insertProd = db.prepare(`
        INSERT INTO products (
          id, title, brand, category, subCategory, marketplace, originalPrice, dealPrice,
          discountPercent, rating, reviewsCount, imageUrl, affiliateUrl, couponCode, couponDiscount,
          badge, isFeatured, isDealOfTheDay, inStock, description, clicks, createdAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      insertProd.run(
        'meesho_prod_1',
        'Anarkali Printed Rayon Kurta with Pant & Dupatta Set',
        'Adiva',
        'Women',
        'Ethnic Wear',
        'Meesho',
        1599,
        449,
        72,
        4.6,
        2180,
        'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80',
        'https://www.meesho.com/ethnic-wear/p/1?utm_source=fashionhub_meesho',
        'MEESHO100',
        'Extra ₹100 Off',
        'BESTSELLER',
        1,
        1,
        1,
        'Premium breathable rayon fabric with intricate foil print. Perfect for casual festive celebrations and daily comfort.',
        42,
        new Date().toISOString()
      );

      insertProd.run(
        'meesho_prod_2',
        'Kanjivaram Style Soft Silk Saree with Rich Zari Blouse Piece',
        'Vardhman',
        'Women',
        'Ethnic Wear',
        'Meesho',
        2499,
        649,
        74,
        4.7,
        1420,
        'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
        'https://www.meesho.com/sarees/p/2?utm_source=fashionhub_meesho',
        'SILK50',
        'Flat ₹50 Off',
        'HOT DEAL',
        1,
        0,
        1,
        'Traditional woven golden zari border with matching blouse piece. Feather-light drape with premium gloss finish.',
        35,
        new Date().toISOString()
      );

      insertProd.run(
        'meesho_prod_3',
        "Men's Casual Spread Collar Cotton Blend Checks Shirt",
        'Dennis Lingo',
        'Men',
        'Casual Wear',
        'Meesho',
        1299,
        389,
        70,
        4.4,
        890,
        'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80',
        'https://www.meesho.com/men-shirts/p/3?utm_source=fashionhub_meesho',
        'SHIRT40',
        'Flat ₹40 Off',
        'BUDGET PICK',
        1,
        0,
        1,
        'Pre-washed breathable cotton blend check shirt. Ideal for college, office casuals, and weekend outings.',
        19,
        new Date().toISOString()
      );

      insertProd.run(
        'meesho_prod_4',
        'Unisex Tokyo Street Oversized Graphic Drop-Shoulder T-Shirt',
        'Bonkers',
        'Men',
        'Streetwear',
        'Meesho',
        999,
        299,
        70,
        4.5,
        1120,
        'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=800&q=80',
        'https://www.meesho.com/streetwear/p/4?utm_source=fashionhub_meesho',
        'DROP20',
        'Extra 10% Off',
        'TRENDING',
        1,
        0,
        1,
        '220 GSM heavyweight combed cotton with anime-inspired back print. Relaxed streetwear silhouette.',
        28,
        new Date().toISOString()
      );
    }
  } catch (err) {
    console.error('Error seeding Meesho products:', err);
  }

  // 6. Seed Default Custom Brand Sections if none exist
  try {
    const brandSectionsCount = db.prepare('SELECT COUNT(*) as count FROM brand_sections').get().count;
    if (brandSectionsCount === 0) {
      const insertSection = db.prepare(`
        INSERT INTO brand_sections (
          id, title, brandOrStore, type, subtitle, badge, minDiscount, isActive, sortOrder, createdAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      insertSection.run(
        'sec_meesho_budget',
        'Meesho Viral Budget Drops',
        'Meesho',
        'marketplace',
        'Trending kurtas, ethnic sets & everyday essentials directly from verified manufacturers',
        'UNDER ₹499',
        '50',
        1,
        1,
        new Date().toISOString()
      );

      insertSection.run(
        'sec_roadster_casuals',
        'Roadster Denim & Streetwear',
        'Roadster',
        'brand',
        'Everyday rugged denim, oversized casuals and urban shirts with verified discounts',
        'FLAT 60%+ OFF',
        '60',
        1,
        2,
        new Date().toISOString()
      );
    }
  } catch (err) {
    console.error('Error seeding brand sections:', err);
  }

  // 7. Ensure Settings contains Meesho Affiliate Tag
  try {
    const row = db.prepare('SELECT value FROM settings WHERE key = ?').get('platform_config');
    if (row) {
      const cfg = JSON.parse(row.value);
      if (!cfg.affiliateTags || !cfg.affiliateTags.meesho) {
        cfg.affiliateTags = {
          ...cfg.affiliateTags,
          meesho: 'fashionhub_meesho'
        };
        db.prepare('UPDATE settings SET value = ? WHERE key = ?').run(JSON.stringify(cfg), 'platform_config');
      }
    }
  } catch (err) {}
}

migrateFromLegacyJson();

// Helper to format product row from SQLite to JS object with booleans
const DEFAULT_PRODUCT_IMAGE = 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80';

function formatProduct(row) {
  if (!row) return null;
  return {
    ...row,
    imageUrl: (row.imageUrl && row.imageUrl.trim()) ? row.imageUrl : DEFAULT_PRODUCT_IMAGE,
    isFeatured: Boolean(row.isFeatured),
    isDealOfTheDay: Boolean(row.isDealOfTheDay),
    inStock: Boolean(row.inStock)
  };
}

function formatOffer(row) {
  if (!row) return null;
  return {
    ...row,
    isActive: Boolean(row.isActive)
  };
}

function formatBrandSection(row) {
  if (!row) return null;
  return {
    ...row,
    isActive: Boolean(row.isActive)
  };
}

// DAO Methods
export const dbService = {
  // 1. PRODUCTS
  getAllProducts(query = {}) {
    const sort = query.sort || query.sortBy;
    const { category, marketplace, search, maxPrice, minDiscount, featured } = query;
    let sql = 'SELECT * FROM products WHERE 1=1';
    const params = [];

    if (category && category !== 'All') {
      sql += ' AND LOWER(category) = LOWER(?)';
      params.push(category);
    }

    if (marketplace && marketplace !== 'All') {
      sql += ' AND LOWER(marketplace) = LOWER(?)';
      params.push(marketplace);
    }

    if (search && search.trim()) {
      const q = `%${search.trim().toLowerCase()}%`;
      sql += ' AND (LOWER(title) LIKE ? OR LOWER(brand) LIKE ? OR LOWER(category) LIKE ? OR LOWER(subCategory) LIKE ?)';
      params.push(q, q, q, q);
    }

    if (maxPrice) {
      sql += ' AND dealPrice <= ?';
      params.push(Number(maxPrice));
    }

    if (minDiscount) {
      sql += ' AND discountPercent >= ?';
      params.push(Number(minDiscount));
    }

    if (featured === 'true') {
      sql += ' AND isFeatured = 1';
    }

    // Sorting
    if (sort === 'price-low' || sort === 'price_low') {
      sql += ' ORDER BY dealPrice ASC';
    } else if (sort === 'price-high' || sort === 'price_high') {
      sql += ' ORDER BY dealPrice DESC';
    } else if (sort === 'discount-high' || sort === 'discount_high') {
      sql += ' ORDER BY discountPercent DESC';
    } else if (sort === 'popular') {
      sql += ' ORDER BY clicks DESC';
    } else {
      sql += ' ORDER BY isFeatured DESC, isDealOfTheDay DESC, createdAt DESC';
    }

    const rows = db.prepare(sql).all(...params);
    return rows.map(formatProduct);
  },

  getProductById(id) {
    const row = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
    return formatProduct(row);
  },

  createProduct(data) {
    const originalPrice = Number(data.originalPrice) || 0;
    const dealPrice = Number(data.dealPrice) || 0;
    const discountPercent = originalPrice > 0 && dealPrice > 0
      ? Math.round(((originalPrice - dealPrice) / originalPrice) * 100)
      : Number(data.discountPercent) || 0;

    const newProduct = {
      id: `prod-${Date.now()}`,
      title: data.title || 'Untitled Deal',
      brand: data.brand || 'Generic',
      category: data.category || 'Women',
      subCategory: data.subCategory || 'Fashion',
      marketplace: data.marketplace || 'Myntra',
      originalPrice,
      dealPrice,
      discountPercent,
      rating: Number(data.rating) || 4.5,
      reviewsCount: Number(data.reviewsCount) || 120,
      imageUrl: data.imageUrl || 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80',
      affiliateUrl: data.affiliateUrl || '#',
      couponCode: data.couponCode || '',
      couponDiscount: data.couponDiscount || '',
      badge: data.badge || 'HOT DEAL',
      isFeatured: data.isFeatured !== false ? 1 : 0,
      isDealOfTheDay: data.isDealOfTheDay ? 1 : 0,
      inStock: data.inStock !== false ? 1 : 0,
      description: data.description || '',
      clicks: 0,
      createdAt: new Date().toISOString()
    };

    const stmt = db.prepare(`
      INSERT INTO products (
        id, title, brand, category, subCategory, marketplace,
        originalPrice, dealPrice, discountPercent, rating, reviewsCount,
        imageUrl, affiliateUrl, couponCode, couponDiscount, badge,
        isFeatured, isDealOfTheDay, inStock, description, clicks, createdAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      newProduct.id,
      newProduct.title,
      newProduct.brand,
      newProduct.category,
      newProduct.subCategory,
      newProduct.marketplace,
      newProduct.originalPrice,
      newProduct.dealPrice,
      newProduct.discountPercent,
      newProduct.rating,
      newProduct.reviewsCount,
      newProduct.imageUrl,
      newProduct.affiliateUrl,
      newProduct.couponCode,
      newProduct.couponDiscount,
      newProduct.badge,
      newProduct.isFeatured,
      newProduct.isDealOfTheDay,
      newProduct.inStock,
      newProduct.description,
      newProduct.clicks,
      newProduct.createdAt
    );

    return formatProduct(newProduct);
  },

  updateProduct(id, updates) {
    const current = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
    if (!current) return null;

    const originalPrice = updates.originalPrice !== undefined ? Number(updates.originalPrice) : current.originalPrice;
    const dealPrice = updates.dealPrice !== undefined ? Number(updates.dealPrice) : current.dealPrice;
    const discountPercent = originalPrice > 0 && dealPrice > 0
      ? Math.round(((originalPrice - dealPrice) / originalPrice) * 100)
      : (updates.discountPercent !== undefined ? Number(updates.discountPercent) : current.discountPercent);

    const merged = {
      title: updates.title !== undefined ? updates.title : current.title,
      brand: updates.brand !== undefined ? updates.brand : current.brand,
      category: updates.category !== undefined ? updates.category : current.category,
      subCategory: updates.subCategory !== undefined ? updates.subCategory : current.subCategory,
      marketplace: updates.marketplace !== undefined ? updates.marketplace : current.marketplace,
      originalPrice,
      dealPrice,
      discountPercent,
      rating: updates.rating !== undefined ? Number(updates.rating) : current.rating,
      reviewsCount: updates.reviewsCount !== undefined ? Number(updates.reviewsCount) : current.reviewsCount,
      imageUrl: updates.imageUrl !== undefined ? updates.imageUrl : current.imageUrl,
      affiliateUrl: updates.affiliateUrl !== undefined ? updates.affiliateUrl : current.affiliateUrl,
      couponCode: updates.couponCode !== undefined ? updates.couponCode : current.couponCode,
      couponDiscount: updates.couponDiscount !== undefined ? updates.couponDiscount : current.couponDiscount,
      badge: updates.badge !== undefined ? updates.badge : current.badge,
      isFeatured: updates.isFeatured !== undefined ? (updates.isFeatured ? 1 : 0) : current.isFeatured,
      isDealOfTheDay: updates.isDealOfTheDay !== undefined ? (updates.isDealOfTheDay ? 1 : 0) : current.isDealOfTheDay,
      inStock: updates.inStock !== undefined ? (updates.inStock ? 1 : 0) : current.inStock,
      description: updates.description !== undefined ? updates.description : current.description,
      clicks: updates.clicks !== undefined ? Number(updates.clicks) : current.clicks
    };

    const stmt = db.prepare(`
      UPDATE products SET
        title = ?, brand = ?, category = ?, subCategory = ?, marketplace = ?,
        originalPrice = ?, dealPrice = ?, discountPercent = ?, rating = ?, reviewsCount = ?,
        imageUrl = ?, affiliateUrl = ?, couponCode = ?, couponDiscount = ?, badge = ?,
        isFeatured = ?, isDealOfTheDay = ?, inStock = ?, description = ?, clicks = ?
      WHERE id = ?
    `);

    stmt.run(
      merged.title,
      merged.brand,
      merged.category,
      merged.subCategory,
      merged.marketplace,
      merged.originalPrice,
      merged.dealPrice,
      merged.discountPercent,
      merged.rating,
      merged.reviewsCount,
      merged.imageUrl,
      merged.affiliateUrl,
      merged.couponCode,
      merged.couponDiscount,
      merged.badge,
      merged.isFeatured,
      merged.isDealOfTheDay,
      merged.inStock,
      merged.description,
      merged.clicks,
      id
    );

    return this.getProductById(id);
  },

  deleteProduct(id) {
    const stmt = db.prepare('DELETE FROM products WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  },

  // 2. CLICK TRACKING & TELEMETRY
  recordClick(productId, userAgent = 'Direct') {
    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(productId);
    if (!product) return null;

    // Increment click count atomically
    db.prepare('UPDATE products SET clicks = clicks + 1 WHERE id = ?').run(productId);

    // Insert click event log
    const now = new Date().toISOString();
    db.prepare(`
      INSERT INTO clicks (productId, productTitle, marketplace, dealPrice, timestamp, userAgent)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      product.id,
      product.title,
      product.marketplace,
      product.dealPrice,
      now,
      userAgent
    );

    return {
      affiliateUrl: product.affiliateUrl,
      clicks: product.clicks + 1
    };
  },

  getAnalytics() {
    const totalProducts = db.prepare('SELECT COUNT(*) as count FROM products').get().count;
    const totalClicks = db.prepare('SELECT COUNT(*) as count FROM clicks').get().count;

    // Estimated earnings: sum of ~7% of dealPrice for all clicks
    const sumResult = db.prepare('SELECT SUM(dealPrice) as totalDealVolume FROM clicks').get();
    const totalVolume = sumResult.totalDealVolume || 0;
    const estimatedEarnings = Math.round(totalVolume * 0.07);

    // Marketplace breakdown
    const marketplaceRows = db.prepare(`
      SELECT marketplace, COUNT(*) as count
      FROM clicks
      GROUP BY marketplace
    `).all();

    const marketplaceClicks = {};
    for (const row of marketplaceRows) {
      marketplaceClicks[row.marketplace] = row.count;
    }

    // Top 5 products
    const topProducts = db.prepare(`
      SELECT id, title, marketplace, dealPrice, clicks, imageUrl
      FROM products
      ORDER BY clicks DESC
      LIMIT 5
    `).all();

    // Recent 20 clicks
    const recentClicks = db.prepare(`
      SELECT productId, productTitle, marketplace, dealPrice, timestamp, userAgent
      FROM clicks
      ORDER BY id DESC
      LIMIT 20
    `).all();

    return {
      totalProducts,
      totalClicks,
      estimatedEarnings,
      marketplaceClicks,
      topProducts,
      recentClicks
    };
  },

  // 3. OFFERS
  getAllOffers() {
    const rows = db.prepare('SELECT * FROM offers ORDER BY createdAt DESC').all();
    return rows.map(formatOffer);
  },

  createOffer(data) {
    const newOffer = {
      id: `offer-${Date.now()}`,
      title: data.title || 'Special Deal Campaign',
      store: data.store || 'Myntra',
      badge: data.badge || 'HOT OFFER',
      discount: data.discount || 'Flat 50% Off',
      couponCode: data.couponCode || '',
      validTill: data.validTill || 'Limited Period',
      affiliateUrl: data.affiliateUrl || '',
      isActive: data.isActive !== false ? 1 : 0,
      description: data.description || '',
      createdAt: new Date().toISOString()
    };

    db.prepare(`
      INSERT INTO offers (id, title, store, badge, discount, couponCode, validTill, affiliateUrl, isActive, description, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      newOffer.id,
      newOffer.title,
      newOffer.store,
      newOffer.badge,
      newOffer.discount,
      newOffer.couponCode,
      newOffer.validTill,
      newOffer.affiliateUrl,
      newOffer.isActive,
      newOffer.description,
      newOffer.createdAt
    );

    return formatOffer(newOffer);
  },

  updateOffer(id, updates) {
    const current = db.prepare('SELECT * FROM offers WHERE id = ?').get(id);
    if (!current) return null;

    const merged = {
      title: updates.title !== undefined ? updates.title : current.title,
      store: updates.store !== undefined ? updates.store : current.store,
      badge: updates.badge !== undefined ? updates.badge : current.badge,
      discount: updates.discount !== undefined ? updates.discount : current.discount,
      couponCode: updates.couponCode !== undefined ? updates.couponCode : current.couponCode,
      validTill: updates.validTill !== undefined ? updates.validTill : current.validTill,
      affiliateUrl: updates.affiliateUrl !== undefined ? updates.affiliateUrl : current.affiliateUrl,
      isActive: updates.isActive !== undefined ? (updates.isActive ? 1 : 0) : current.isActive,
      description: updates.description !== undefined ? updates.description : current.description
    };

    db.prepare(`
      UPDATE offers SET
        title = ?, store = ?, badge = ?, discount = ?, couponCode = ?,
        validTill = ?, affiliateUrl = ?, isActive = ?, description = ?
      WHERE id = ?
    `).run(
      merged.title,
      merged.store,
      merged.badge,
      merged.discount,
      merged.couponCode,
      merged.validTill,
      merged.affiliateUrl,
      merged.isActive,
      merged.description,
      id
    );

    const updated = db.prepare('SELECT * FROM offers WHERE id = ?').get(id);
    return formatOffer(updated);
  },

  deleteOffer(id) {
    const res = db.prepare('DELETE FROM offers WHERE id = ?').run(id);
    return res.changes > 0;
  },

  // 4. SETTINGS
  getSettings() {
    const row = db.prepare('SELECT value FROM settings WHERE key = ?').get('platform_config');
    if (!row) return {};
    try {
      return JSON.parse(row.value);
    } catch {
      return {};
    }
  },

  updateSettings(newSettings) {
    const current = this.getSettings();
    const merged = { ...current, ...newSettings };
    const stmt = db.prepare(`
      INSERT INTO settings (key, value) VALUES ('platform_config', ?)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value
    `);
    stmt.run(JSON.stringify(merged));
    return merged;
  },

  // 5. BRAND SECTIONS
  getBrandSections() {
    const rows = db.prepare('SELECT * FROM brand_sections ORDER BY sortOrder ASC, id DESC').all();
    return rows.map(formatBrandSection);
  },

  createBrandSection(data) {
    const id = data.id || `sec_${Date.now()}`;
    const now = new Date().toISOString();
    const stmt = db.prepare(`
      INSERT INTO brand_sections (
        id, title, brandOrStore, type, subtitle, badge, minDiscount, isActive, sortOrder, createdAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      data.title || 'Brand Spotlight',
      data.brandOrStore || 'Meesho',
      data.type || 'brand',
      data.subtitle || '',
      data.badge || 'SPOTLIGHT',
      data.minDiscount || '',
      data.isActive !== undefined ? (data.isActive ? 1 : 0) : 1,
      Number(data.sortOrder) || 0,
      now
    );

    const created = db.prepare('SELECT * FROM brand_sections WHERE id = ?').get(id);
    return formatBrandSection(created);
  },

  updateBrandSection(id, updates) {
    const current = db.prepare('SELECT * FROM brand_sections WHERE id = ?').get(id);
    if (!current) return null;

    const merged = {
      title: updates.title !== undefined ? updates.title : current.title,
      brandOrStore: updates.brandOrStore !== undefined ? updates.brandOrStore : current.brandOrStore,
      type: updates.type !== undefined ? updates.type : current.type,
      subtitle: updates.subtitle !== undefined ? updates.subtitle : current.subtitle,
      badge: updates.badge !== undefined ? updates.badge : current.badge,
      minDiscount: updates.minDiscount !== undefined ? updates.minDiscount : current.minDiscount,
      isActive: updates.isActive !== undefined ? (updates.isActive ? 1 : 0) : current.isActive,
      sortOrder: updates.sortOrder !== undefined ? Number(updates.sortOrder) : current.sortOrder
    };

    db.prepare(`
      UPDATE brand_sections SET
        title = ?, brandOrStore = ?, type = ?, subtitle = ?, badge = ?,
        minDiscount = ?, isActive = ?, sortOrder = ?
      WHERE id = ?
    `).run(
      merged.title,
      merged.brandOrStore,
      merged.type,
      merged.subtitle,
      merged.badge,
      merged.minDiscount,
      merged.isActive,
      merged.sortOrder,
      id
    );

    const updated = db.prepare('SELECT * FROM brand_sections WHERE id = ?').get(id);
    return formatBrandSection(updated);
  },

  deleteBrandSection(id) {
    const res = db.prepare('DELETE FROM brand_sections WHERE id = ?').run(id);
    return res.changes > 0;
  }
};

export default db;
