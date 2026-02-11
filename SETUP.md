# TareasZen – Setup Guide

## Arch Linux

### 1. Install System Dependencies
```bash
sudo pacman -S --needed \
    webkit2gtk-4.1 \
    base-devel \
    curl \
    wget \
    file \
    openssl \
    gtk3 \
    libayatana-appindicator \
    librsvg
```

### 2. Install Rust (if not already installed)
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source ~/.cargo/env
```

Check Rust version:
```bash
rustc --version  # should be 1.70+
```

### 3. Install Node.js (if not already installed)
```bash
sudo pacman -S nodejs npm
```

Check version:
```bash
node --version  # should be 18+
npm --version
```

### 4. Install emoji fonts (important for icons)
```
sudo pacman -S noto-fonts-emoji
```

### 5. Build the Project
```bash
cd tareaszen

# Install frontend dependencies
npm install

# Development mode (with Hot Reload)
npm run tauri dev

# Production build
npm run tauri build
```

After building, the final binary will be located at:
```
src-tauri/target/release/tareaszen
```

---

## Debian/Ubuntu

### 1. System Dependencies
```bash
sudo apt update
sudo apt install -y \
    libwebkit2gtk-4.1-dev \
    build-essential \
    curl \
    wget \
    file \
    libxdo-dev \
    libssl-dev \
    libayatana-appindicator3-dev \
    librsvg2-dev
```

### 2. Rust & Node.js

Same as for Arch (see above).

---

## Windows

### 1. Prerequisites

- WebView2: Already pre-installed on Windows 10/11
- Visual Studio Build Tools: [Download](https://visualstudio.microsoft.com/visual-cpp-build-tools/)
  - Select workload "Desktop development with C++"

### 2. Install Rust

Download and run [rustup-init.exe](https://rustup.rs/).

### 3. Install Node.js

Download and install [Node.js LTS](https://nodejs.org/).

### 4. Build the Project
```powershell
cd tareaszen
npm install
npm run tauri dev
```

If PowerShell complains:
```
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
```

Clear cache if needed:
```
cd src-tauri
cargo clean
cd ..
npm run tauri dev
```

If that's not enough, also clear the frontend cache:
```
rm -r node_modules/.vite
```

---

## Troubleshooting

**Error: `webkit2gtk-4.1` not found**

Arch: `sudo pacman -S webkit2gtk-4.1`

**Error: `cargo` not found**
```bash
source ~/.cargo/env
```

Or open a new terminal.

**Error: Node module issues**
```bash
rm -rf node_modules package-lock.json
npm install
```

**First build takes a long time**

Normal. Rust compiles all dependencies the first time (~3-5 minutes). After that, incremental and fast.

**DB Path**

%LOCALAPPDATA%\tareaszen\tareaszen.db