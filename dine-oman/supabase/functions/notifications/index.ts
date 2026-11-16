// Dine Oman: restaurant application emails.
// Triggered by a Database Webhook on public.restaurants (INSERT and UPDATE).
//   status becomes 'pending'             → "application received" to the owner + alert to every admin
//   status becomes 'approved'/'rejected' → decision to the owner (approval includes the public URL)
// Secrets: RESEND_API_KEY, WEBHOOK_SECRET, FROM_EMAIL, SITE_URL, PUBLIC_BASE_URL
// SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are provided automatically.
import { createClient } from "npm:@supabase/supabase-js@2.45.4";

const env = (k: string, d = "") => Deno.env.get(k) ?? d;
const SITE_URL = env("SITE_URL").replace(/\/$/, "");               // where dine-oman/*.html is served
const PUBLIC_BASE_URL = env("PUBLIC_BASE_URL", SITE_URL).replace(/\/$/, ""); // where /restaurant/<slug> lives
const FROM = env("FROM_EMAIL", "Dine Oman <partners@dineoman.com>");
const admin = createClient(env("SUPABASE_URL"), env("SUPABASE_SERVICE_ROLE_KEY"), { auth: { persistSession: false } });

type R = { id: string; owner_id: string; reference: string; status: string; slug: string | null; plan: string;
  name: string; category: string; cuisine: string; governorate: string; city: string; area: string;
  logo_url: string; contact_phone: string; instagram: string; website: string; admin_note: string | null };
type Payload = { type: "INSERT" | "UPDATE" | "DELETE"; table: string; record: R; old_record: R | null };

const esc = (s: unknown) => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
const PLAN: Record<string, string> = { free: "Free", standard: "Standard", premium: "Premium", featured: "Featured" };
const btn = (href: string, label: string) =>
  `<p style="margin:22px 0"><a href="${esc(href)}" style="background:#E2A238;color:#121D1C;text-decoration:none;font-weight:600;padding:13px 22px;border-radius:99px;display:inline-block">${esc(label)}</a></p>`;
const box = (html: string, bg = "#EBF0EC") => `<p style="background:${bg};border-radius:12px;padding:14px 16px">${html}</p>`;

function layout(title: string, body: string, ar = "") {
  return `<!doctype html><html><body style="margin:0;background:#F5F6F2;font-family:Segoe UI,Helvetica,Arial,sans-serif;color:#121D1C">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:28px 12px">
  <table role="presentation" width="100%" style="max-width:560px;background:#fff;border-radius:16px;overflow:hidden" cellpadding="0" cellspacing="0">
  <tr><td style="background:#0C3B3A;color:#EFE6D6;padding:22px 28px;font-size:20px;font-weight:700">Dine Oman <span style="font-weight:400;opacity:.8">· داين عُمان</span></td></tr>
  <tr><td style="padding:28px;font-size:15.5px;line-height:1.6"><h1 style="font-size:24px;line-height:1.2;margin:0 0 14px">${title}</h1>${body}
  ${ar ? `<p dir="rtl" style="margin-top:22px;padding-top:18px;border-top:1px solid #DCE3DE;text-align:right;color:#5A6863">${ar}</p>` : ""}</td></tr>
  <tr><td style="padding:18px 28px;background:#EBF0EC;font-size:12.5px;color:#5A6863">Every restaurant. One destination. · كل المطاعم. وجهة وحدة.</td></tr>
  </table></td></tr></table></body></html>`;
}

async function send(to: string | string[], subject: string, html: string) {
  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${env("RESEND_API_KEY")}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: FROM, to: Array.isArray(to) ? to : [to], subject, html })
  });
  if (!r.ok) throw new Error(`Resend ${r.status}: ${await r.text()}`);
}

Deno.serve(async req => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });
  if (!env("WEBHOOK_SECRET") || req.headers.get("x-webhook-secret") !== env("WEBHOOK_SECRET")) return new Response("Unauthorized", { status: 401 });
  const p = (await req.json()) as Payload;
  if (p.table !== "restaurants" || p.type === "DELETE") return new Response("ignored");
  const r = p.record, before = p.old_record?.status;
  if (before === r.status) return new Response("no status change");

  const { data: owner } = await admin.from("user_profiles").select("email, full_name").eq("id", r.owner_id).single();
  if (!owner) return new Response("owner not found", { status: 404 });
  const hello = `Hello ${esc((owner.full_name || "").split(" ")[0] || "there")},`;
  const statusUrl = `${SITE_URL}/owner.html#r-${r.id}`;
  const sent: string[] = [];

  try {
    if (r.status === "pending") {
      await send(owner.email, `Application received · ${r.reference}`, layout("We've received your application",
        `<p>${hello}</p><p>Thank you for registering <b>${esc(r.name)}</b>. Your application is now <b>pending approval</b>. We'll email you as soon as our team has reviewed it.</p>
         ${box(`<b>Reference:</b> ${esc(r.reference)}<br><b>Plan:</b> ${esc(PLAN[r.plan])}<br><b>Location:</b> ${esc(r.area)}, ${esc(r.city)}, ${esc(r.governorate)}`)}
         ${btn(statusUrl, "View application status")}`,
        `استلمنا طلب تسجيل <b>${esc(r.name)}</b> وهو الحين قيد المراجعة. رقم الطلب ${esc(r.reference)}.`));
      sent.push("owner-received");

      const { data: admins } = await admin.from("user_profiles").select("email").eq("role", "admin");
      const to = (admins ?? []).map(a => a.email);
      if (to.length) {
        await send(to, `New restaurant application: ${r.name}`, layout(`New application: ${esc(r.name)}`,
          `<p><img src="${esc(r.logo_url)}" alt="" width="64" height="64" style="border-radius:12px;border:1px solid #DCE3DE;object-fit:contain"></p>
           <p><b>${esc(r.name)}</b> · ${esc(r.category)} · ${esc(r.cuisine)}<br>${esc(r.area)}, ${esc(r.city)}, ${esc(r.governorate)}<br>
           Plan: <b>${esc(PLAN[r.plan])}</b><br>Owner: ${esc(owner.full_name)} · ${esc(owner.email)}<br>Contact ${esc(r.contact_phone)} · @${esc(r.instagram)}</p>
           ${btn(`${SITE_URL}/admin.html#applications`, "Review application")}<p style="color:#5A6863;font-size:14px">${esc(r.reference)}</p>`));
        sent.push(`admins:${to.length}`);
      }
    } else if (r.status === "approved") {
      const url = `${PUBLIC_BASE_URL}/restaurant/${r.slug}`;
      await send(owner.email, `${r.name} is approved and live`, layout(`${esc(r.name)} is approved`,
        `<p>${hello}</p><p>Your restaurant is approved and its public page is live:</p>${box(`<a href="${esc(url)}">${esc(url)}</a>`, "#E3F3EA")}
         ${r.admin_note ? box(`<b>Note from our team:</b> ${esc(r.admin_note)}`) : ""}
         <p>Sign in to add opening hours, your menu, price range and more photos.</p>${btn(`${SITE_URL}/owner.html#r-${r.id}`, "Open restaurant dashboard")}`,
        `مبروك! تمت الموافقة على ${esc(r.name)} وصفحته الحين منشورة على داين عُمان.`));
      sent.push("owner-approved");
    } else if (r.status === "rejected") {
      await send(owner.email, `Update on your Dine Oman application`, layout(`About ${esc(r.name)}`,
        `<p>${hello}</p><p>We weren't able to approve this application yet.</p>${r.admin_note ? box(`<b>Reason:</b> ${esc(r.admin_note)}`, "#FBE7E6") : ""}
         <p>You can update the details from your dashboard and submit it again.</p>${btn(statusUrl, "View application")}`,
        `للأسف ما قدرنا نوافق على الطلب حالياً. تقدر تعدّل المعلومات من لوحة التحكم.`));
      sent.push("owner-rejected");
    }
  } catch (e) {
    console.error(e);
    return Response.json({ ok: false, error: String(e), sent }, { status: 502 });
  }
  return Response.json({ ok: true, sent });
});
