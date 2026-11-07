# Dine Oman: restaurant registration

Three pages, served by GitHub Pages from this folder:

| Page | Who uses it | What it does |
|---|---|---|
| `register.html` | Restaurant owners | Application form with live listing preview and package choice |
| `account.html` | Owners | Email sign-in (no password), application status, profile completion after approval |
| `admin.html` | Your team | Review queue, approve or reject with a note |

## The flow

1. Owner submits the form. Logo and cover are uploaded to storage, and the application is saved with status `pending` and a reference like `DO-3F81A2`.
2. All fields are saved in the `applications` table.
3. The owner gets a confirmation email (bilingual) with the reference.
4. The admin team gets a "New application" email, and the admin page shows a "New since last visit" count.
5. An admin approves or rejects. The owner is emailed the decision and the admin's note.
6. After approval the owner signs in with the same email and completes the profile: Arabic name and description, opening hours, price range, features, signature dishes, menu, and up to 12 photos. Publishing sets it live.

Owners can't approve themselves: the database forces every new application to `pending`, and only emails in the `admins` table can change status.

## Demo mode (now)

With `SUPABASE_URL` empty in `js/config.js`, everything runs in the browser: applications, approval and profiles are stored in localStorage and no emails are sent. A yellow bar says so on every page.

## Going live (about 30 minutes)

### 1. Supabase project
1. Create a project at supabase.com (choose a region near Oman, such as Mumbai or Frankfurt).
2. **SQL Editor** → paste and run `supabase/schema.sql`.
3. Add your admins in SQL Editor:
   ```sql
   insert into public.admins (email) values ('you@dineoman.com');
   ```
4. **Authentication → URL Configuration**: set Site URL to your site, and add these redirect URLs:
   `https://ahmedalwahaibi949-jpg.github.io/menuoman/dine-oman/account.html` and `.../admin.html`.
5. **Project Settings → API**: copy the Project URL and the `anon` public key into `js/config.js`. Update `SITE_URL` if you use your own domain.

### 2. Emails (Resend)
1. Create a Resend account, verify your sending domain (for example dineoman.com), and create an API key.
2. Deploy the function with the Supabase CLI:
   ```bash
   supabase functions deploy application-emails --no-verify-jwt
   supabase secrets set RESEND_API_KEY=re_xxx WEBHOOK_SECRET=<long random string> \
     ADMIN_EMAIL=you@dineoman.com FROM_EMAIL="Dine Oman <partners@dineoman.com>" \
     SITE_URL=https://ahmedalwahaibi949-jpg.github.io/menuoman/dine-oman
   ```
   `ADMIN_EMAIL` can be several addresses separated by commas.
3. **Database → Webhooks**: create one webhook on table `applications`, events **Insert** and **Update**, type HTTP POST to
   `https://<project-ref>.supabase.co/functions/v1/application-emails`, with header `x-webhook-secret: <same random string>`.
4. Sign-in links are sent by Supabase Auth. For production, set **Authentication → SMTP** to Resend too, so they come from your domain and aren't rate-limited.

### 3. Test
Submit a test application, check both emails arrive, approve it in `admin.html`, open the approval email, sign in and publish the profile.

## Things to confirm before launch
- **Package prices** in `js/config.js` (Featured OMR 15, Premium OMR 35) are placeholders. There is no payment step: the form says packages are confirmed after approval.
- **Instagram and Website are required**, as specified. Many cafés and bakeries have no website, so consider making it optional (remove `website` from `rules` in `js/register.js` and the `not null` in the schema).
- **Spam**: anyone can submit the form. If spam appears, add Cloudflare Turnstile or hCaptcha (Supabase Auth → Bot protection).
- Published restaurants are available to future directory pages through `select * from list_live_restaurants()`.
