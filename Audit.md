# Taskflow Security Audit - Anleitung

## 1. Root-Dependencies Manuell Prüfen

### Rust-Dependencies (Cargo.toml)

**Datei:** `src-tauri/Cargo.toml`

**Für jede Dependency in `[dependencies]` und `[dev-dependencies]`:**

1. **Offiziellen Namen verifizieren:**
   - Gehe zu https://crates.io
   - Suche nach dem Paketnamen
   - Prüfe: Stimmt der Name EXAKT überein?
   
2. **Legitimität checken:**
   - ✅ Download-Zahlen (>10k bei populären Paketen)
   - ✅ Letztes Update (nicht älter als 1-2 Jahre bei aktiven Projekten)
   - ✅ Repository-Link (GitHub/GitLab) - klicken und verifizieren
   - ✅ Maintainer-Namen bekannt/vertrauenswürdig?
   - ✅ Dokumentation vorhanden?

3. **Rot-Flaggen:**
   - ⚠️ Sehr ähnlicher Name wie bekanntes Paket
   - ⚠️ Wenige Downloads (<100)
   - ⚠️ Kein Repository-Link
   - ⚠️ Kürzlich erstellt mit hoher Version (z.B. v5.0.0)

**Beispiel-Check:**
```
Dependency: tauri = "1.5"
1. Suche "tauri" auf crates.io
2. Offizielle Seite: https://crates.io/crates/tauri
3. Repository: https://github.com/tauri-apps/tauri
4. Downloads: >1M ✓
5. Letztes Update: Aktuell ✓
```

### JavaScript/React-Dependencies (package.json)

**Datei:** `package.json`

**Für jede Dependency in `dependencies` und `devDependencies`:**

1. **Offiziellen Namen verifizieren:**
   - Gehe zu https://www.npmjs.com
   - Suche nach dem Paketnamen
   - Prüfe: Stimmt der Name EXAKT überein?

2. **Legitimität checken:**
   - ✅ Weekly Downloads (>10k bei populären Paketen)
   - ✅ Letztes Publish-Datum
   - ✅ Homepage/Repository-Link
   - ✅ Maintainer-Anzahl und Namen
   - ✅ NPM-Badge (zeigt Popularität)

3. **Rot-Flaggen:**
   - ⚠️ Tippfehler-Varianten (z.B. "react-domm" statt "react-dom")
   - ⚠️ Sehr geringe Downloads
   - ⚠️ Kein Repository
   - ⚠️ Ungewöhnliche Versionsnummer für neues Paket

**Beispiel-Check:**
```
Dependency: "react": "^18.2.0"
1. Suche "react" auf npmjs.com
2. Offizielle Seite: https://www.npmjs.com/package/react
3. Repository: https://github.com/facebook/react
4. Weekly Downloads: >20M ✓
5. Maintainer: facebook ✓
```

---

## 2. Automated Security Scanning

### Rust/Cargo

**Installation der Tools:**
```bash
cargo install cargo-audit
cargo install cargo-deny
```

**Audit durchführen:**
```bash
# Im Projektverzeichnis
cd src-tauri

# Sicherheitslücken prüfen
cargo audit

# Bei Warnungen diese anzeigen lassen:
argo audit --deny warnings

# Umfassende Prüfung (Security, Lizenzen, Bans)
cargo deny check


```

**Was wird geprüft:**
- Bekannte Sicherheitslücken (RustSec Advisory Database)
- Veraltete Dependencies
- Yanked (zurückgezogene) Pakete

### JavaScript/npm

**Audit durchführen:**
```bash
# Im Frontend-Verzeichnis (Projekt-Root)
cd /pfad/zum/taskflow

# Standard Audit
npm audit

# npm install muss vorher ausgeführt worden sein

# Nur kritische/hohe Schwachstellen
npm audit --audit-level=high

# Paketsignaturen prüfen (npm 8+)
npm audit signatures
```

**Was wird geprüft:**
- Bekannte Sicherheitslücken (npm Advisory Database)
- Malicious Pakete
- Signaturen (wenn aktiviert)

---

## 3. Dependency-Tree Übersicht

**Nur direkte Dependencies anzeigen:**

```bash
# Rust
cd src-tauri
cargo tree --depth 1

# npm
cd /pfad/zum/taskflow
npm ls --depth=0
```

**Vollständiger Dependency-Tree:**
```bash
# Rust
cargo tree

# npm  
npm ls
```

---

## 4. Lock-Files Sichern

**Nach erfolgreicher Prüfung in Git committen:**

```bash
# Cargo.lock und package-lock.json
git add src-tauri/Cargo.lock
git add package-lock.json
git commit -m "Lock dependencies after security audit"
```

**Warum wichtig:**
- Fixiert exakte Versionen inkl. Hashes
- Stellt reproduzierbare Builds sicher
- Verhindert unbemerkte Dependency-Updates

---

## 5. Regelmäßiges Audit (Empfehlung)

**Monatlich oder bei jedem Update:**

```bash
# Komplettes Audit-Script
cd /pfad/zum/taskflow

# Rust
cd src-tauri
cargo audit
cargo update  # Nur nach Review!
cargo audit

# npm
cd ..
npm audit
npm outdated  # Zeigt verfügbare Updates
npm update    # Nur nach Review!
npm audit
```

---

## 6. CI/CD Integration (Optional)

**GitHub Actions Beispiel:**
```yaml
name: Security Audit

on: [push, pull_request]

jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Rust Security Audit
        run: |
          cargo install cargo-audit
          cd src-tauri
          cargo audit
      
      - name: npm Security Audit
        run: |
          npm audit --audit-level=high
```

---

## 7. Checkliste für neues Dependency

Bevor du ein neues Paket hinzufügst:

- [ ] Name auf crates.io / npmjs.com verifiziert
- [ ] Repository existiert und ist aktiv
- [ ] Ausreichend Downloads/Nutzung
- [ ] Dokumentation vorhanden
- [ ] Maintainer vertrauenswürdig
- [ ] Keine bekannten Security-Issues
- [ ] Lizenz kompatibel
- [ ] Wirklich notwendig? (Weniger Dependencies = besser)

---

## Quick Reference

| Was                  | Rust                    | JavaScript           |
|----------------------|-------------------------|----------------------|
| Registry             | crates.io               | npmjs.com            |
| Root-Dependencies    | src-tauri/Cargo.toml    | package.json         |
| Lock-File            | Cargo.lock              | package-lock.json    |
| Audit-Tool           | cargo audit             | npm audit            |
| Tree anzeigen        | cargo tree --depth 1    | npm ls --depth=0     |
| Updates prüfen       | cargo update --dry-run  | npm outdated         |
