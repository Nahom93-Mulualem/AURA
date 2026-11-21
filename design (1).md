# Aura by HANI: Design Document

A showcase website for a perfume seller. Customers browse perfumes, view photos, and contact HANI directly through Telegram, Instagram, TikTok, Gmail or phone.

**Stack:** Next.js (frontend), Go (API), PostgreSQL (database)

---

## 1. Brand Identity

**Personality:** elegant, warm, personal, a little mysterious. This is a small personal brand, not a big corporate store. The design should feel like a boutique, not a marketplace.

**Keywords:** luxury, soft, glowing, intimate, feminine-leaning but welcoming to everyone.

**Tone of voice:** short, sensory sentences. Example: "Wear your aura." / "Scents that stay in memory."

---

## 2. Design Tokens

### Colors

| Role | Name | Hex |
|---|---|---|
| Background (dark) | Midnight Ink | `#0E0B10` |
| Surface (dark) | Velvet Plum | `#1A141F` |
| Background (light) | Ivory | `#FAF6F0` |
| Primary accent | Champagne Gold | `#C9A66B` |
| Secondary accent | Rose Dust | `#D9A5A0` |
| Text on dark | Soft White | `#F3EDE4` |
| Text on light | Deep Charcoal | `#1D1A1F` |
| Muted text | Stone | `#8C8590` |
| Success / Available | Sage | `#7FA68A` |
| Sold out | Clay | `#B5655C` |

Recommendation: use the dark theme as the main look (it makes bottle photos glow), and offer an optional light theme.

### Typography

- **Headings:** Cormorant Garamond or Playfair Display (elegant serif)
- **Body and UI:** Inter or Manrope (clean sans-serif)
- **Scale:** 12 / 14 / 16 / 20 / 28 / 40 / 64 px (hero title goes up to 80 px on desktop)
- **Letter-spacing:** wide on small uppercase labels (0.15em), such as "NEW ARRIVAL"
- **Line height:** 1.6 for body, 1.1 to 1.2 for big headings

### Spacing, radius and shadow

- 8 px spacing grid (8, 16, 24, 32, 48, 80, 120)
- Border radius: 12 px for cards, 999 px for buttons and tags
- Soft golden glow instead of hard shadows: `0 10px 40px rgba(201,166,107,0.15)`

---

## 3. Layout and Pages

1. **Home:** hero, featured perfumes, brand story teaser, why choose us, testimonials, contact call-to-action
2. **Collection:** grid of all perfumes with search and filters
3. **Perfume detail:** gallery, notes, price, size, order buttons
4. **About:** HANI's story and a photo of her
5. **Contact:** all channels, with a button for each
6. **FAQ and delivery info** (can be a section on Contact)
7. **Admin (private):** login, perfume list, add/edit form

Max content width: 1200 px, centered. Mobile first: design the 375 px layout before the desktop one.

---

## 4. Hero Section

**Goal:** make a visitor feel the brand in three seconds and click one button.

- Full viewport height, dark background with a slow, subtle moving gradient or a looping soft video (smoke, silk, light through glass)
- Floating perfume bottle image on the right (desktop) or below the text (mobile), with gentle up/down float and a soft glow behind it
- Small gold label: `AURA BY HANI`
- Headline (serif, large): "Wear Your Aura."
- One short supporting line
- Two buttons: **Explore Collection** (gold filled) and **Contact Me** (outlined)
- Scroll indicator at the bottom (small animated line or chevron)
- Optional parallax: bottle and background move at different speeds on scroll

Avoid: long paragraphs, more than two buttons, autoplaying sound, heavy video files (keep under 3 MB, with an image fallback).

---

## 5. Navigation Bar

**Desktop**
- Sticky, transparent over the hero, turning solid dark with a blur (`backdrop-filter`) after scrolling about 40 px
- Logo on the left, links centered (Home, Collection, About, Contact), small contact icons or a "Order Now" button on the right
- Active link has a thin gold underline that slides in on hover

**Mobile**
- Logo and hamburger icon
- Full-screen or slide-in menu with large links and the social icons at the bottom
- Close on link click and on pressing outside
- The menu locks page scroll while open

**Extra:** hide the navbar when scrolling down and show it when scrolling up, to save screen space on phones.

---

## 6. Perfume Card (Collection Grid)

- Portrait image (4:5 ratio), rounded corners, dark surface behind it
- **Hover (desktop):** image zooms slightly (1.05x), a second photo cross-fades in, and a "View" button slides up
- **Tap (mobile):** goes straight to the detail page
- Under the image: name (serif), short note line (for example "Oud, Vanilla, Amber"), price
- Status badge in the corner: Available, Sold out, New
- Skeleton loading placeholders while data loads
- Grid: 1 column on small phones, 2 on larger phones, 3 on tablets, 4 on desktop

---

## 7. Interactive Perfume Pictures

- **Gallery:** large main image with thumbnails; swipe on mobile, arrow keys on desktop
- **Zoom:** hover-follow zoom on desktop, pinch-to-zoom or tap-to-zoom on mobile
- **Lightbox:** click an image to open fullscreen with a dark overlay
- **Tilt and glow:** a light 3D tilt on the featured bottle following the mouse (disable on touch devices and for users who prefer reduced motion)
- **Image rules:** consistent background and lighting across all uploads, so ask HANI to photograph bottles in the same style, or crop them to the same ratio automatically
- **Fast loading:** WebP, blur placeholder, lazy loading below the fold, priority loading for the hero and first card row

---

## 8. Perfume Detail Page

- Left: gallery. Right: information
- Name, status badge, price, size (ml)
- **Scent pyramid:** top, heart and base notes shown as three small rows or an illustrated layered diagram
- Short story or mood paragraph (3 to 4 lines)
- Details: gender/category, longevity, best season or occasion (only if HANI provides them)
- **Order buttons:** Telegram, Instagram, WhatsApp (if she uses it), Call. Each opens the app with a prefilled message such as "Hi, I'm interested in [Perfume Name]"
- "You may also like" row at the bottom
- On mobile, keep a sticky "Order on Telegram" bar at the bottom of the screen

---

## 9. Footer

- Dark, slightly lighter than the page background, with a thin gold line on top
- **Column 1:** logo, one-line tagline
- **Column 2:** quick links (Home, Collection, About, Contact, FAQ)
- **Column 3:** contact details: phone, email
- **Column 4:** social icons (Telegram, Instagram, TikTok, Gmail) with gold hover effect
- Optional: "Join my Telegram channel" box for new arrivals
- Bottom bar: © Aura by HANI, current year. Optionally "Designed by [your name]" as small credit.
- Back-to-top button

---

## 10. Contact Section

One card per channel with an icon, label and handle:

| Channel | Link format |
|---|---|
| Telegram | `https://t.me/username` |
| Instagram | `https://instagram.com/username` |
| TikTok | `https://tiktok.com/@username` |
| Email | `mailto:email@gmail.com` |
| Phone | `tel:+000000000000` |

Open external links with `target="_blank"` and `rel="noopener noreferrer"`. Show the phone number as text too, so people can copy it. Add opening hours or typical reply time if HANI wants.

---

## 11. Motion and Animation

- Use **Framer Motion** (or CSS) for fade-up on scroll (opacity 0 to 1, 20 px upward, 0.6 s)
- Stagger card entry by 80 ms each
- Button hover: slight lift and gold glow
- Page transitions: quick fade
- Easing: `cubic-bezier(0.22, 1, 0.36, 1)`
- Respect `prefers-reduced-motion`: turn off parallax, tilt and floating
- Do not animate everything; one strong moment per section is enough

---

## 12. Admin Dashboard Design

Utility first, but still styled with the brand colors.

- Login page: simple centered card
- Perfume list: table (desktop) or cards (mobile) with thumbnail, name, price, status toggle, edit and delete
- Add/Edit form: name, description, price, size, notes, category, status, featured toggle
- Image uploader: drag and drop, multi-upload, preview, reorder, delete, progress bar
- Clear success and error messages (toasts) and a confirmation dialog before deleting
- Must work comfortably on a phone

---

## 13. Responsive Behavior

| Breakpoint | Width | Notes |
|---|---|---|
| Mobile | < 640 px | 1 or 2 column grid, hamburger menu, sticky order bar |
| Tablet | 640 to 1024 px | 3 column grid |
| Desktop | > 1024 px | 4 column grid, full navbar, hover effects |

Touch targets are at least 44 x 44 px. Test on a real low-end phone, since most visitors will come from social apps.

---

## 14. Accessibility

- Text contrast of at least 4.5:1 (check gold on dark and muted text)
- Alt text on every perfume image (use the perfume name)
- Full keyboard navigation with visible focus rings (gold outline)
- Semantic HTML: `header`, `nav`, `main`, `section`, `footer`
- Buttons that are only icons need an `aria-label`
- Do not rely on color alone for Sold out status; include text

---

## 15. Performance and SEO

- Target Lighthouse score of 90+ on mobile
- Use `next/image`, `next/font`, and static generation or ISR for perfume pages
- Unique `title` and `description` per perfume, clean URLs (`/perfumes/oud-royale`)
- **Open Graph and Twitter images** per perfume so shared links show a photo card in Telegram and Instagram
- `sitemap.xml`, `robots.txt`, and structured data (`Product` schema)
- Favicon and app icon in brand colors

---

## 16. Other Things to Consider

- **Authenticity trust:** a short "Original and authentic" note, and photos of real stock
- **Testimonials:** screenshots of customer chats (with permission) or short quotes
- **Language:** decide whether the site needs more than one language, and plan the text layout for it early
- **Currency and price display:** decide on the format and whether "Price on request" is allowed
- **Delivery and payment info:** short, clear, easy to find
- **Legal basics:** privacy note if you collect any data or use analytics
- **Analytics:** Plausible or Google Analytics, plus click tracking on the contact buttons
- **Backups:** automated PostgreSQL backups and a copy of the images
- **Content plan:** who writes descriptions and takes photos, and how often new perfumes are added
- **Empty and error states:** friendly "No perfumes yet" and "Something went wrong" screens, plus a 404 page in brand style

---

## 17. Component Checklist

- [ ] Navbar (desktop and mobile)
- [ ] Hero
- [ ] Section heading
- [ ] Perfume card and grid
- [ ] Filter and search bar
- [ ] Image gallery and lightbox
- [ ] Scent notes display
- [ ] Contact buttons and sticky order bar
- [ ] Testimonial card
- [ ] FAQ accordion
- [ ] Footer
- [ ] Toast, modal, skeleton loader
- [ ] Admin form and image uploader

---

## 18. Suggested Folder Structure (Next.js App Router)

```
/app
  /(site)
    page.tsx              # Home
    /collection/page.tsx
    /perfumes/[slug]/page.tsx
    /about/page.tsx
    /contact/page.tsx
  /admin
    /login/page.tsx
    /perfumes/page.tsx
    /perfumes/[id]/page.tsx
/components
  /ui                     # Button, Badge, Modal, Toast
  /layout                 # Navbar, Footer
  /perfume                # Card, Gallery, NotesPyramid
/lib                      # api client, helpers
/styles                   # tokens, globals
```

---

## 19. Design Principles (Summary)

1. Let the bottles be the stars; the UI should stay quiet.
2. One clear action per screen: order or contact.
3. Mobile first, always.
4. Luxury comes from space, type and restraint, not decoration.
5. Fast beats fancy. Remove any effect that slows the page.
