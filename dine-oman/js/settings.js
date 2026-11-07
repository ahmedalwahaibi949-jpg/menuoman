// Dine Oman: account settings (profile, email, password, sessions, deletion). Shared by every dashboard.
(function () {
  const api = window.DineAPI, U = window.DineUI;

  function render(root, me, { onSaved } = {}) {
    const owner = me.role === "owner";
    root.innerHTML = `
      <div class="card">
        <h2>Profile</h2><p class="small muted">How you appear on Dine Oman${me.role === "customer" ? ". Reviews show your first name and last initial." : "."}</p>
        <form id="st-profile" novalidate class="stack" style="margin-top:18px;max-width:560px">
          <div class="field" data-s="full_name"><label for="st-name">Full name</label><input class="control" id="st-name" autocomplete="name" maxlength="80" value="${U.esc(me.full_name || "")}"><span class="err">Enter your full name.</span></div>
          <div class="row2">
            <div class="field" data-s="mobile"><label for="st-mobile">Mobile number</label><div class="affix"><span>+968</span><input class="control" id="st-mobile" inputmode="numeric" maxlength="9" value="${U.esc((me.mobile || "").replace(/^\+968/, ""))}"></div><span class="err">Enter an 8-digit Omani mobile starting with 7 or 9.</span></div>
            ${owner ? `<div class="field" data-s="whatsapp"><label for="st-wa">WhatsApp number</label><div class="affix"><span>+968</span><input class="control" id="st-wa" inputmode="numeric" maxlength="9" value="${U.esc((me.whatsapp || "").replace(/^\+968/, ""))}"></div><span class="err">Enter an 8-digit Omani mobile starting with 7 or 9.</span></div>` : ""}
          </div>
          <button class="btn btn-dark" style="justify-self:start" id="st-save">Save profile</button>
        </form>
      </div>

      <div class="card">
        <h2>Login &amp; security</h2>
        <div class="setting">
          <div><b>Email address</b><p>${U.esc(me.email)}${me.pending_email ? ` · waiting for you to confirm <b>${U.esc(me.pending_email)}</b>` : ""}</p></div>
          <button class="btn btn-line" type="button" data-open="email">Change email</button>
          <form id="st-email" novalidate hidden>
            <div class="field"><label for="st-new-email">New email address</label><input class="control" id="st-new-email" type="email" autocomplete="email"><span class="err">Enter a different, valid email address.</span></div>
            <p class="small muted">We'll send a confirmation link to the new address. Your email changes once you open it.</p>
            <div style="display:flex;gap:10px"><button class="btn btn-dark" id="st-email-btn">Send confirmation link</button><button class="btn btn-line" type="button" data-close="email">Cancel</button></div>
          </form>
        </div>
        <div class="setting">
          <div><b>Password</b><p>${me.has_password ? "Change the password you use to log in." : "You sign in with Google. Set a password to also log in with email."}</p></div>
          <button class="btn btn-line" type="button" data-open="pw">${me.has_password ? "Change password" : "Set a password"}</button>
          <form id="st-pw" novalidate hidden>
            ${me.has_password ? `<div class="field"><label for="st-cur">Current password</label><div class="pw"><input class="control" id="st-cur" type="password" autocomplete="current-password"></div><span class="err">Enter your current password.</span></div>
            <div class="field"><label for="st-new">New password</label><div class="pw"><input class="control" id="st-new" type="password" autocomplete="new-password"></div>
              <div class="meter" id="st-meter" data-s="0"><div class="bars"><i></i><i></i><i></i><i></i></div><span class="lbl">Use 8+ characters with letters and numbers</span></div><span class="err">Use at least 8 characters, including letters and numbers, different from the current one.</span></div>
            <div class="field"><label for="st-new2">Confirm new password</label><div class="pw"><input class="control" id="st-new2" type="password" autocomplete="new-password"></div><span class="err">The passwords don't match.</span></div>
            <div style="display:flex;gap:10px"><button class="btn btn-dark" id="st-pw-btn">Update password</button><button class="btn btn-line" type="button" data-close="pw">Cancel</button></div>`
            : `<p class="small muted">We'll email you a secure link to set your password.</p><div style="display:flex;gap:10px"><button class="btn btn-dark" id="st-pw-btn">Email me a link</button><button class="btn btn-line" type="button" data-close="pw">Cancel</button></div>`}
          </form>
        </div>
        <div class="setting">
          <div><b>Sessions</b><p>Log out everywhere you're signed in, including phones and other browsers. Use this if a device is lost or shared.</p></div>
          <button class="btn btn-line" type="button" id="st-global">Log out of all devices</button>
        </div>
      </div>

      ${me.role === "admin" ? "" : `<div class="card" id="st-del">
        <h2>Delete account</h2>
        ${me.deletion_requested_at
          ? `<div class="alert warn" style="margin-top:12px">You asked us to delete your account on ${U.date(me.deletion_requested_at)}. Our team will process it and email you. <button class="linkbtn" type="button" id="st-cancel-del">Cancel the request</button></div>`
          : `<p class="small muted">${owner ? "Your restaurants will be unpublished and removed with your account." : "Your favourites, history and reviews are removed with your account."} This can't be undone.</p>
             <button class="btn btn-bad" type="button" data-open="del" style="margin-top:14px">Request account deletion</button>
             <form id="st-delform" novalidate hidden class="stack" style="margin-top:14px;max-width:560px">
               <div class="field"><label for="st-reason">Why are you leaving? (optional)</label><textarea class="control" id="st-reason" maxlength="500" style="min-height:80px"></textarea></div>
               <label class="check small"><input type="checkbox" id="st-sure"> <span>I understand my account and its data will be permanently deleted.</span></label>
               <div style="display:flex;gap:10px"><button class="btn btn-bad" id="st-del-btn">Send deletion request</button><button class="btn btn-line" type="button" data-close="del">Keep my account</button></div>
             </form>`}
      </div>`}`;

    const $ = s => root.querySelector(s);
    const forms = { email: "#st-email", pw: "#st-pw", del: "#st-delform" };
    root.querySelectorAll("[data-open]").forEach(b => b.onclick = () => { $(forms[b.dataset.open]).hidden = false; b.hidden = true; const i = $(forms[b.dataset.open]).querySelector("input,textarea"); if (i) i.focus(); });
    root.querySelectorAll("[data-close]").forEach(b => b.onclick = () => { $(forms[b.dataset.close]).hidden = true; root.querySelector(`[data-open="${b.dataset.close}"]`).hidden = false; });
    if ($("#st-new")) { U.bindPassword($("#st-cur")); U.bindPassword($("#st-new"), $("#st-meter")); U.bindPassword($("#st-new2")); }

    $("#st-profile").onsubmit = async e => {
      e.preventDefault();
      const ok = [U.mark($('[data-s="full_name"]'), U.V.name($("#st-name").value)), U.mark($('[data-s="mobile"]'), U.V.mobile($("#st-mobile").value)), owner ? U.mark($('[data-s="whatsapp"]'), U.V.mobile($("#st-wa").value)) : true].every(Boolean);
      if (!ok) return;
      const btn = $("#st-save"); U.busy(btn, true, "Saving…");
      try { await api.updateMe({ full_name: $("#st-name").value.trim(), mobile: U.omani($("#st-mobile").value), ...(owner ? { whatsapp: U.omani($("#st-wa").value) } : {}) }); U.toast("Profile saved."); onSaved && onSaved(); }
      catch (err) { U.toast(err.message, true); }
      U.busy(btn, false);
    };
    $("#st-email").onsubmit = async e => {
      e.preventDefault();
      const v = $("#st-new-email").value.trim().toLowerCase();
      if (!U.mark($("#st-new-email").closest(".field"), U.V.email(v) && v !== me.email)) return;
      const btn = $("#st-email-btn"); U.busy(btn, true, "Sending…");
      try { await api.changeEmail(v); U.toast("Confirmation link sent to " + v + "."); onSaved && onSaved(); }
      catch (err) { U.toast(err.message, true); U.busy(btn, false); }
    };
    $("#st-pw").onsubmit = async e => {
      e.preventDefault();
      const btn = $("#st-pw-btn");
      if (!me.has_password) {
        U.busy(btn, true, "Sending…"); await api.sendPasswordReset(me.email).catch(() => {}); U.busy(btn, false);
        return U.toast("Check your email for a link to set your password.");
      }
      const cur = $("#st-cur").value, nw = $("#st-new").value;
      const ok = [U.mark($("#st-cur").closest(".field"), !!cur), U.mark($("#st-new").closest(".field"), U.V.password(nw) && nw !== cur), U.mark($("#st-new2").closest(".field"), nw === $("#st-new2").value)].every(Boolean);
      if (!ok) return;
      U.busy(btn, true, "Updating…");
      try { await api.changePassword(cur, nw); U.toast("Password updated."); $("#st-pw").reset(); root.querySelector('[data-close="pw"]').click(); }
      catch (err) { U.mark($("#st-cur").closest(".field"), false, err.message); }
      U.busy(btn, false);
    };
    $("#st-global").onclick = async () => { await api.signOut(true); location.href = "login.html?signedout=1"; };
    if ($("#st-delform")) $("#st-delform").onsubmit = async e => {
      e.preventDefault();
      if (!$("#st-sure").checked) return U.toast("Tick the box to confirm.", true);
      const btn = $("#st-del-btn"); U.busy(btn, true, "Sending…");
      try { await api.requestDeletion($("#st-reason").value.trim()); U.toast("Request sent. Our team will process it."); onSaved && onSaved(); }
      catch (err) { U.toast(err.message, true); U.busy(btn, false); }
    };
    if ($("#st-cancel-del")) $("#st-cancel-del").onclick = async () => { await api.cancelDeletion(); U.toast("Deletion request cancelled."); onSaved && onSaved(); };
  }
  window.DineSettings = { render };
})();
