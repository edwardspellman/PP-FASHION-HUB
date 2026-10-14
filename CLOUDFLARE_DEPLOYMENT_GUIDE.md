# Deploying The Fashion Hub on Cloudflare

This guide walks you through deploying **The Fashion Hub** on **Cloudflare** for lightning-fast global speed, automated HTTPS/SSL, and enterprise DDoS protection.

---

## 🏗️ Architecture Overview

The Fashion Hub has two layers:
1. **Frontend**: React 19 + Vite SPA (static bundle compiled to `client/dist`).
2. **Backend**: Node.js Express server + SQLite database (`fashionhub.db`) + image storage (`/uploads/`).

Because Cloudflare Pages is an edge static CDN, you have **two recommended deployment paths**:

| Method | Best For | Complexity | Cost |
| :--- | :--- | :--- | :--- |
| **Method 1: Cloudflare Pages + Cloud Backend** | Production, automated Git CI/CD, global CDN | Simple | 100% Free |
| **Method 2: Cloudflare Tunnel (`cloudflared`)** | Single-server full-stack (VPS / Docker / Home Server) | Very Easy | 100% Free |

---

## 🚀 Method 1: Cloudflare Pages (Frontend) + Cloud Backend (Recommended)

In this approach, Cloudflare Pages hosts your frontend at edge locations worldwide, while a free backend host (like **Render.com** or **Railway**) runs your Node.js + SQLite API.

### Step 1: Deploy the Backend API (Render.com)

1. Sign up for free at [Render.com](https://render.com/).
2. Click **New +** -> **Blueprint**.
3. Connect your GitHub repository:
   ```
   https://github.com/edwardspellman/THE-FASHION-HUB
   ```
4. Render will automatically read the included [`render.yaml`](./render.yaml) file.
5. Click **Apply**.
6. Once built, copy your backend URL (e.g. `https://the-fashion-hub-api.onrender.com`).

---

### Step 2: Deploy Frontend on Cloudflare Pages

1. Log in to the [Cloudflare Dashboard](https://dash.cloudflare.com/).
2. In the left navigation menu, click **Workers & Pages**.
3. Click the **Create application** button.
4. Select the **Pages** tab and click **Connect to Git**.
5. Choose your GitHub account and select repository:
   ```
   edwardspellman/THE-FASHION-HUB
   ```
6. Click **Begin setup**.

---

### Step 3: Configure Build Settings

Fill in the build configuration:

- **Project name**: `the-fashion-hub` (or your choice)
- **Production branch**: `main`
- **Framework preset**: `Vite` (or `None`)
- **Build command**:
  ```bash
  npm run build
  ```
  *(or `npm --prefix client install && npm --prefix client run build`)*
- **Build output directory**:
  ```
  client/dist
  ```
- **Root directory**: `/` (leave as default)

---

### Step 4: Connect API & Enable Seamless Routing

The repository includes a ready-to-use [`client/public/_redirects`](./client/public/_redirects) file.

To connect your Cloudflare Pages frontend directly to your backend API with **zero CORS issues**, open `client/public/_redirects` and specify your backend URL:

```txt
# Proxy API and uploads to your live backend server
/api/*      https://your-backend-app.onrender.com/api/:splat      200
/uploads/*  https://your-backend-app.onrender.com/uploads/:splat  200

# Single Page App routing fallback
/*          /index.html                                           200
```

1. Replace `https://your-backend-app.onrender.com` with your actual Render / Railway backend URL.
2. Commit and push:
   ```bash
   git add client/public/_redirects
   git commit -m "chore: configure backend proxy in _redirects"
   git push origin main
   ```
3. Cloudflare Pages will automatically trigger a new deployment within seconds!

---

### Step 5: Custom Domain Setup (Optional)

1. In your Cloudflare Pages project, go to **Custom domains**.
2. Click **Set up a custom domain**.
3. Enter your domain (e.g. `deals.yourdomain.com` or `yourdomain.com`).
4. If your domain's DNS is managed by Cloudflare, it will automatically configure the CNAME and issue a free SSL certificate within 60 seconds.

---

## 🚇 Method 2: Cloudflare Tunnel (Full-Stack on VPS or Docker)

If you are running the entire application (Frontend + Backend + SQLite) together on a VPS (Ubuntu, Debian, CentOS), cloud instance (AWS EC2, Hetzner, DigitalOcean), or a local machine, **Cloudflare Tunnel** connects your server directly to Cloudflare without opening any router ports or exposing your server's IP address.

### Step 1: Build & Start Your App on the Server

```bash
# Clone the repository
git clone https://github.com/edwardspellman/THE-FASHION-HUB.git
cd THE-FASHION-HUB

# Install dependencies and build
npm install
npm run build

# Start the full-stack server on port 5000
npm start
```

---

### Step 2: Install `cloudflared` (Cloudflare Tunnel CLI)

#### On Ubuntu / Debian:
```bash
curl -L --output cloudflared.deb https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
sudo dpkg -i cloudflared.deb
```

#### On Windows (PowerShell):
```powershell
winget install Cloudflare.cloudflared
```

#### On macOS:
```bash
brew install cloudflared
```

---

### Step 3: Launch an Instant Public Tunnel (Zero Setup)

Run this single command to get an instant live HTTPS address on Cloudflare:

```bash
cloudflared tunnel --url http://localhost:5000
```

**Output**:
```
+--------------------------------------------------------------------------------------------+
|  Your quick Tunnel has been created! Visit it at (it may take some time to be reachable):  |
|  https://unique-name-1234.trycloudflare.com                                                |
+--------------------------------------------------------------------------------------------+
```

You can now open `https://unique-name-1234.trycloudflare.com` on any phone, tablet, or browser worldwide!

---

### Step 4: Permanent Tunnel with Custom Domain (Production)

For a permanent branded domain (e.g. `deals.myfashionhub.com`):

1. **Authenticate Tunnel**:
   ```bash
   cloudflared tunnel login
   ```
   *(Select your Cloudflare domain in the browser window)*

2. **Create the Named Tunnel**:
   ```bash
   cloudflared tunnel create fashionhub-tunnel
   ```

3. **Route your DNS**:
   ```bash
   cloudflared tunnel route dns fashionhub-tunnel deals.myfashionhub.com
   ```

4. **Create Tunnel Config File (`~/.cloudflared/config.yml`)**:
   ```yaml
   tunnel: <TUNNEL_ID>
   credentials-file: /root/.cloudflared/<TUNNEL_ID>.json

   ingress:
     - hostname: deals.myfashionhub.com
       service: http://localhost:5000
     - service: http_status:404
   ```

5. **Run as a Background System Service**:
   ```bash
   sudo cloudflared service install
   sudo systemctl start cloudflared
   sudo systemctl enable cloudflared
   ```

---

## ⚡ Cloudflare Edge Caching & Headers

The repository includes [`client/public/_headers`](./client/public/_headers), which Cloudflare automatically deploys:

- **1-Year Cache for Bundled Assets**: Static CSS, JS, fonts, and SVGs under `/assets/*` are aggressively cached at edge datacenters (`Cache-Control: public, max-age=31536000, immutable`).
- **Security Headers**: Includes `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, and strict referrer policies to protect shoppers and admin sessions.

---

## 🔒 Admin Access After Deployment

- **Customer Storefront**: `https://your-domain.com/`
- **Merchant CRM Portal**: `https://your-domain.com/?admin=true`
- **Default Admin Passcode**: `Admin@5678901234`
- **Master Emergency Recovery Key**: `Unknown`

---

## 📋 Quick Troubleshooting

### 1. "Page Not Found" on Page Refresh
- **Cause**: Client-side single page routing needs fallback to `index.html`.
- **Fix**: Verify `client/public/_redirects` exists and has `/*  /index.html  200`.

### 2. API returns 404 on Cloudflare Pages
- **Cause**: Cloudflare Pages only hosts static files by default and needs to know where your backend server lives.
- **Fix**: Check `client/public/_redirects` has the line `/api/*  https://your-backend.onrender.com/api/:splat  200`.

### 3. Images Uploaded in CRM Disappear After Rebuild
- **Cause**: Ephemeral filesystem on serverless hosts.
- **Fix**: Use a persistent volume mount (`/uploads`) on Render / Railway / Docker, or attach Cloudflare R2 object storage.
