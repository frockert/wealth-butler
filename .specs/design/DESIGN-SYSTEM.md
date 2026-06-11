# Wealth Butler — Design System
**Style:** Swiss Neo-Brutalism  
**Status:** FINALISED

---

## Philosophy

Swiss Neo-Brutalism: the structural rigour of Swiss editorial design fused with
neo-brutalist rawness. Hard black borders, solid accent fills, zero gradients, zero
blur-shadows, and bold hard-offset shadows give cards a physical "sticker on a table"
feel. A strict typographic hierarchy — Space Mono uppercase labels with wide tracking,
Space Grotesk body and display numerics — adds editorial precision and breathing room
without softening the overall brutality. Pops of bright accent colour (mint, yellow, pink,
purple) each map to a specific section, creating a spatial colour language across the
dashboard. The black sidebar anchors the layout and reinforces the hard editorial spine.

---

## Colour Palette

### Base

| Token           | Hex       | Usage                                  |
|-----------------|-----------|----------------------------------------|
| `bg-page`       | `#f0ede6` | Main content area background           |
| `bg-sidebar`    | `#111111` | Left sidebar — black spine             |
| `bg-header`     | `#111111` | Top header bar                         |
| `border`        | `#111111` | All hard card / UI borders (2px solid) |
| `text-primary`  | `#111111` | Headings, values, nav labels           |
| `text-inverted` | `#f0ede6` | Text on black backgrounds (sidebar, header) |
| `text-muted`    | `#888888` | Labels, subtitles, empty-state text    |
| `text-muted-inv`| `#666666` | Muted text on black (sidebar inactive) |
| `border-dashed` | `#bbbbbb` | Dashed placeholder borders             |

### Accent Fills (card backgrounds & highlights)

| Token           | Hex       | Section / Usage                        |
|-----------------|-----------|----------------------------------------|
| `accent-mint`   | `#c8f0d8` | Net Worth card, positive data, nav active |
| `accent-sand`   | `#f0e8c8` | Market Summary card                    |
| `accent-yellow` | `#f5e642` | Warnings, stale-data badges only       |
| `accent-pink`   | `#f7b3d1` | AI Advisor card / section              |
| `accent-purple` | `#c9b8f0` | Goals card / section                   |
| `nav-active`    | `#00c48c` | Active sidebar nav item fill           |

### Semantic (data)

| Token      | Hex       | Usage                       |
|------------|-----------|-----------------------------|
| `positive` | `#00c48c` | Portfolio gains, up deltas  |
| `negative` | `#e63946` | Portfolio losses, down deltas |

### Accent Shadow Tints
Hard-offset shadow colour on accent-filled cards uses a darkened version of the accent,
not black. This gives each coloured card its own shadow personality.

| Card          | Shadow colour |
|---------------|---------------|
| Mint card     | `#1a6640`     |
| Sand card     | `#7a6e00`     |
| Yellow badge  | `#7a6e00`     |
| Pink card     | `#8a2050`     |
| Purple card   | `#3d2880`     |
| White card    | `#111111`     |

---

## Typography

Load both families via Google Fonts:

```html
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet" />
```

### Font roles

| Token / class   | Family         | Tailwind      | Usage |
|-----------------|----------------|---------------|-------|
| **Space Grotesk** | Geometric sans | `font-sans` (default) | All body text, headings, nav labels, buttons, and **big bold financial figures** (e.g. net worth hero value). Slightly quirky, modern — suits neo-brutalism. |
| **Space Mono**    | Monospace      | `font-mono` + `.label-mono` | Uppercase, wide-tracked **labels** only — card titles ("NET WORTH"), delta tags ("1 DAY"), category names, table column headers. Old-school terminal character. |

**System fallbacks:** `sans` → `-apple-system, BlinkMacSystemFont, sans-serif`; `mono` → `ui-monospace, monospace`.

### `.label-mono` utility

Small all-caps tags use Space Mono with explicit tracking — not `font-sans`:

```css
.label-mono {
  font-family: 'Space Mono', ui-monospace, monospace;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}
```

Use `.label-mono` (or `font-mono` + matching size/tracking) for: card labels, section headings, delta period labels, chart tab labels, table header cells.

### Type scale

| Role              | Size | Weight | Case / Style                      | Font            | Colour        |
|-------------------|------|--------|-----------------------------------|-----------------|---------------|
| Hero value        | 36px | 700    | —                                 | `font-sans`     | `text-primary`|
| Card value        | 24–28px | 700 | —                                 | `font-sans`     | `text-primary`|
| Sub-value         | 18px | 600    | —                                 | `font-sans`     | `text-primary`|
| Ticker / symbol   | 13px | 500    | Uppercase                         | `font-mono`     | `text-primary`|
| Section heading   | 11px | 600    | UPPERCASE, letter-spacing: 0.08em | `.label-mono`   | `text-primary`|
| Card label        | 11px | 400–600| Uppercase, letter-spacing: 0.06em | `.label-mono`   | `text-muted`  |
| Nav item          | 13px | 500–600| Sentence case                     | `font-sans`     | `text-inverted`|
| Body / paragraph  | 13px | 400    | —                                 | `font-sans`     | `text-primary`|
| Button            | 13px | 700    | Uppercase, letter-spacing: 0.04em | `font-sans`     | (see Buttons) |
| Table data        | 13px | 400–500| —                                 | `font-mono`     | `text-primary`|

### Rules

- **Labels** → Space Mono via `.label-mono` or `font-mono` with uppercase + tracking. This is the Swiss grid layer above plain brutalism.
- **Display numbers** (net worth, card totals, goal targets) → Space Grotesk via `font-sans` — bold, geometric, not terminal-style.
- **Tabular data** (holdings qty, price, allocation %) → `font-mono` for column alignment and precision.
- Do not use Space Grotesk for small tracked uppercase labels; do not use Space Mono for hero net worth figures.

---

## Spacing & Grid

| Token     | Value | Note                                      |
|-----------|-------|-------------------------------------------|
| Card gap  | 16px  |                                           |
| Card pad  | 28px  | Increased from 24px — Swiss breathing room|
| Page pad  | 28px  | Increased from 24px                       |
| Sidebar w | 240px |                                           |
| Header h  | 48px  |                                           |
| Section label margin-bottom | 12px | Space between label and card content |

---

## Borders & Shadows

### Borders
- All cards, inputs, buttons: `2px solid #111111`
- Placeholder / empty states: `2px dashed #bbbbbb`
- Border radius: **4px** (all elements — very slight softening, still brutalist)

### Offset Shadow (no blur — hard physical depth)

Shadow weight varies by element hierarchy:

| Element                    | Shadow                          |
|----------------------------|---------------------------------|
| Hero card (Net Worth etc.) | `6px 6px 0 <accent-shadow>`     |
| Standard card              | `4px 4px 0 <accent-shadow>`     |
| Button                     | `4px 4px 0 #111111`             |
| Input / form field         | `3px 3px 0 #111111`             |
| Badge / tag                | `3px 3px 0 #111111`             |

Hover interaction: shadow compresses to half (card lifts toward you):
- `6px → 3px`, `4px → 2px`, `3px → 1px` with `transform: translate(-2px, -2px)`

Active / pressed interaction: shadow zeroes out:
- `transform: translate(4px, 4px)` + `box-shadow: 0 0 0`

---

## Components

### Cards

**Default card** — white background
```
background:    #ffffff
border:        2px solid #111111
border-radius: 4px
box-shadow:    4px 4px 0 #111111
padding:       24px
```

**Accent card** — coloured fill
```
background:    <accent>
border:        2px solid #111111
border-radius: 4px
box-shadow:    4px 4px 0 <accent-shadow-tint>  (6px for hero cards)
padding:       24px
```

**Empty state inside a card**
```
border:        2px dashed #bbbbbb
border-radius: 4px
background:    transparent
text-align:    center
color:         #888888
padding:       32px
```

---

### Buttons

Three variants:

**Primary (solid black)**
```
background:    #111111
color:         #ffffff
border:        2px solid #111111
border-radius: 4px
box-shadow:    4px 4px 0 #111111
font-size:     14px
font-weight:   700
padding:       10px 20px
```

**Accent (e.g. Connect Account — uses mint #00c48c)**
```
background:    #00c48c
color:         #111111
border:        2px solid #111111
border-radius: 4px
box-shadow:    4px 4px 0 #111111
font-size:     14px
font-weight:   700
padding:       10px 20px
```

**Secondary / Ghost (outline — no fill)**
```
background:    #ffffff
color:         #111111
border:        2px solid #111111
border-radius: 4px
box-shadow:    none
font-size:     14px
font-weight:   600
padding:       10px 20px
```
Hover: `box-shadow: 3px 3px 0 #111111` (gains shadow on hover)

---

### Sidebar Navigation

```
sidebar-width:      240px
sidebar-background: #111111
border-right:       none
```

The sidebar is a black editorial spine. The logo/wordmark sits at the top in `text-inverted` (`#f0ede6`).

**Default nav item**
```
background:   transparent
color:        #999999  (muted on black)
font-size:    13px
font-weight:  500
padding:      10px 16px
border-left:  3px solid transparent
letter-spacing: 0.01em
```

**Active nav item** — accent fill varies by section (see Section → Accent Mapping)
```
background:   <section-accent>
color:        #111111
font-weight:  600
border-left:  3px solid <section-accent-shadow>
```

Active accent by section:
| Section      | Background    | Border-left |
|--------------|---------------|-------------|
| Dashboard    | `#c8f0d8` mint | `#1a6640`  |
| Assets       | `#f0e8c8` sand | `#7a6e00`  |
| Goals        | `#c9b8f0` purple | `#3d2880` |
| AI Advisor   | `#f7b3d1` pink | `#8a2050`  |
| Integrations | `#f5e642` yellow | `#7a6e00` |

**Hover**
```
background:   #222222  (subtle lift on black)
color:        #f0ede6
```

**Sidebar logo / wordmark**
```
color:         #f0ede6
font-size:     15px
font-weight:   600
letter-spacing: -0.02em
padding:       16px 16px 20px
border-bottom: 1px solid #333333
```

---

### Header

```
background:    #111111
height:        48px
padding:       0 24px
border-bottom: none
```

- Page title: left-aligned, `14px / 600`, `#ffffff`
- Right icons: `#ffffff`, 20px, Lucide outline style
- Sync timestamp: `12px / 400`, `#888888` (muted white on dark)

---

### Status Badges

```
border:        2px solid #111111
border-radius: 4px
font-size:     11px
font-weight:   600
padding:       2px 8px
box-shadow:    3px 3px 0 #111111
```

Fill by state:

| State        | Background      | Text      | Shadow    |
|--------------|-----------------|-----------|-----------|
| Positive     | `#c8f0d8` mint  | `#111111` | `#1a6640` |
| Negative     | `#e63946`       | `#ffffff` | `#111111` |
| Warning/Stale| `#f5e642` yellow| `#111111` | `#7a6e00` |
| Error        | `#f7b3d1` pink  | `#111111` | `#8a2050` |
| Neutral      | `#ffffff`       | `#888888` | `#111111` |

---

### Form Inputs

```
border:        2px solid #111111
border-radius: 4px
background:    #ffffff
padding:       10px 14px
font-size:     14px
box-shadow:    3px 3px 0 #111111
outline:       none
```

Focus:
```
box-shadow:      5px 5px 0 #111111
transform:       translate(-2px, -2px)
```

---

## Section → Accent Mapping

| Section / Card    | Accent        | Hex       |
|-------------------|---------------|-----------|
| Net Worth (hero)  | Mint          | `#c8f0d8` |
| Market Summary    | Sand          | `#f0e8c8` |
| AI Advisor        | Pink          | `#f7b3d1` |
| Goals             | Purple        | `#c9b8f0` |
| Warnings / Stale  | Yellow        | `#f5e642` |
| Default cards     | White         | `#ffffff` |

---

## What Is NOT Allowed

- Gradients of any kind
- Blurred drop shadows (`box-shadow` with non-zero blur radius)
- Border radius above **4px**
- CSS transitions longer than **150ms**
- Multiple font weights on the same line of text
- Decorative illustrations or stock imagery

---

## Tailwind Config Tokens (to implement)

These custom tokens should be added to `tailwind.config.js` when implementing:

```js
colors: {
  brand: {
    page:       '#f0ede6',
    border:     '#111111',
    header:     '#111111',
    sidebar:    '#111111',
  },
  accent: {
    mint:       '#c8f0d8',
    sand:       '#f0e8c8',
    yellow:     '#f5e642',
    pink:       '#f7b3d1',
    purple:     '#c9b8f0',
    active:     '#00c48c',
  },
  shadow: {
    mint:       '#1a6640',
    sand:       '#7a6e00',
    yellow:     '#7a6e00',
    pink:       '#8a2050',
    purple:     '#3d2880',
    black:      '#111111',
  },
  data: {
    positive:   '#00c48c',
    negative:   '#e63946',
  },
  text: {
    inverted:   '#f0ede6',
    muted:      '#888888',
    muted_inv:  '#666666',
  },
  dashed:       '#bbbbbb',
},
fontFamily: {
  sans:  ['"Space Grotesk"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
  mono:  ['"Space Mono"', 'ui-monospace', 'monospace'],
},
```

Add to `src/index.css` (or plugin):

```css
@layer utilities {
  .label-mono {
    font-family: 'Space Mono', ui-monospace, monospace;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }
}
```