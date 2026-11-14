# Design

The storefront's visual system, as built. The colour and type stay quiet, so that the products' photos lead.

## Principle: Airbnb's structure, e-commerce conventions

The overall structure follows Airbnb's site: the sticky header with the search in the middle, the category tabs, the wide grid of photo cards, the account pages, the footer band, and the tab bar along the bottom on phones. It borrows the structure only, never Airbnb's colour, font, logo, or icons.

Wherever shopping has a convention that shoppers already know, that convention wins: the product gallery, the purchase panel with the price, options, and Add to cart, the cart, checkout, and the product search. When the two disagree, choose what a shopper expects from an online shop.

The storefront is white-label. A store changes its look in two places only: the brand colour in `src/styles/globals.css`, and the logo in `src/config/brand.ts`. Everything below stays the same for every store.

## Colour

Defined once, as CSS variables in `src/styles/globals.css`, and used through Tailwind's colour names.

| Token                           | Value                 | Use                                                                                                   |
| ------------------------------- | --------------------- | ----------------------------------------------------------------------------------------------------- |
| `--brand`                       | `#0f766e` (default)   | The one accent: main buttons, the search button, the cart count, the selected tab, focus rings, links |
| `--brand-hover`                 | `#0b5d57`             | The brand colour under the pointer                                                                    |
| `--brand-foreground`            | `#ffffff`             | Text on the brand colour. Set it to whichever of white or near-black reads better                     |
| `--foreground`                  | `#222222`             | Text, selected option pills, the current page number                                                  |
| `--muted-foreground`            | `#6a6a6a`             | Secondary text: option summaries, dates, hints                                                        |
| `--background`                  | `#ffffff`             | The page                                                                                              |
| `--muted`                       | `#f7f7f7`             | Photo placeholders, the footer band, totals panels, hover rows                                        |
| `--control` / `--control-hover` | `#f2f2f2` / `#ebebeb` | The header's round icon buttons                                                                       |
| `--border`                      | `#dddddd`             | Card and field outlines                                                                               |
| `--hairline`                    | `#ebebeb`             | Dividers between rows and sections                                                                    |
| `--input`                       | `#b0b0b0`             | Form field outlines                                                                                   |
| `--destructive`                 | `#b42318`             | Errors, out of stock                                                                                  |
| `--sale`                        | `#c2410c`             | Sale prices and the Sale badge, so a deal reads apart from errors                                     |

Rules:

- One accent colour. Do not add a second; state colours (red for errors, amber for an order waiting for payment) appear only where they carry meaning.
- Text on white must reach 4.5:1. `--muted-foreground` is the lightest text colour allowed.
- Text selection, the text cursor, scrollbars, and focus rings follow the theme.

## Type

- **Figtree**, from `next/font`, which downloads it at build time and serves it from the site.
- Weights: 400 for text, 600 for names, prices, labels, and headings, 800 for the wordmark only.
- Sizes: page titles 28–32px (40px for blog posts), section headings 22px, card names 14–15px, body 15–17px, labels and hints 12–14px.
- Prices and counts use tabular figures (`tabular-nums`), so that columns of money line up.
- Headings use `text-balance`, and long text keeps to `max-w-prose`.

## Shape and depth

- **Corners:** 12px (`rounded-xl`) for photos, cards, and panels; 8px (`rounded-lg`) for buttons, fields, and thumbnails; fully round (`rounded-full`) for search, tabs, option pills, the quantity stepper, and icon buttons.
- **Shadows:** `shadow-raise` (small, close) for resting pills; `shadow-float` (soft, wide) for anything that floats: the search panel, menus, the purchase card, the summary cards, the account cards. Shadows always have an offset and a soft blur; no hard offset shadows, no coloured glows.
- **Lines:** 1px `--hairline` dividers between rows and sections, rather than boxes around everything.

## Spacing and layout

- `page-x` sets the page's side margins: 24px on phones, 40px on tablets, 80px from 1280px, within a maximum width of 1760px.
- The product grid (`productGridClass` in `src/features/catalog/grid.ts`) has two columns on phones, three from 768px, and four from 1024px, never more.
- Product photos are 20:19 (`productImageClass`).
- Two-column pages (product, cart, checkout) put the main content on the left and a card on the right, 20–26rem wide, that stays in view (`sticky top-32`). On phones the card follows the content.
- Sections are separated by space and a hairline, with more space above a heading than below it.

## Page patterns

| Area          | Pattern                                                                                                                                                                                                                                                                                                                        |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Header        | Logo, product search in the middle, "All products" and "Blog" links, and the round cart and account buttons. On phones, the logo and the cart.                                                                                                                                                                                 |
| Phones        | The header holds the logo and the cart button. A tab bar along the bottom: Home, Search (opens the full-screen search), Products, and Account. Hidden on checkout.                                                                                                                                                             |
| Category tabs | On the product lists, not the home page: a sticky, sideways-scrolling row of round category images with names; the selected one is underlined.                                                                                                                                                                                 |
| Home          | Banners, then "Shop by category" as large round icons or images, then sideways rows of product cards: on sale, new arrivals, then one per top-level category, each with "Show all".                                                                                                                                            |
| Banner        | Full width on phones, meeting the header (4:5 with a phone image, else 2:1), a rounded 3:1 band on wider screens; title over a dark fade; dots; no autoplay. If the phone image fails, the wide one shows; if both fail, the plain background.                                                                                 |
| Product card  | A photo carousel that swipes on touch and steps with arrows on hover, the name, a line such as "2 sizes · 2 colors", and the price. On sale: a "Sale" badge, the price in `--sale`, the old price struck through, and the promotion's name.                                                                                    |
| Product page  | A large photo with a row of thumbnails on the left; the title, price, options, and Add to cart on the right, staying in view; a bar with Add to cart above the tab bar on phones. On sale: the old price struck through, "Save 20%", and "Sale ends in", counting down in the last day. Promotions are listed with a tag icon. |
| Cart          | Lines with a round quantity stepper, beside an order summary card.                                                                                                                                                                                                                                                             |
| Checkout      | "Confirm and pay": sections separated by hairlines, addresses and payment methods as large selectable cards, and a summary card with the coupon field, discounts in `--sale` below the subtotal, and "Add ₱X more for free shipping".                                                                                          |
| Order         | The status with a coloured dot, a payment card outlined in near-black while payment is due, the items, and a grey totals panel.                                                                                                                                                                                                |
| Login         | A centred card with a title bar and a welcome line. Phones show it without the frame.                                                                                                                                                                                                                                          |
| Account       | Cards with an icon, a title, and a line of text. Sub-pages show a breadcrumb back to the account.                                                                                                                                                                                                                              |
| Blog          | Cards with a 3:2 cover photo; posts in a readable column with a large cover.                                                                                                                                                                                                                                                   |
| Footer        | A grey band with Shop, Help, and the store's links, then © and "Prices in PHP · Ships within the Philippines".                                                                                                                                                                                                                 |

## Components

- **Buttons** (`src/components/ui/button.tsx`): semibold; 40px tall by default and 48px (`size="lg"`) for the main action on a page. The main action is brand-coloured and full width in cards. Secondary actions are outlined in near-black.
- **Fields** (`src/components/ui/input.tsx`, `Field`): 48px tall, a grey outline, and a near-black outline when focused. The label sits above, and the hint or error below.
- **Option pills** (`OptionPicker`): round, outlined; the chosen value is filled near-black; a value that does not exist with the other option is dashed and struck through.
- **Selectable cards** (`ChoiceCard`): an icon, a title and a line of text, and the radio on the right; the chosen card has a near-black outline.
- **Round icon buttons** (`headerButtonClass`): 44px circles in `--control`.
- **Skeletons** (`src/components/skeletons.tsx`): shaped like the content they stand in for, announced to screen readers, and still for people who ask for less motion.
- Icons come from `lucide-react`, at a 1.5–2 stroke. No emoji or text characters stand in for icons.

## State

- Selection, such as the chosen option or card, is drawn from React's state, never from `:has(:checked)` alone, which browsers do not always restyle when a radio is unchecked by choosing another.
- Loading shows a skeleton shaped like the content; small waits inside a section show a line of text.
- Empty states say what is missing and offer the next step, such as "Start shopping".
- Photos that fail to load show a quiet placeholder (`FallbackImage`), never the browser's broken-image icon.
- Disabled buttons fade to half opacity. A sold-out variant's button reads "Sold out".

## Motion

- Short colour and shadow transitions on hover and focus, and a smooth scroll for carousels and category tabs.
- The full-screen search and photo views fade and rise in slightly.
- Pulses and slides stop when the shopper asks for less motion (`motion-safe:`).

## Changing the design

- Change the brand colour and logo per store, as above. Other values are shared by every store.
- Reuse the patterns above before adding a new one, and keep one accent colour.
- Keep each page usable at 390px wide, with no sideways scrolling, and check it at 768px and 1440px.
