# 🚀 The Fashion Hub — Complete Deployment Guide

This guide explains how to deploy **The Fashion Hub** to production.

---

## 🏗️ Architecture Overview

The Fashion Hub uses a **unified monolithic production architecture**:
1. **Frontend**: Vite + React 19 + Tailwind CSS compiled into static assets (`client/dist`).
2. **Backend**: Node.js 22+ & Express 4 serving:
   - The compiled React SPA (`client/dist/index.html`)
   - High-performance REST APIs (`/api/*`)
   - Uploaded merchant deal images (`/uploads/*`)
3. **Database**: Built-in native SQLite (`node:sqlite`) in WAL mode (`fashionhub.db`). **No external database server (PostgreSQL/MySQL) is required.**

---

## ⚡ Deployment Options At a Glance

| Deployment Platform | Setup Time | Database Persistence | Best For |
| :--- | :--- | :--- | :--- |
| **Option 1: Render.com** | 5 mins | Persistent Disk (`render.yaml`) | **Recommended (Easiest Cloud Setup)** |
| **Option 2: Railway.app** | 5 mins | Volume Mount | Fast Git push deployments |
| **Option 3: Linux VPS (Ubuntu / AWS / DigitalOcean)** | 10 mins | Local NVMe / SSD disk | Full control, lowest cost, custom domain |
| **Option 4: Docker / Docker Compose** | 2 mins | Named Docker Volumes | Self-hosted or container platforms |

---

## 📦 Option 1: Render.com (Recommended)

Render provides an official persistent disk feature that keeps your SQLite database and deal uploads permanently safe across deployments and restarts.

### Method A: Automated Blueprint Deployment (1-Click)
We have already created a [`render.yaml`](./render.yaml) file in the repository root.

1. Push your repository to **GitHub** or **GitLab**.
2. Log in to [Render Dashboard](https://dashboard.render.com/).
3. Click **New +** $\rightarrow$ **Blueprint**.
4. Select your **The Fashion Hub** repository.
5. Render will automatically read `render.yaml` and configure:
   - Build Command: `npm run build && cd server && npm install`
   - Start Command: `node server/server.js`
   - Persistent Disk mounted at `/var/data`
   - Environment variables: `PORT=10000`, `DATA_DIR=/var/data/fashionhub`, `UPLOADS_DIR=/var/data/uploads`
6. Click **Apply**. Your app will be live with a free HTTPS URL (e.g., `https://the-fashion-hub.onrender.com`).

### Method B: Manual Render Setup
1. In Render, select **New +** $\rightarrow$ **Web Service**.
2. Connect your Git repository.
3. Configure the following:
   - **Environment**: `Node`
   - **Build Command**: `npm run build && cd server && npm install`
   - **Start Command**: `node server/server.js`
   - **Instance Type**: Starter (Disks require Starter or higher, ~$7/mo)
4. Under **Disks**, click **Add Disk**:
   - **Name**: `fashionhub-data`
   - **Mount Path**: `/var/data`
   - **Size**: `1 GB`
5. Under **Environment Variables**, add:
   - `NODE_VERSION` = `22.12.0`
   - `DATA_DIR` = `/var/data/fashionhub`
   - `UPLOADS_DIR` = `/var/data/uploads`
6. Click **Create Web Service**.

---

## 🚂 Option 2: Railway.app

1. Log in to [Railway.app](https://railway.app/).
2. Click **New Project** $\rightarrow$ **Deploy from GitHub repo**.
3. Select your repository.
4. Go to **Settings** $\rightarrow$ **Volumes** $\rightarrow$ Click **Add Volume**:
   - **Mount Path**: `/app/server/data`
5. Go to **Variables** and verify:
   - `PORT`: `5000` (or Railway's default `$PORT`)
6. Railway will automatically build and start the container using the included [`Dockerfile`](./Dockerfile).

---

## 🖥️ Option 3: Linux VPS (DigitalOcean / AWS EC2 / Ubuntu / Debian)

Running on an Ubuntu server ($4–$6/month droplet or EC2 t4g.small) gives maximum performance with zero platform limits.

### Step 1: Install Node.js 22 & Git
```bash
# Update packages
sudo apt update && sudo apt upgrade -y

# Install Node.js 22 LTS
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs git build-essential

# Verify versions
node -v   # Should be v22.x or higher
npm -v
```

### Step 2: Clone & Build The Fashion Hub
```bash
# Clone your repository
git clone https://github.com/yourusername/the-fashion-hub.git /var/www/fashionhub
cd /var/www/fashionhub

# Install all dependencies and build frontend
npm install
npm run build
```

### Step 3: Run with PM2 (Process Manager)
PM2 ensures the server auto-restarts on reboots or crashes:
```bash
# Install PM2 globally
sudo npm install -g pm2

# Start the application
pm2 start server/server.js --name "fashionhub"

# Save PM2 process list and configure auto-start on boot
pm2 save
pm2 startup
```

### Step 4: Configure Nginx & Free SSL (Certbot)
```bash
# Install Nginx and Certbot
sudo apt install -y nginx certbot python3-certbot-nginx
```

Create `/etc/nginx/sites-available/fashionhub`:
```nginx
server {
    server_name yourdomain.com www.yourdomain.com;

    client_max_body_size 25M;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable site and install free SSL certificate:
```bash
sudo ln -s /etc/nginx/sites-available/fashionhub /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Issue free HTTPS SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

---

## 🐳 Option 4: Docker & Docker Compose

Deploy with zero host dependencies using Docker:

### 1. Run with Docker Compose
```bash
docker compose up -d --build
```
Your store is now running at `http://localhost:5000` with persistent SQLite and uploads volumes.

### 2. View Logs
```bash
docker compose logs -f
```

### 3. Stop or Restart
```bash
docker compose down
docker compose restart
```

---

## ⚙️ Environment Variables Reference

| Variable | Default Value | Description |
| :--- | :--- | :--- |
| `PORT` | `5000` | Port Express listens on. Automatically supplied by Render/Railway. |
| `NODE_ENV` | `production` | Node environment flag. |
| `DATA_DIR` | `server/data` | Folder where SQLite `fashionhub.db` is stored. |
| `UPLOADS_DIR` | `server/uploads` | Folder where merchant uploaded deal images are stored. |

---

## ✅ Post-Deployment Verification Checklist

Once deployed to your URL:
1. **Health Check**:
   - Visit `https://yourdomain.com/api/health` $\rightarrow$ should return `{"status":"ok","database":"sqlite"}`.
2. **Storefront Verification**:
   - Visit `https://yourdomain.com/` $\rightarrow$ homepage loads with catalog deals.
   - Filter by store (Myntra, Flipkart, Amazon) and category.
   - Test search and click an affiliate deal (opens in a new tab).
3. **Mobile Responsive Check**:
   - Open on an Android / iPhone device $\rightarrow$ verify top announcement bar and hero banner are hidden, and right-side drawer opens smoothly.
4. **Admin CRM Verification**:
   - Visit `https://yourdomain.com/?admin=true`
   - Unlock with passcode: `Admin@5678901234`
   - Verify CRM tabs (Catalog, Offers, Telemetry, Affiliate Settings).
5. **Emergency Password Recovery**:
   - Master Recovery Key: `Unknown` can be used anytime in the "Forgot Passcode?" modal to reset the password.
