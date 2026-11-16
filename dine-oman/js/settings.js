// Dine Oman: account settings (profile, email, password, sessions, deletion). Shared by every dashboard.
// Each setting is one row with a text link; its form opens in place.
(function () {
  const api = window.DineAPI, U = window.DineUI, t = window.t;

  function render(root, me, { onSaved } = {}) {
    const owner = me.role === "owner";
    const pw = (id, label, ac) => `<div class="field"><label for="${id}">${label}</label><div class="pw"><input class="input" id="${id}" type="password" autocomplete="${ac}"></div><span class="err"></span></div>`;
    root.innerHTML = `
      <div class="rows">
        <div class="row">
          <div><b>${t("الملف الشخصي", "Profile")}</b><div class="muted">${U.esc(me.full_name || "")} · <span class="ltr">${U.esc(U.fmtPhone(me.mobile) || t("بدون رقم", "No mobile"))}</span></div></div>
          <button class="link" data-open="profile">${t("تعديل", "Edit")}</button>
          <form id="st-profile" class="form" novalidate hidden>
            <div class="field" data-s="full_name"><label for="st-name">${t("الاسم الكامل", "Full name")}</label><input class="input" id="st-name" autocomplete="name" maxlength="80" value="${U.esc(me.full_name || "")}"><span class="err">${t("أدخل اسمك الكامل.", "Enter your full name.")}</span></div>
            <div class="field" data-s="mobile"><label for="st-mobile">${t("رقم الهاتف", "Mobile number")}</label><div class="affix"><span>+968</span><input class="input" id="st-mobile" inputmode="numeric" maxlength="9" value="${U.esc((me.mobile || "").replace(/^\+968/, ""))}"></div><span class="err">${t("رقم عُماني من 8 أرقام يبدأ بـ 7 أو 9.", "8-digit Omani mobile starting with 7 or 9.")}</span></div>
            ${owner ? `<div class="field" data-s="whatsapp"><label for="st-wa">${t("رقم الواتساب", "WhatsApp number")}</label><div class="affix"><span>+968</span><input class="input" id="st-wa" inputmode="numeric" maxlength="9" value="${U.esc((me.whatsapp || "").replace(/^\+968/, ""))}"></div><span class="err">${t("رقم عُماني من 8 أرقام يبدأ بـ 7 أو 9.", "8-digit Omani mobile starting with 7 or 9.")}</span></div>` : ""}
            <div><button class="btn" id="st-save">${t("حفظ", "Save")}</button></div>
          </form>
        </div>
        <div class="row">
          <div><b>${t("البريد الإلكتروني", "Email")}</b><div class="muted ltr" style="display:block">${U.esc(me.email)}</div>${me.pending_email ? `<div class="hint">${t("بانتظار تأكيد", "Waiting to confirm")} ${U.esc(me.pending_email)}</div>` : ""}</div>
          <button class="link" data-open="email">${t("تغيير", "Change")}</button>
          <form id="st-email" class="form" novalidate hidden>
            <div class="field"><label for="st-new-email">${t("البريد الجديد", "New email")}</label><input class="input ltr" id="st-new-email" type="email" autocomplete="email"><span class="err">${t("أدخل بريدًا مختلفًا وصحيحًا.", "Enter a different, valid email.")}</span><span class="hint">${t("سنرسل رابط تأكيد إلى البريد الجديد.", "We'll send a confirmation link to the new address.")}</span></div>
            <div><button class="btn" id="st-email-btn">${t("إرسال رابط التأكيد", "Send confirmation link")}</button></div>
          </form>
        </div>
        <div class="row">
          <div><b>${t("كلمة المرور", "Password")}</b><div class="muted">${me.has_password ? "••••••••" : t("تسجّل الدخول عبر Google", "You sign in with Google")}</div></div>
          <button class="link" data-open="pw">${me.has_password ? t("تغيير", "Change") : t("إنشاء كلمة مرور", "Set a password")}</button>
          <form id="st-pw" class="form" novalidate hidden>
            ${me.has_password ? pw("st-cur", t("كلمة المرور الحالية", "Current password"), "current-password") + pw("st-new", t("كلمة المرور الجديدة", "New password"), "new-password") + `<div class="meter" id="st-meter" data-s="0"><i></i><i></i><i></i><i></i></div>` + pw("st-new2", t("تأكيد كلمة المرور الجديدة", "Confirm new password"), "new-password")
              : `<p class="muted">${t("سنرسل لك رابطًا لإنشاء كلمة مرور.", "We'll email you a link to set a password.")}</p>`}
            <div><button class="btn" id="st-pw-btn">${me.has_password ? t("تحديث كلمة المرور", "Update password") : t("أرسل الرابط", "Send link")}</button></div>
          </form>
        </div>
        <div class="row">
          <div><b>${t("الأجهزة", "Devices")}</b><div class="muted">${t("الخروج من كل الأجهزة المسجّل فيها حسابك.", "Log out everywhere your account is signed in.")}</div></div>
          <button class="link" id="st-global">${t("تسجيل الخروج من الكل", "Log out of all devices")}</button>
        </div>
        <div class="row">
          <div><b>${t("تسجيل الخروج", "Log out")}</b><div class="muted">${t("من هذا الجهاز فقط.", "From this device only.")}</div></div>
          <button class="link" id="st-out">${t("خروج", "Log out")}</button>
        </div>
        ${me.role === "admin" ? "" : `<div class="row">
          <div><b>${t("حذف الحساب", "Delete account")}</b><div class="muted">${me.deletion_requested_at ? t(`أرسلت طلب الحذف بتاريخ ${U.date(me.deletion_requested_at)}.`, `You asked to delete your account on ${U.date(me.deletion_requested_at)}.`) : owner ? t("تُحذف مطاعمك مع الحساب.", "Your restaurants are removed with your account.") : t("تُحذف المفضلة والتقييمات مع الحساب.", "Your favourites and reviews are removed with it.")}</div></div>
          ${me.deletion_requested_at ? `<button class="link" id="st-cancel-del">${t("إلغاء الطلب", "Cancel request")}</button>` : `<button class="link danger" data-open="del">${t("طلب الحذف", "Request deletion")}</button>
          <form id="st-delform" class="form" novalidate hidden>
            <div class="field"><label for="st-reason">${t("سبب المغادرة (اختياري)", "Why are you leaving? (optional)")}</label><textarea class="input" id="st-reason" maxlength="500" style="min-height:80px"></textarea></div>
            <label class="check"><input type="checkbox" id="st-sure"> ${t("أفهم أن حسابي وبياناته ستُحذف نهائيًا.", "I understand my account and its data will be permanently deleted.")}</label>
            <div><button class="btn" id="st-del-btn" style="background:var(--bad)">${t("إرسال طلب الحذف", "Send deletion request")}</button></div>
          </form>`}
        </div>`}
      </div>`;

    const $ = s => root.querySelector(s);
    const forms = { profile: "#st-profile", email: "#st-email", pw: "#st-pw", del: "#st-delform" };
    root.querySelectorAll("[data-open]").forEach(b => b.onclick = () => {
      const f = $(forms[b.dataset.open]); const open = f.hidden; f.hidden = !open;
      b.textContent = open ? t("إلغاء", "Cancel") : b.dataset.label || b.textContent;
      if (open) { b.dataset.label = b.dataset.label || b.textContent; const i = f.querySelector("input,textarea"); if (i) i.focus(); }
    });
    root.querySelectorAll("[data-open]").forEach(b => { b.dataset.label = b.textContent; });
    if ($("#st-new")) { U.bindPassword($("#st-cur")); U.bindPassword($("#st-new"), $("#st-meter")); U.bindPassword($("#st-new2")); }

    $("#st-profile").onsubmit = async e => {
      e.preventDefault();
      const ok = [U.mark($('[data-s="full_name"]'), U.V.name($("#st-name").value)), U.mark($('[data-s="mobile"]'), U.V.mobile($("#st-mobile").value)), owner ? U.mark($('[data-s="whatsapp"]'), U.V.mobile($("#st-wa").value)) : true].every(Boolean);
      if (!ok) return;
      const btn = $("#st-save"); U.busy(btn, true);
      try { await api.updateMe({ full_name: $("#st-name").value.trim(), mobile: U.omani($("#st-mobile").value), ...(owner ? { whatsapp: U.omani($("#st-wa").value) } : {}) }); U.toast(t("تم الحفظ.", "Saved.")); onSaved && onSaved(); }
      catch (err) { U.toast(err.message, true); U.busy(btn, false); }
    };
    $("#st-email").onsubmit = async e => {
      e.preventDefault();
      const v = $("#st-new-email").value.trim().toLowerCase();
      if (!U.mark($("#st-new-email").closest(".field"), U.V.email(v) && v !== me.email)) return;
      const btn = $("#st-email-btn"); U.busy(btn, true);
      try { await api.changeEmail(v); U.toast(t("أرسلنا رابط التأكيد إلى ", "Confirmation link sent to ") + v); onSaved && onSaved(); }
      catch (err) { U.toast(err.message, true); U.busy(btn, false); }
    };
    $("#st-pw").onsubmit = async e => {
      e.preventDefault();
      const btn = $("#st-pw-btn");
      if (!me.has_password) { U.busy(btn, true); await api.sendPasswordReset(me.email).catch(() => {}); U.busy(btn, false); return U.toast(t("تحقق من بريدك لإنشاء كلمة المرور.", "Check your email to set your password.")); }
      const cur = $("#st-cur").value, nw = $("#st-new").value;
      const ok = [U.mark($("#st-cur").closest(".field"), !!cur, t("أدخل كلمة المرور الحالية.", "Enter your current password.")),
        U.mark($("#st-new").closest(".field"), U.V.password(nw) && nw !== cur, t("8 أحرف على الأقل بحروف وأرقام، ومختلفة عن الحالية.", "At least 8 characters with letters and numbers, different from the current one.")),
        U.mark($("#st-new2").closest(".field"), nw === $("#st-new2").value, t("كلمتا المرور غير متطابقتين.", "The passwords don't match."))].every(Boolean);
      if (!ok) return;
      U.busy(btn, true);
      try { await api.changePassword(cur, nw); U.toast(t("تم تحديث كلمة المرور.", "Password updated.")); onSaved && onSaved(); }
      catch (err) { U.mark($("#st-cur").closest(".field"), false, err.message); U.busy(btn, false); }
    };
    $("#st-global").onclick = () => U.logout(true);
    $("#st-out").onclick = () => U.logout(false);
    if ($("#st-delform")) $("#st-delform").onsubmit = async e => {
      e.preventDefault();
      if (!$("#st-sure").checked) return U.toast(t("ضع علامة للتأكيد.", "Tick the box to confirm."), true);
      const btn = $("#st-del-btn"); U.busy(btn, true);
      try { await api.requestDeletion($("#st-reason").value.trim()); U.toast(t("أرسلنا طلبك. سيعالجه فريقنا.", "Request sent. Our team will process it.")); onSaved && onSaved(); }
      catch (err) { U.toast(err.message, true); U.busy(btn, false); }
    };
    if ($("#st-cancel-del")) $("#st-cancel-del").onclick = async () => { await api.cancelDeletion(); U.toast(t("أُلغي طلب الحذف.", "Deletion request cancelled.")); onSaved && onSaved(); };
  }
  window.DineSettings = { render };
})();
