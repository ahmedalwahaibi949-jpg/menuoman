import { StrictMode, Suspense, lazy, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { HashRouter, Route, Routes } from "react-router-dom";
import "./index.css";
import { I18nProvider } from "./lib/i18n";
import { AppProvider, useApp } from "./lib/app";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import { About, Contact, NotFound, Portfolio, Pricing, ProjectPage, ServiceDetail, Services } from "./pages/Public";

// The portal and admin dashboard load only when opened, keeping the public pages fast.
const Portal = lazy(() => import("./pages/Portal"));
const Admin = lazy(() => import("./pages/Admin"));

function Loader() {
  const { ready } = useApp();
  const [gone, setGone] = useState(false);
  useEffect(() => { if (ready) { const id = setTimeout(() => setGone(true), 600); return () => clearTimeout(id); } }, [ready]);
  if (gone) return null;
  return <div className={`loader ${ready ? "done" : ""}`} aria-hidden="true"><i /></div>;
}

function App() {
  return (
    <HashRouter>
      <Loader />
      <Suspense fallback={<div className="grid min-h-screen place-items-center bg-paper text-slate">…</div>}>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="services" element={<Services />} />
            <Route path="services/:slug" element={<ServiceDetail />} />
            <Route path="portfolio" element={<Portfolio />} />
            <Route path="portfolio/:slug" element={<ProjectPage />} />
            <Route path="pricing" element={<Pricing />} />
            <Route path="about" element={<About />} />
            <Route path="contact" element={<Contact />} />
            <Route path="portal" element={<Portal />} />
            <Route path="admin" element={<Admin />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </Suspense>
    </HashRouter>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode><I18nProvider><AppProvider><App /></AppProvider></I18nProvider></StrictMode>
);
