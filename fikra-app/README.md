# FIKRA DIGITAL website

React + TypeScript + Tailwind CSS, with Supabase for accounts and data.
Source lives here in `fikra-app/`. The built site is committed to `../fikra/` so GitHub Pages can serve it with no build step.

## Pages

| Route | What it is |
|---|---|
| `#/` | Home: hero, services, concept work, why FIKRA, process, call to action |
| `#/services`, `#/services/:slug` | Four services, each with its own page, features, benefits and price or quote |
| `#/portfolio`, `#/portfolio/:slug` | Six concept projects with category filter; each opens a case study with a working demo |
| `#/pricing` | Starter 149, Professional 299, Premium 499 OMR; what's included, what costs extra; custom SaaS quotes |
| `#/about` | Mission, vision, values, approach |
| `#/contact` | Enquiry form, WhatsApp, email, Instagram, LinkedIn |
| `#/portal` | Client login and registration; projects, progress, requests, invoices, support, account |
| `#/admin` | Administrator dashboard |

The admin dashboard manages: enquiries, customers, projects and progress, portfolio, service descriptions, pricing, testimonials, website content (contact details, About page) and basic analytics.

Arabic and English are both built in, with right-to-left layout for Arabic. The switch is in the header.

## Demo mode and live mode

Without Supabase keys the site runs in **demo mode**: accounts, enquiries and edits are saved in the visitor's own browser. Use it to try everything.
Demo administrator: `admin@fikra.demo` / `FikraAdmin2026`.

To go live:

1. Create a Supabase project. In **SQL Editor**, run `supabase/schema.sql`.
2. Copy `.env.example` to `.env` and fill in the project URL and anon key (Project Settings → API).
3. `npm install && npm run build`, then commit the updated `../fikra/` folder.
4. Open the site, register with your own email in the client portal, then make yourself the administrator in the SQL Editor:
   ```sql
   update public.profiles set role = 'admin' where email = 'you@example.com';
   ```
5. In Supabase → Authentication → URL Configuration, add the site URL so confirmation and reset links come back to it.

## Security

The pages hide what a role should not see, but the **database** enforces it (`supabase/schema.sql`, row-level security):

- Sign-up always creates a `customer`. The administrator role can only be granted in the SQL Editor.
- Visitors can send an enquiry and record a page view. They cannot read either back.
- Customers read only their own projects, requests, invoices, messages and files. They can submit requests and messages, and edit their own name, company and phone.
- Only the administrator can create or change projects, invoices, website content and enquiries.
- Project files are in a private storage bucket, one folder per customer.

## Before launch

- **Contact details are placeholders.** Replace them in Admin → Website content.
- **Portfolio items are concepts**, labelled as such on the site. Replace them with client work as it becomes available.
- **Testimonials are empty.** Add only real ones, with permission. Nothing shows until published.
- **Enquiry notifications:** new enquiries appear in the admin dashboard. There is no email alert yet.
- **File uploads:** the storage bucket and its rules exist, but the dashboard has no upload screen yet.
- **Search engines:** routes use `#/…` so the site works on GitHub Pages without server setup. Search engines index the home page well but treat hash routes as one page. For per-page ranking, move to a host with path routing or add pre-rendering.

## Develop

```bash
npm install
npm run dev      # local preview
npm run build    # type-check and build into ../fikra
```

## Menu Board Studio (self-service subscription)

Restaurants sign up, build their menu and pay without contacting anyone.

| Page | Address |
|---|---|
| Designs, price and "Start free" | `#/menu-boards` |
| Restaurant dashboard | `#/studio` |
| TV screen | `#/display/<menu id>?screen=1&of=2` |
| QR phone menu | `#/m/<menu id>` |
| Photo credits | `#/credits` |

How the subscription works:

1. Saving a menu starts a 14-day free trial. The TV screens and the QR menu work during the trial.
2. In the dashboard, **Subscription** shows the price, your bank details and a receipt upload. The restaurant transfers the money and uploads a photo of the receipt.
3. In **Admin → Menu boards → Transfers to confirm** you open the receipt, check the money arrived in your bank, and press **Confirm**. That extends the restaurant by the months paid for.
4. When the trial or the paid period ends, the TV screens and QR menu show "This menu is paused" until the next payment is confirmed.

Before selling, in **Admin → Menu boards** set the monthly price (default 9 OMR; 12 months are charged as 10) and your bank name, account name and account number. Until the account number is filled in, restaurants see "contact us" instead of the transfer form.

Limits to know about:

- Payment is by bank transfer with manual confirmation. Card payment needs a payment gateway account, which needs a commercial registration.
- No emails are sent. You see new transfers when you open the admin page.
- The trial length (14 days) is set in two places that must match: `TRIAL_DAYS` in `src/lib/store.ts` and `board_live()` in `supabase/schema.sql`.
- In demo mode (no Supabase keys) everything is stored in one browser only. Connect Supabase before giving the link to real customers.
- Food photos in the sample designs come from Wikimedia Commons (public domain, CC0 and CC BY). `public/boards/credits.json` lists each photographer and licence; keep the credits page online.
