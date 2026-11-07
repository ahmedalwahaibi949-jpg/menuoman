# Dine Oman: accounts, roles and restaurants

## Pages

| Page | Who | Purpose |
|---|---|---|
| `login.html` | Everyone | One login (email + password, or Google). Detects the role and redirects. Includes "Forgot password". |
| `signup.html` | Customers | "Discover Your Next Favourite Restaurant." Email signup or Google. |
| `owner-signup.html` | Restaurant owners | 4-step wizard: owner details → restaurant → branding → plan. |
| `auth-callback.html` | — | Landing page for email verification, Google sign-in and email-change links. |
| `reset-password.html` | — | Choose a new password from a reset link. |
| `customer.html` | Customers | My profile · Favourite restaurants · Recently viewed · My reviews · Account settings |
| `owner.html` | Owners | My restaurants · Application status page per restaurant · Add a branch · Account settings |
| `admin.html` | Super admin | Overview · Applications (approve/reject) · Restaurants (publish/unpublish) · Users (deletion requests) · Reviews · Settings |
| `restaurants.html` | Everyone | Discover live restaurants with filters |
| `restaurant.html?slug=…` and `/restaurant/<slug>` | Everyone | Public restaurant profile, favourites and reviews |
| `demo-inbox.html` | Demo only | Shows the emails demo mode would send |

`register.html` and `account.html` from the earlier version now redirect.

## How security works

The pages hide what a role shouldn't see, but **the database is what enforces it** (`supabase/schema.sql`, row-level security). A customer or owner who calls the API directly still can't read or change other people's data.

- **Roles** live in `user_profiles.role`. Sign-up can only create `customer` or `owner`. Even if someone sends `account_type: "admin"`, they get `customer`. Nobody can change their own role.
- **Admins** are created only in the SQL editor:
  ```sql
  update public.user_profiles set role = 'admin' where email = 'you@dineoman.com';
  ```
- **Owners** only see and edit their own restaurants. They can't approve, publish, change their slug, or change their plan after approval. The only status change they can make is resubmitting a rejected application.
- **Customers** only see their own favourites, history and reviews. Only customers can write reviews (one per restaurant), and reviews show a first name and initial.
- **Uploads**: before email verification, files can only go to `pending/<random-id>/…`. After that, owners upload only into `owners/<their-id>/…`.
- **Admin pages**: `admin.html` redirects non-admins before rendering, and every admin query is refused by the database for non-admins. Account deletion runs in a server function that checks the caller is an admin and keeps the service key off the browser.

## Owner registration flow

1. **Create the owner account.** The logo, cover and food photos are uploaded, then `auth.signUp` is called with the restaurant details.
2. **Verify email.** A database trigger creates the `user_profiles` row (role `owner`) and the restaurant with status `awaiting_verification`.
3. **Create the application.** When the owner clicks the email link, a trigger moves it to `pending`.
4. **Notify the admin.** The status change fires the `notifications` webhook, which emails every admin and sends the owner an "application received" email.
5. **Status page.** The owner sees it in `owner.html`, with a 5-step tracker.
6. **Approve or reject.** The admin does this in `admin.html#applications`, with a note to the owner.
7. **Public profile.** Approval creates it automatically: a trigger generates a unique slug (`bait-al-luban`, then `bait-al-luban-al-khuwair` for the next one with the same name, and so on) and publishes it at `/restaurant/<slug>`.
8. **More branches.** Owners add them from "Add a branch". Each is a separate application with its own approval and URL.

## Demo mode (now)

`SUPABASE_URL` is empty in `js/config.js`, so everything runs in the browser and emails go to `demo-inbox.html`.
- Demo admin login: `admin@dineoman.demo` / `DineAdmin2026`
- Google sign-in needs the live setup.
- "Reset demo" in the yellow bar clears everything.

## Going live

### 1. Supabase
1. Create a project (region: Mumbai or Frankfurt are closest to Oman).
2. SQL Editor → run `supabase/schema.sql`.
3. **Authentication → Providers → Email**: keep "Confirm email" **on**. Set the minimum password length to 8.
4. **Authentication → URL Configuration**: Site URL = your site. Redirect URLs: `…/dine-oman/auth-callback.html` and `…/dine-oman/reset-password.html`.
5. **Authentication → Providers → Google**: create an OAuth client in Google Cloud Console (type Web, redirect URI `https://<project-ref>.supabase.co/auth/v1/callback`) and paste the client ID and secret.
6. **Authentication → SMTP**: use Resend (or similar) so verification and reset emails come from your domain and aren't rate-limited.
7. Fill `SUPABASE_URL` and `SUPABASE_ANON_KEY` in `js/config.js`.
8. Sign up yourself, then make yourself admin with the SQL above.

### 2. Functions
```bash
supabase functions deploy notifications --no-verify-jwt
supabase functions deploy admin-delete-user
supabase secrets set RESEND_API_KEY=re_xxx WEBHOOK_SECRET=<long random string> \
  FROM_EMAIL="Dine Oman <partners@dineoman.com>" \
  SITE_URL=https://ahmedalwahaibi949-jpg.github.io/menuoman/dine-oman \
  PUBLIC_BASE_URL=https://ahmedalwahaibi949-jpg.github.io/menuoman
```
Then go to **Database → Webhooks**: table `restaurants`, events Insert and Update, POST to `https://<project-ref>.supabase.co/functions/v1/notifications`, with header `x-webhook-secret: <same string>`.

### 3. Restaurant URLs
`/restaurant/<slug>` is served by `404.html` at the repository root (GitHub Pages serves it for any unknown path, and it renders the restaurant page). With the current site the URL is `…github.io/menuoman/restaurant/<slug>`. For `dineoman.com/restaurant/<slug>`, point the domain at GitHub Pages (add a `CNAME` file) and set `PUBLIC_BASE_URL` to `https://dineoman.com` in `js/config.js` and in the function secrets.

### 4. Test checklist
Customer signup → verification email → dashboard · Google signup · wrong password · forgot/reset · owner signup → verify → admin email → approve → owner email with URL → public page works · customer favourite + review · change email/password · log out of all devices · deletion request → admin deletes.

## Known limits
- Plans are recorded but not billed: there's no payment step yet.
- Deletion requests aren't emailed to admins in live mode. They show as a badge in `admin.html#users`.
- Public pages render in the browser. For strong Google ranking of each restaurant, a server-rendered or pre-built page per restaurant is the next step.
