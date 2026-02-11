# TaskFlow – Setup Guide

## Arch Linux

### 1. System-Dependencies installieren

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

### 2. Rust installieren (falls nicht vorhanden)

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source ~/.cargo/env
```

Rust-Version prüfen:

```bash
rustc --version  # sollte 1.70+ sein
```

### 3. Node.js installieren (falls nicht vorhanden)

```bash
sudo pacman -S nodejs npm
```

Oder via nvm:

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc
nvm install 20
```

Version prüfen:

```bash
node --version  # sollte 18+ sein
npm --version
```

### 4. Projekt bauen

```bash
cd taskflow

# Frontend-Dependencies installieren
npm install

# Development-Modus (mit Hot Reload)
npm run tauri dev

# Production Build
npm run tauri build
```

Die fertige Binary liegt nach dem Build unter:

```
src-tauri/target/release/taskflow
```

---

## Debian/Ubuntu

### 1. System-Dependencies

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

Gleich wie bei Arch (siehe oben).

---

## Windows

### 1. Voraussetzungen

- WebView2: Bereits vorinstalliert auf Windows 10/11
- Visual Studio Build Tools: [Download](https://visualstudio.microsoft.com/visual-cpp-build-tools/)
  - Workload "Desktop development with C++" auswählen

### 2. Rust installieren

[rustup-init.exe](https://rustup.rs/) herunterladen und ausführen.

### 3. Node.js installieren

[Node.js LTS](https://nodejs.org/) herunterladen und installieren.

### 4. Projekt bauen

```powershell
cd taskflow
npm install
npm run tauri dev
```

Falls Powershell mozt:

```
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
```

Cache löschen, falls nötig

```
cd src-tauri
cargo clean
cd ..
npm run tauri dev
```

Falls das nicht reicht, auch den Frontend-Cache löschen:
```
rm -r node_modules/.vite
```

---

## Troubleshooting

**Fehler: `webkit2gtk-4.1` nicht gefunden**

Arch: `sudo pacman -S webkit2gtk-4.1`

**Fehler: `cargo` nicht gefunden**

```bash
source ~/.cargo/env
```

Oder Terminal neu öffnen.

**Fehler: Node-Module Probleme**

```bash
rm -rf node_modules package-lock.json
npm install
```

**Erster Build dauert lange**

Normal. Rust kompiliert alle Dependencies beim ersten Mal (~3-5 Minuten). Danach inkrementell und schnell.

**DB Pfad**

%LOCALAPPDATA%\tareaszen\tareaszen.db