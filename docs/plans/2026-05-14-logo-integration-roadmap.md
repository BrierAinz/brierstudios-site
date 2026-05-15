# 🗡️ Logo Definitivo de Lilith — Roadmap de Integración

> **Para Hermes:** Usa el skill writing-plans para ejecutar este roadmap sección por sección. Cada task es independent pero secuencia optimizada.

**Meta:** Integrar el logo definitivo de Lilith (generado con LoRA, PixAI artwork #2011826186221586468) en todos los touchpoints de marca de BrierStudios.

**Arquitectura:** Reemplazar los assets de logo actuales (SVG genérico, rune ᛒ como favicon) con la imagen real de Lilith generada por LoRA. Mantener coherencia con el tema dark fantasy nordic existente.

**Assets fuente:**
- `/mnt/d/Proyectos/brierstudios-site/assets/lilith-logo/lilith-logo-orig.png` (1536×1536, full quality)
- `/mnt/d/Proyectos/brierstudios-site/assets/lilith-logo/lilith-logo-orig.webp` (1536×1536, original PixAI)
- `/mnt/d/Proyectos/brierstudios-site/assets/lilith-logo/lilith-logo-thumb.webp` (1024×1024)

**Tech Stack:** Python/Pillow para procesamiento de imágenes, SVG para favicon adaptivo, HTML/CSS vars existentes.

**Realm:** Alfheim (UI) + Niflheim (assets)

**Paleta de marca:**
- Gold: `#c8a23e` / `#e8d48b`
- Bronze: `#d19a66` / `#b07a48`
- Deep dark: `#060810` / `#1a1b26`
- Pale gold: `#e0c878`

---

## FASE 1: Preparación de Assets (Alfheim/Niflheim)

### Task 1.1: Generar variantes de imagen del logo
**Archivos:**
- Crear: `assets/lilith-logo/logo-lilith-512.png` (512×512 RGBA, fondo transparente)
- Crear: `assets/lilith-logo/logo-lilith-256.png` (256×256 RGBA, fondo transparente)
- Crear: `assets/lilith-logo/logo-lilith-128.png` (128×128 RGBA, fondo transparente)
- Crear: `assets/lilith-logo/logo-lilith-64.png` (64×64 RGBA, fondo transparente)
- Crear: `assets/lilith-logo/logo-lilith-32.png` (32×32 RGBA, fondo transparente)
- Crear: `assets/lilith-logo/logo-lilith-hero.webp` (768×1024, hero section landing)
- Crear: `assets/lilith-logo/logo-lilith-og.png` (1200×630, OG image social)

**Pasos:**
1. Abrir `lilith-logo-orig.png` con Pillow
2. Remover fondo (o crear versión con fondo negro `#060810` sólido)
3. Redimensionar a cada tamaño manteniendo aspect ratio
4. Para hero: crop centrado 1536→768 width, 1536→1024 height
5. Para OG: composicionar logo centrado sobre fondo dark con gradiente gold/bronze
6. Optimizar PNGs con compresión, WebP con calidad 85+

### Task 1.2: Generar favicon.ico multi-tamaño
**Archivos:**
- Modificar: `favicon.ico` (de 32×32 → multi-tamaño 16,32,48)
- Modificar: `favicon.svg` (si se mantiene SVG, actualizar; si no, reemplazar)

**Pasos:**
1. Generar favicon.ico con tamaños 16×16, 32×32, 48×48 embebidos usando Pillow
2. Mantener `favicon.svg` como fallback con rune ᛒ + glow (ya existe, evaluar si actualizar)
3. Verificar que se vea bien a 16px — puede que el logo completo sea demasiado detallado para 16px y sea mejor mantener el ᛒ con glow gold

### Task 1.3: Generar apple-touch-icon y PWA icons
**Archivos:**
- Modificar: `apple-touch-icon.png` (180×180)
- Modificar: `favicon-512.png` (512×512)
- Modificar: `manifest.json` (actualizar icon paths si cambian)

**Pasos:**
1. Crear 180×180 y 512×512 del logo Lilith con fondo `#060810`
2. Para PWA: agregar maskable padding (logo centrado con 40% safe zone)
3. Actualizar manifest.json si los paths cambian

**Commit:** `feat(assets): generate Lilith logo variants for all touchpoints`

---

## FASE 2: Landing Page — Reemplazo de Logo

### Task 2.1: Reemplazar logo en navbar
**Archivos:**
- Modificar: `index.html` línea ~99-101 (nav-logo)
- Posiblemente modificar: `styles.css` (`.nav-logo-img` styles)

**Antes:**
```html
<a href="#hero" class="nav-logo">
    <img src="logo.png?v=4.1" alt="BrierStudios" class="nav-logo-img" onerror="this.style.display='none'">
    <span class="nav-logo-text">Brier<span class="accent">Studios</span></span>
</a>
```

**Después:**
```html
<a href="#hero" class="nav-logo">
    <img src="assets/lilith-logo/logo-lilith-32.webp" alt="Lilith — BrierStudios" class="nav-logo-img" width="32" height="32">
    <span class="nav-logo-text">Brier<span class="accent">Studios</span></span>
</a>
```

**Estado actual:** `logo.png` es 864×1152 px (genérico, no Lilith real). Reemplazar con la versión 32-64px del logo real.

### Task 2.2: Reemplazar logo principal/hero image
**Archivos:**
- Modificar: `index.html` línea ~220-225 (lilith-hero-img)

**Antes:**
```html
<img class="lilith-hero-img" src="assets/lilith/lilith_portrait_dark-hero.webp" alt="Lilith — Diosa Oscura de Yggdrasil">
```

**Después:**
```html
<img class="lilith-hero-img" src="assets/lilith-logo/logo-lilith-hero.webp" alt="Lilith — Diosa Oscura de Yggdrasil">
```

**Nota:** Evaluar si queremos reemplazar el portrait-dark actual o dejarlo como alternativa. El hero actual ya usa una imagen de Lilith, pero no es el logo definitivo.

### Task 2.3: Reemplazar favicon y meta images
**Archivos:**
- Modificar: `index.html` líneas 15-19 (favicon links)
- Modificar: `index.html` líneas 32-34 (og:image)
- Modificar: `index.html` líneas 41-42 (twitter:image)

**Cambios:**
```html
<!-- Favicon links — reemplazar con versiones del logo Lilith -->
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
<link rel="icon" type="image/png" sizes="32x32" href="assets/lilith-logo/logo-lilith-32.png">
<link rel="icon" type="image/x-icon" sizes="16x16 32x32" href="favicon.ico">
<link rel="apple-touch-icon" sizes="180x180" href="apple-touch-icon.png">
<link rel="icon" type="image/png" sizes="512x512" href="favicon-512.png">

<!-- OG/Twitter image — reemplazar con OG del logo -->
<meta property="og:image" content="https://brierstudios.com/assets/lilith-logo/logo-lilith-og.png">
<meta name="twitter:image" content="https://brierstudios.com/assets/lilith-logo/logo-lilith-og.png">
```

**Commit:** `feat(landing): integrate Lilith logo into navbar, hero, and meta images`

---

## FASE 3: Página Lilith — Actualización de Brand

### Task 3.1: Actualizar favicon y meta images en lilith.html
**Archivos:**
- Modificar: `lilith.html` líneas 15-21 (favicon links)
- Modificar: `lilith.html` líneas 27-28 (og:image)
- Modificar: `lilith.html` líneas 35-36 (twitter:image)
- Modificar: `lilith.html` línea 46 (schema image)

**Cambios:** Igual que Task 2.3 pero en lilith.html. Agregar links a los nuevos assets del logo.

### Task 3.2: Agregar logo definitivo en Lilith page hero
**Archivos:**
- Modificar: `lilith.html` (hero section de lilith)

**Nota:** Analizar la sección hero actual de lilith.html para determinar el mejor placement del logo definitivo vs las imágenes de showcase existentes.

**Commit:** `feat(lilith-page): update branding with definitive Lilith logo`

---

## FASE 4: OG Image y Social Branding

### Task 4.1: Crear OG Image compuesto
**Archivos:**
- Crear: `assets/lilith-logo/logo-lilith-og.png` (1200×630)

**Pasos:**
1. Crear canvas 1200×630 con fondo `#060810`
2. Agregar gradiente sutil gold/bronze en bordes
3. Centrar el logo Lilith (crop circular o cuadrada con bordes suaves)
4. Agregar texto "BrierStudios" en Cinzel (si es legible a tamaño social)
5. Agregar runa ᛒ pequeña como accent

### Task 4.2: Actualizar Schema.org structured data
**Archivos:**
- Modificar: `index.html` líneas 44-69 (JSON-LD)

**Cambios:** Actualizar `"logo"` de `logo.svg` → `https://brierstudios.com/assets/lilith-logo/logo-lilith-512.png`

**Commit:** `feat(seo): update OG images and structured data with Lilith logo`

---

## FASE 5: Docs Branding (Svartalfheim)

### Task 5.1: Actualizar logo en docs.brierstudios.com
**Archivos:**
- Modificar: `/home/brierainz/comfy/docs-brierstudios/docusaurus.config.ts` (logo/favicon paths)
- Copiar: assets del logo a `static/img/` del docs site

**Pasos:**
1. Copiar logo variantes (32, 128, 512) a `/home/brierainz/comfy/docs-brierstudios/static/img/lilith-logo/`
2. Actualizar `docusaurus.config.ts` → `themeConfig.navbar.logo` al nuevo logo
3. Actualizar favicon path
4. Regenerar build: `cd /home/brierainz/comfy/docs-brierstudios && npm run build`
5. Deploy: `CLOUDFLARE_API_TOKEN=*** npx wrangler pages deploy build --project-name=docs-brierstudios`

**Commit:** `feat(docs): update branding with Lilith logo on docs site`

---

## FASE 6: PWA y Manifest

### Task 6.1: Actualizar manifest.json y PWA icons
**Archivos:**
- Modificar: `manifest.json` (icons array)
- Crear: PWA icon variants en `assets/lilith-logo/`

**Cambios manifest.json:**
```json
{
  "icons": [
    { "src": "assets/lilith-logo/logo-lilith-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any maskable" },
    { "src": "assets/lilith-logo/logo-lilith-256.png", "sizes": "256x256", "type": "image/png", "purpose": "any" },
    { "src": "apple-touch-icon.png", "sizes": "180x180", "type": "image/png" },
    { "src": "favicon.svg", "sizes": "any", "type": "image/svg+xml" }
  ]
}
```

**Commit:** `feat(pwa): update manifest and PWA icons with Lilith logo`

---

## FASE 7: Deploy y Verificación

### Task 7.1: Deploy landing page
**Pasos:**
1. `cd /mnt/d/Proyectos/brierstudios-site && git add -A && git commit -m "feat(brand): integrate definitive Lilith logo across all touchpoints"`
2. `git push origin main` (Cloudflare auto-deploy)

### Task 7.2: Deploy docs
**Pasos:**
1. `cd /home/brierainz/comfy/docs-brierstudios && npm run build`
2. `CLOUDFLARE_API_TOKEN=*** npx wrangler pages deploy build --project-name=docs-brierstudios`

### Task 7.3: Verificación visual
**Pasos:**
1. Abrir https://brierstudios.com en browser
2. Verificar: navbar logo visible, hero image cargada, favicon en tab
3. Abrir https://docs.brierstudios.com — verificar logo en navbar
4. Test OG preview con https://cards-dev.twitter.com/validator o similar
5. Verificar manifest en Lighthouse

---

## FASE 8: Logo SVG para Escalabilidad (Opcional/Bonus)

### Task 8.1: Evaluar necesidad de SVG trazado del logo
**Nota:** El logo de Lilith es una imagen generada por IA (no vectorizable fácilmente). Mantener PNG/WebP para la imagen real. Para tamaños < 32px, mantener el ᛒ rune SVG como favicon (ya existe y funciona bien). Considerar:
- Logo real para navbar (32-64px), hero, OG, manifest (PNG/WebP)
- Rune ᛒ SVG para favicon < 16px (ya existe, funciona)
- Posible: crear versión simplificada SVG de la silueta de Lilith como `lilith-silhouette.svg` (ya existe una versión anterior pero puede actualizarse)

---

## Dependencias entre Tasks

```
FASE 1 (1.1 → 1.2 → 1.3)
    ↓
FASE 2 (2.1, 2.2, 2.3) — puede paralelizarse
    ↓
FASE 3 (3.1, 3.2) — puede paralelizarse con FASE 4
    ↓
FASE 4 (4.1, 4.2) — puede paralelizarse con FASE 3
    ↓
FASE 5 (5.1) — independiente de landing
    ↓
FASE 6 (6.1) — después de FASE 1
    ↓
FASE 7 (7.1, 7.2, 7.3) — AL FINAL, todo deploy junto
    ↓
FASE 8 (8.1) — opcional, después de FASE 7
```

## Notas Críticas

- **NO usar** "anime goddess" en ningún alt text o meta — siempre "dark fantasy goddess"
- **Paleta**: Gold `#c8a23e`, Bronze `#d19a66`, Dark `#060810`, NO neon/cyberpunk
- **LoRA-first satisfied**: Logo generado con LoRA de Lilith en PixAI (trigger: `Lilith`, model ID: `2011725795872873636`)
- **Favicon < 32px**: Mantener ᛒ rune SVG existente (el logo real es demasiado detallado para 16px)
- **Deploy landing**: `git push origin main` → Cloudflare auto-deploy
- **Deploy docs**: `CLOUDFLARE_API_TOKEN=... npx wrangler pages deploy build --project-name=docs-brierstudios`
- **PATH fix**: Siempre `export PATH="$HOME/.local/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:$PATH"`