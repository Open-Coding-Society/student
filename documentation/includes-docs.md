---
layout: base
title: Includes folder documentation
hide: true
permalink: /includes_docs
nav: true
toc: true
search_exclude: false
---

## Folder Structure Reorganization

The `_includes` directory was originally cluttered with many flat files (student_2025). We introduced a modular folder structure for clarity and separation of purpose.

### Before

```
_includes/
├── custom-head.html
├── favicons.html
├── google-analytics.html
├── notebook_binder_link.html
├── notebook_colab_link.html
├── notebook_deepnote_link.html
├── notebook_github_link.html
├── post_category_blocks.html
├── post_list.html
├── post_list_image_card.html
├── toc.html
├── utterances.html
├── screenshot
└── theme/
```

### After

```
_includes/
├── head/
│   └── custom-head.html
├── layout/
│   └── post_meta_block.html
├── nav/
│   ├── pair_programming.html
│   └── tools_setup.html
├── notebooks/
│   ├── badge.html
│   └── badge_block.html
├── posts/
│   ├── post_category_blocks.html
│   ├── post_list.html
│   └── post_list_image_card.html
├── theme/
├── favicons.html
├── google-analytics.html
└── screenshot
└── etc.
```

---

## File Consolidations

### layout/post_meta_block.html

**Consolidated:**
- `toc.html`
- `utterances.html`

**New unified include:**

```liquid
% include layout/post_meta_block.html html=content %
```

**Supports front matter flags:**
```html
toc: true / false
comments: true / false
show_reading_time: true / false
```

The logic inside the block checks for these flags and conditionally displays the relevant sections.

---

### notebooks/badge_block.html

**Consolidated:**
- `notebook_binder_link.html`
- `notebook_colab_link.html`
- `notebook_deepnote_link.html`
- `notebook_github_link.html`

**Replaced with single call:**
```liquid
% include notebooks/badge_block.html %
```

---

## Layout & Include Updates

### Old badge section (now removed from layouts):
```liquid
% include notebook_github_link.html %
% include notebook_binder_link.html %
% include notebook_colab_link.html %
% include notebook_deepnote_link.html %
```

### Now replaced with:
```liquid
% include notebooks/badge_block.html %
```

---

### Old meta content:
```liquid

% include toc.html html=content %
% include utterances.html %

```

### Now replaced with:
```liquid
% include layout/post_meta_block.html html=content %
```
---

---

## File Deletions

The following files were safely removed after being consolidated:

- `toc.html`
- `utterances.html`
- `post_list.html` (after verifying no active includes)
- All individual `notebook_*_link.html` files

---

<img src="{{site.baseurl}}/images/layout-post.drawio.svg">

---

## Final Result

All changes were verified via `make`, and the Jekyll build now compiles successfully. The project now benefits from:

- Reduced duplication
- Cleaned-up `_includes` structure
- Simpler and more reusable layout logic