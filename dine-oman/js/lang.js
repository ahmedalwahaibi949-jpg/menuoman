// Dine Oman: language. Arabic (RTL) by default; English via the header switch.
// Loaded first in <head> so the page never flashes in the wrong direction.
(function () {
  var L = null;
  try { L = localStorage.getItem("dine-lang"); } catch (e) {}
  var q = new URLSearchParams(location.search).get("lang");
  L = q || L || "ar";
  if (L !== "en") L = "ar";
  var html = document.documentElement;
  html.lang = L; html.dir = L === "ar" ? "rtl" : "ltr";
  window.DINE_LANG = L;
  // t("عربي", "English") → the string for the current language.
  window.t = function (ar, en) { return L === "en" && en != null ? en : ar; };
  window.setLang = function (l) { try { localStorage.setItem("dine-lang", l); } catch (e) {} location.reload(); };
  // Static HTML is written in Arabic; elements carry their English in data-en / data-en-ph.
  window.applyLang = function (root) {
    if (L !== "en") return;
    (root || document).querySelectorAll("[data-en]").forEach(function (el) { el.innerHTML = el.getAttribute("data-en"); });
    (root || document).querySelectorAll("[data-en-ph]").forEach(function (el) { el.placeholder = el.getAttribute("data-en-ph"); });
  };
  document.addEventListener("DOMContentLoaded", function () { window.applyLang(); });
})();
