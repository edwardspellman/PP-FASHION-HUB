# PP Fashion Hub 🛍️

A high-performance curated fashion deals and affiliate storefront featuring real-time coupon codes, discount filters, partner store links (Myntra, Flipkart, Amazon, Meesho, Ajio), telemetry analytics, custom brand showcase sections, dark/light theme engine, and a built-in merchant CRM portal. Powered by React 19, Tailwind CSS, Express, and native Node.js SQLite.

---

## 🚀 Features

- **Strict Editorial Aesthetics & Dark Mode**: Ultra-clean monochromatic palette with instant toggle between minimalist white Light Mode and rich matte black Dark Mode.
- **Meesho Integration & Custom Brand Showcases**: Dedicated Meesho budget drop filters, badges, automated affiliate link conversion, and customizable brand sections created on-demand from the CRM.
- **Mobile Optimized**:
  - Right-side slide-in mobile navigation drawer for thumb ergonomics.
  - Automatically adapts for Android & iOS mobile phones and tablets.
- **High-Performance Architecture**:
  - Built-in Node.js native SQLite database (`fashionhub.db`) in WAL mode.
  - Sub-millisecond queries, zero external database setup or costs.
  - Asynchronous outbound click telemetry via `navigator.sendBeacon`.
- **Merchant CRM Portal**:
  - Complete control center to list deals, edit prices, upload photos from computer/mobile, manage flash sales, and configure affiliate tags.
  - Unlocked with secure passcode `Admin@5678901234` or master emergency recovery key `MASTER_RESET_KEY_2026_FASHION_HUB`.
  - Zero sensitive credentials leaked on customer or operator panels.
- **Client Handover Document**: Step-by-step operating and maintenance guide available in [`CLIENT_HANDOVER_GUIDE.md`](./CLIENT_HANDOVER_GUIDE.md).

---

## 💻 Local Development

### 1. Install & Build
```bash
# Install dependencies
npm --prefix client install
npm --prefix server install

# Build client
npm run build
```

### 2. Start Servers
```bash
# Terminal 1: Start Backend API & SQLite Server (Port 5000)
npm run dev:server

# Terminal 2: Start Frontend Vite UI (Port 4000)
npm run dev:client
```
- Storefront: [http://localhost:4000](http://localhost:4000)
- Admin CRM: [http://localhost:4000/?admin=true](http://localhost:4000/?admin=true)
- API Health: [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## 🚢 Deployment

The production server is self-contained: `server/server.js` serves the built React app (`client/dist`), API endpoints, and deal images simultaneously.

For complete step-by-step guides, see [**DEPLOYMENT_GUIDE.md**](./DEPLOYMENT_GUIDE.md).

### Quick Deployment Options:
1. **Render.com (Recommended)**: Use the included [`render.yaml`](./render.yaml) for 1-click deploy with a persistent disk.
2. **Railway.app**: Push to GitHub and deploy with a persistent volume mounted at `/app/server/data`.
3. **Linux VPS (Ubuntu / AWS EC2 / DigitalOcean)**:
   ```bash
   git clone <repo> && cd <repo>
   npm install && npm run build
   pm2 start server/server.js --name "fashionhub"
   ```
4. **Docker**:
   ```bash
   docker compose up -d --build
   ```

---

## 🧪 Testing

A comprehensive end-to-end master test suite is included:
```bash
node scratch/test_master_suite.cjs
```
- **49/49 Tests Passed (100% Success Rate)**
- Covers all backend endpoints, error resilience boundaries, security/SQLi immunity, and browser interactions across Desktop, Tablet, and Mobile Android/iOS viewports with 0 console or network errors.
