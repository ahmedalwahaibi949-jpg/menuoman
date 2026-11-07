// Dine Oman: application emails.
// Called by two Supabase Database Webhooks on public.applications (INSERT and UPDATE).
//   INSERT  -> confirmation to the owner + new-application alert to the admin team
//   UPDATE  -> decision email to the owner when status changes to approved or rejected
// Secrets (supabase secrets set ...): RESEND_API_KEY, WEBHOOK_SECRET, ADMIN_EMAIL, FROM_EMAIL, SITE_URL

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") ?? "";
const WEBHOOK_SECRET = Deno.env.get("WEBHOOK_SECRET") ?? "";
const ADMIN_EMAIL = Deno.env.get("ADMIN_EMAIL") ?? "";
const FROM_EMAIL = Deno.env.get("FROM_EMAIL") ?? "Dine Oman <partners@dineoman.com>";
const SITE_URL = (Deno.env.get("SITE_URL") ?? "").replace(/\/$/, "");

type Application = {
  id: string; reference: string; status: "pending" | "approved" | "rejected";
  restaurant_name: string; owner_name: string; email: string; phone: string; whatsapp: string;
  governorate: string; area: string; cuisine: string; package: string; admin_note: string | null;
  logo_url: string; cover_url: string; instagram: string; website: string; location: string;
};
type Payload = { type: "INSERT" | "UPDATE" | "DELETE"; table: string; record: Application; old_record: Application | null };

const esc = (s: unknown) => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
const pkg = (id: string) => ({ basic: "Basic", featured: "Featured", premium: "Premium" } as Record<string, string>)[id] ?? id;

function layout(title: string, bodyHtml: string, ar = "") {
  return `<!doctype html><html><body style="margin:0;background:#F5F6F2;font-family:Segoe UI,Helvetica,Arial,sans-serif;color:#121D1C">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:28px 12px">
  <table role="presentation" width="100%" style="max-width:560px;background:#fff;border-radius:16px;overflow:hidden" cellpadding="0" cellspacing="0">
    <tr><td style="background:#0C3B3A;color:#EFE6D6;padding:22px 28px;font-size:20px;font-weight:700">Dine Oman <span style="font-weight:400;opacity:.8">· داين عُمان</span></td></tr>
    <tr><td style="padding:28px;font-size:15.5px;line-height:1.6">
      <h1 style="font-size:24px;line-height:1.2;margin:0 0 14px">${title}</h1>${bodyHtml}
      ${ar ? `<p dir="rtl" style="margin-top:22px;padding-top:18px;border-top:1px solid #DCE3DE;text-align:right;color:#5A6863">${ar}</p>` : ""}
    </td></tr>
    <tr><td style="padding:18px 28px;background:#EBF0EC;font-size:12.5px;color:#5A6863">Every restaurant. One destination. · كل المطاعم. وجهة وحدة.</td></tr>
  </table></td></tr></table></body></html>`;
}

const btn = (href: string, label: string) =>
  `<p style="margin:22px 0"><a href="${esc(href)}" style="background:#E2A238;color:#121D1C;text-decoration:none;font-weight:600;padding:13px 22px;border-radius:99px;display:inline-block">${esc(label)}</a></p>`;

async function send(to: string, subject: string, html: string) {
  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: FROM_EMAIL, to: [to], subject, html })
  });
  if (!r.ok) throw new Error(`Email to ${to} failed: ${r.status} ${await r.text()}`);
}

function confirmation(a: Application) {
  return layout(
    `We've received your application`,
    `<p>Hello ${esc(a.owner_name)},</p>
     <p>Thank you for applying to list <b>${esc(a.restaurant_name)}</b> on Dine Oman. Our team will review it and email you the decision.</p>
     <p style="background:#EBF0EC;border-radius:12px;padding:14px 16px"><b>Reference:</b> ${esc(a.reference)}<br><b>Package:</b> ${esc(pkg(a.package))}<br><b>Location:</b> ${esc(a.area)}, ${esc(a.governorate)}</p>
     ${btn(`${SITE_URL}/account.html?email=${encodeURIComponent(a.email)}`, "Track your application")}
     <p style="color:#5A6863;font-size:14px">You won't be charged anything until your package is confirmed after approval.</p>`,
    `مرحباً ${esc(a.owner_name)}، استلمنا طلب تسجيل <b>${esc(a.restaurant_name)}</b>. رقم الطلب ${esc(a.reference)}. بنراجع الطلب ونرسل لك النتيجة على الإيميل.`
  );
}

function adminAlert(a: Application) {
  return layout(
    `New application: ${esc(a.restaurant_name)}`,
    `<p><img src="${esc(a.logo_url)}" alt="" width="64" height="64" style="border-radius:12px;border:1px solid #DCE3DE;object-fit:contain"></p>
     <p><b>${esc(a.restaurant_name)}</b> · ${esc(a.cuisine)}<br>${esc(a.area)}, ${esc(a.governorate)}<br>
     Package: <b>${esc(pkg(a.package))}</b><br>Owner: ${esc(a.owner_name)} · ${esc(a.email)}<br>Phone ${esc(a.phone)} · WhatsApp ${esc(a.whatsapp)}<br>
     Instagram @${esc(a.instagram)} · ${esc(a.website)}</p>
     ${btn(`${SITE_URL}/admin.html`, "Review in admin")}
     <p style="color:#5A6863;font-size:14px">Reference ${esc(a.reference)}</p>`
  );
}

function decision(a: Application) {
  if (a.status === "approved") {
    return layout(
      `${esc(a.restaurant_name)} is approved`,
      `<p>Hello ${esc(a.owner_name)},</p>
       <p>Good news: your application is approved. Sign in with this email to complete your restaurant profile (opening hours, menu, price range and photos). Your page goes live as soon as you publish it.</p>
       ${a.admin_note ? `<p style="background:#E3F3EA;border-radius:12px;padding:14px 16px"><b>Note from our team:</b> ${esc(a.admin_note)}</p>` : ""}
       ${btn(`${SITE_URL}/account.html?email=${encodeURIComponent(a.email)}`, "Complete your profile")}
       <p style="color:#5A6863;font-size:14px">Package: ${esc(pkg(a.package))}. Reference ${esc(a.reference)}.</p>`,
      `مبروك! تمت الموافقة على ${esc(a.restaurant_name)}. سجّل دخولك بنفس الإيميل وكمّل صفحة مطعمك عشان تنزل على داين عُمان.`
    );
  }
  return layout(
    `About your application for ${esc(a.restaurant_name)}`,
    `<p>Hello ${esc(a.owner_name)},</p>
     <p>We weren't able to approve this application yet.</p>
     ${a.admin_note ? `<p style="background:#FBE7E6;border-radius:12px;padding:14px 16px"><b>Reason:</b> ${esc(a.admin_note)}</p>` : ""}
     <p>You're welcome to fix the details and apply again.</p>
     ${btn(`${SITE_URL}/register.html#apply`, "Apply again")}
     <p style="color:#5A6863;font-size:14px">Reference ${esc(a.reference)}.</p>`,
    `للأسف ما قدرنا نوافق على الطلب حالياً. تقدر تعدّل المعلومات وتقدّم مرة ثانية.`
  );
}

Deno.serve(async req => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });
  if (!WEBHOOK_SECRET || req.headers.get("x-webhook-secret") !== WEBHOOK_SECRET) return new Response("Unauthorized", { status: 401 });
  if (!RESEND_API_KEY) return new Response("RESEND_API_KEY is not set", { status: 500 });

  const p = (await req.json()) as Payload;
  if (p.table !== "applications") return new Response("ignored");
  const a = p.record;
  const sent: string[] = [];
  try {
    if (p.type === "INSERT") {
      await send(a.email, `Application received · ${a.reference}`, confirmation(a)); sent.push("confirmation");
      if (ADMIN_EMAIL) {
        for (const to of ADMIN_EMAIL.split(",").map(s => s.trim()).filter(Boolean)) {
          await send(to, `New restaurant application: ${a.restaurant_name}`, adminAlert(a));
        }
        sent.push("admin");
      }
    } else if (p.type === "UPDATE" && p.old_record && p.old_record.status !== a.status && a.status !== "pending") {
      await send(a.email, a.status === "approved" ? `Approved: complete your Dine Oman profile` : `Update on your Dine Oman application`, decision(a));
      sent.push("decision");
    }
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ ok: false, error: String(e), sent }), { status: 502, headers: { "Content-Type": "application/json" } });
  }
  return new Response(JSON.stringify({ ok: true, sent }), { headers: { "Content-Type": "application/json" } });
});
