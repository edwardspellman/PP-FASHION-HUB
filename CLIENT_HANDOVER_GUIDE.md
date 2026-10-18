# PP Fashion Hub - Client Handover & Operations Guide

Welcome to **PP Fashion Hub**! This document provides complete step-by-step instructions for running, operating, configuring, and deploying the platform.

---

## 1. Quick Reference & Credentials

| Resource | Value / URL | Notes |
| :--- | :--- | :--- |
| **Storefront Web App** | [http://localhost:4000](http://localhost:4000) | Public customer-facing store |
| **Admin CRM Portal** | [http://localhost:4000](http://localhost:4000) &rarr; Click **"CRM Portal"** | Top navigation bar key icon |
| **Backend REST API** | [http://localhost:5000](http://localhost:5000) | Express + SQLite backend |
| **Admin CRM Passcode** | `Admin@5678901234` | Case-sensitive |
| **Emergency Recovery Key** | `MASTER_RESET_KEY_2026_FASHION_HUB` | Used to reset forgotten passcodes |
| **Database File** | `server/data/fashionhub.db` | High-performance SQLite database |
| **Uploaded Images Folder** | `server/uploads/` | Product deal images stored on disk |

> **Production Security Note**: Before launching publicly on the internet, change the default admin passcode in the CRM Settings panel and update the master recovery key in `server/server.js`.

---

## 2. System Architecture & Prerequisites

### Technology Stack
- **Frontend**: React 19, Vite, Tailwind CSS, Lucide Icons, Dark/Light Mode theme engine.
- **Backend**: Node.js (v20+ or v22+), Express 4.21, native `node:sqlite` in WAL (Write-Ahead-Logging) mode.
- **Affiliate Engine**: Automated tag injector supporting Amazon, Flipkart, Myntra, Meesho, and Ajio.

### System Requirements
- Node.js v20.0.0 or higher
- npm v9.0.0 or higher
- Modern web browser (Chrome, Edge, Safari, Firefox)

---

## 3. Step-by-Step Installation & Startup

### Step 1: Open Project Directory
Open your terminal (PowerShell, Command Prompt, or Bash) in the project root:
```bash
cd "The Fashion Hub"
```

### Step 2: Install Dependencies (First Time Setup)
```bash
# Install backend dependencies
npm install

# Install frontend dependencies
npm --prefix client install
```

### Step 3: Start Backend API Server
```bash
node server/server.js
```
*The server will start on port `5000` and automatically verify `server/data/fashionhub.db`.*

### Step 4: Start Frontend Client Dev Server (In a New Terminal)
```bash
npm --prefix client run dev
```
*The web storefront will launch on `http://localhost:4000`.*

---

## 4. Admin CRM Portal - Step-by-Step User Guide

### How to Access the Admin Portal
1. Open [http://localhost:4000](http://localhost:4000) in your browser.
2. In the top navigation bar, click the **"CRM Portal"** button (or key icon).
3. Enter your Admin Passcode: `Admin@5678901234`.
4. Click **Verify & Enter CRM**. You are now in the administrative dashboard.

---

### Feature 1: Adding a New Fashion Deal
1. Navigate to the **"Deals Catalog"** tab in the CRM.
2. Click **"+ Add New Deal"**.
3. Fill in the deal details:
   - **Product Title**: e.g., *Men's Slim Fit Denim Jacket*.
   - **Brand**: e.g., *Roadster*, *H&M*, *Levi's*.
   - **Category**: *Men*, *Women*, *Kids*, *Footwear*, or *Accessories*.
   - **Marketplace**: *Amazon*, *Flipkart*, *Myntra*, *Meesho*, or *Ajio*.
   - **Original Price (₹)** & **Deal Price (₹)**: The system **automatically calculates the discount %**.
   - **Affiliate / Destination URL**: Paste your affiliate link or standard store link.
   - **Product Image**: Choose an image URL or click **"Upload Local Image"** to select a photo from your computer (auto-saved to `server/uploads/`).
   - **Badges & Flags**: Enable *Featured Deal*, *Deal of the Day*, or add a custom badge (e.g., `FLAT 70% OFF`).
4. Click **"Save Product Deal"**. It will appear instantly on the storefront.

---

### Feature 2: Creating Custom Brand Showcase Sections
PP Fashion Hub allows you to create custom sections on the homepage to highlight any brand or marketplace (e.g., *Zara*, *Meesho Budget Drops*, *Puma Athletics*).

1. In the CRM, click the **"Brand Sections"** tab.
2. Click **"+ Add Custom Section"**.
3. Fill in the section parameters:
   - **Section Title**: e.g., *Meesho Viral Budget Drops* or *Zara Chic Edit*.
   - **Target Brand or Marketplace**: e.g., `Meesho` or `Roadster`.
   - **Filter Type**: Choose whether to match by `Marketplace` or `Brand`.
   - **Subtitle**: Short description displayed beneath the header.
   - **Highlight Badge**: e.g., `UNDER ₹499` or `FLAT 60% OFF`.
   - **Minimum Discount Filter**: Optional minimum discount threshold (e.g. `50` for 50%+ off).
   - **Display Order**: Number indicating placement on the homepage.
4. Click **"Save Brand Section"**. The section renders immediately on the storefront.

---

### Feature 3: Managing Flash Sales & Banner Carousel
1. In the CRM, navigate to the **"Flash Offers"** tab.
2. View existing promotional banners or click **"+ Create New Banner"**.
3. Set the offer title, headline, discount percentage, banner background theme, and redirect URL.
4. Toggle active/inactive status at any time to schedule promotions for festivals or weekend sales.

---

### Feature 4: Affiliate Link Converter Tool
1. In the CRM, switch to the **"Link Tools"** tab.
2. Paste any standard product URL from Amazon, Flipkart, Myntra, or Meesho.
3. Click **"Convert Link"**.
4. The system automatically injects your affiliate tag and provides:
   - Ready-to-use monetized link.
   - One-click copy button.
   - Direct button to populate a new deal with this converted link.

---

### Feature 5: Real-time Analytics & Click Tracking
1. Open the **"Analytics"** tab in the CRM.
2. View real-time metrics:
   - **Total Outbound Store Clicks**: Number of users redirected to merchant sites.
   - **Top Converting Marketplace**: Breakdown between Amazon, Flipkart, Myntra, and Meesho.
   - **Top Performing Deals**: Identifies your most clicked products.
   - **Recent Click Stream**: Live log of timestamped clicks with device information.

---

## 5. Storefront Customization & Theme Mode

### Dark / Light Mode Switcher
- The storefront features a sun/moon toggle switch in the top header.
- **Light Mode**: Clean minimalist white background with high-contrast luxury typography.
- **Dark Mode**: Rich matte black background (`#0a0a0a`) with silver accents and neon marketplace badges.
- **Persistence**: User preference is automatically saved in browser `localStorage`.

### Updating Site Name, Tagline & Social Links
1. Go to the CRM &rarr; **"Settings"** tab.
2. Update:
   - **Site Name**: (Default: `PP Fashion Hub`)
   - **Tagline**: Subheading shown across the platform
   - **Telegram Channel Link**: Connected to footer and Telegram banner buttons
   - **WhatsApp Group Link**: Connected to community deal alert buttons
   - **Affiliate IDs**: Update your Amazon Tag, Flipkart AffID, Myntra Partner ID, and Meesho referral code.
3. Click **"Save Settings"**. Changes take effect instantly without restarting the server.

---

## 6. Database Maintenance & Backup

The SQLite database file is stored at:
```
server/data/fashionhub.db
```

### How to Back Up Data
To create a backup snapshot, simply copy the file while the server is running or stopped:
```bash
# Example backup command in PowerShell:
Copy-Item "server\data\fashionhub.db" "server\data\fashionhub_backup_$(Get-Date -Format 'yyyyMMdd').db"
```

### How to Restore from Backup
1. Stop the backend server.
2. Replace `server/data/fashionhub.db` with your backup copy.
3. Restart the backend server.

---

## 7. Production Deployment Guide

### Option A: Deploying on a VPS (Ubuntu / Linux / Windows Server)
1. Install Node.js v20+ and PM2 (Process Manager):
   ```bash
   npm install -g pm2
   ```
2. Build the frontend production assets:
   ```bash
   npm --prefix client run build
   ```
   *This outputs optimized static files to `client/dist/`.*
3. Configure `server/server.js` to serve `client/dist/` as static assets for single-port hosting.
4. Launch the application with PM2:
   ```bash
   pm2 start server/server.js --name "pp-fashion-hub"
   pm2 save
   pm2 startup
   ```

### Option B: Deploying on Cloud Platforms (Render / Railway / DigitalOcean)
- **Root Build Command**: `npm install && npm --prefix client install && npm --prefix client run build`
- **Start Command**: `node server/server.js`
- **Environment Variables**:
  - `PORT=5000` (or platform default)
  - `NODE_ENV=production`

---

## 8. Troubleshooting & FAQ

| Problem | Root Cause | Solution |
| :--- | :--- | :--- |
| **Port 5000 or 4000 already in use** | Another process is holding the port | Run `netstat -ano \| findstr :5000` and terminate the PID, or change the port in `server/server.js` / `client/vite.config.js`. |
| **Forgotten Admin Passcode** | User lost the passcode | On the CRM login screen, click **"Forgot Passcode?"**, enter Master Key `MASTER_RESET_KEY_2026_FASHION_HUB`, and specify a new passcode. |
| **Images not loading** | External image link expired or blocked hotlinking | Use the **"Upload Local Image"** button in the deal form to store images reliably on the local server. |
| **Affiliate tag missing** | Incorrect affiliate ID in Settings | Open CRM &rarr; **Settings**, verify the marketplace tag format, and click **Save Settings**. |

---

*Handover complete. PP Fashion Hub is fully configured, tested, and ready for production operation.*
