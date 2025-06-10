---
layout: base
title: Theme Switching and Navigation Logic Documentation
hide: true
permalink: /theme_and_nav_docs
toc: true
search_exclude: false
---

This is an internal system design — you should fully understand how your `_config.yml`, front matter, layout files, and navigation interact depending on the theme you choose.

---

## Table of Contents

1. Theme Declaration (`_config.yml`)
2. Front Matter Layout Declaration (`layout: base`)
3. `base.html` Logic: Theme Detection
4. Theme Layout Includes
    - `minimal_default.html`
    - `minima_default.html`
5. Navigation System
    - Navigation in Minimal
    - Navigation in Minima
6. Styling
    - TailwindCSS for Minimal
    - SASS Skins for Minima
7. Important Notes

---


<img src="{{ site.baseurl }}/images/theme_switch.drawio.svg">


---

## 1. Theme Declaration (`_config.yml`)

Your theme is declared in `_config.yml` at the root of the repository.

To use the **Minimal** theme:

```yaml
remote_theme: opencodingsociety/minimal@v0.2.0
```

To use the **Minima** theme:

```yaml
remote_theme: jekyll/minima
```

This remote theme declaration determines which CSS/JS, layout includes, and navigation logic will be used.

---

## 2. Front Matter Layout Declaration (`layout: base`)

In every page or post, you should declare the base layout in the front matter:

```yaml
layout: base
```

This ensures that `base.html` will control the dynamic switching logic.

Example full front matter:

```yaml
---
layout: base
title: My Post Title
nav: true
---
```

---

## 3. `base.html` Logic: Theme Detection

Here is the logic in `base.html`:

```html
<!DOCTYPE html>
<html lang="{{ page.lang | default: site.lang | default: 'en' }}">

</html>
```

### What This Does:
- If `remote_theme` contains `minimal@v0.2.0`, it includes `minimal_default.html`.
- If `remote_theme` contains `minima`, it includes `minima_default.html`.

The `base.html` is acting like a smart router that switches the layout depending on your theme.

---

## 4. Theme Layout Includes

### `minimal_default.html`

This layout is structured for Tailwind CSS based design — simple, clean, and flexible.

It uses Tailwind utility classes to handle spacing, sidebar, and responsive behavior.

It also defines a custom navigation logic (explained below).

---

### `minima_default.html`

This layout uses the standard **Minima** theme structure.

It inherits SASS styling and includes default header, footer, and content areas as provided by Minima.

The navigation and structure are entirely based on Jekyll’s default Minima logic.

---

## 5. Navigation System

The navigation bar is **different depending on the theme**.

---

### Navigation in Minimal

Minimal uses **front matter** to determine navigation links. Pages must explicitly opt-in to navigation.

Here is the logic:

```html
<!-- NAVIGATION -->
<nav class="mb-10 border-b pb-4 flex flex-col gap-2 text-sm text-blue-600">
  {% assign nav_pages = site.pages | where_exp: "page", "page.nav == true" %}
  {% for nav_page in nav_pages %}
    <a href="{{ nav_page.url | relative_url }}" class="hover:underline">{{ nav_page.title | escape }}</a>
  {% endfor %}
</nav>
```

### How to Add a Page to the Navigation Bar in Minimal

In your page’s front matter, add:

```yaml
nav: true
```

This opt-in system gives you full control over what shows up in the sidebar.

---

### Navigation in Minima

Minima uses the `_config.yml` file to configure the navigation:

```yaml
# Example _config.yml
header_pages:
  - about.md
  - contact.md
  - blog.md
```

You list the page filenames under `header_pages`, and they will be included in the top navbar automatically.

There is **no need for `nav: true` front matter** in Minima — the system is entirely controlled by `_config.yml`.

---

## 6. Styling

### TailwindCSS for Minimal

When using the **Minimal** theme:

- TailwindCSS (via CDN) is loaded in the `<head>` to provide utility classes for layout.
- Only layout is controlled by Tailwind. Markdown typography is preserved via the original CSS (`style.css` from Minimal or custom).

No Tailwind Typography plugin is used, to prevent interference with Markdown.

---

### SASS Skins for Minima

When using the **Minima** theme:

- SASS customization is supported via `_sass/minima/custom-styles.scss`.
- You can modify or extend Minima’s appearance by editing this SASS file.

Example snippet in `custom-styles.scss`:

```scss
// Custom color overrides
$primary-color: #1a202c;
$link-color: #3182ce;
```

Changes here allow you to apply a custom "skin" to Minima without disrupting its structure.

---

## 7. Important Notes

- Pages using `layout: base` must rely on the `remote_theme` value to determine final rendering.
- **Minimal** is designed for simplicity and modern layouts with Tailwind.
- **Minima** is designed for traditional blog structures with SASS theming.
- Markdown styling is preserved under Minimal by *not* using Tailwind Typography plugin.
- Navigation must be properly configured depending on the theme:
  - Minimal: via `nav: true` in front matter.
  - Minima: via `header_pages` in `_config.yml`.
- Issue templates and PR templates are available under `.github/` to guide contributions.

---