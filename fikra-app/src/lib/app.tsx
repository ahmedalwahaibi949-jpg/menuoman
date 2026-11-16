import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { api, onAuthChange, type User } from "./store";
import { DEFAULTS, type Content } from "./content";

type Ctx = { content: Content; reloadContent: () => Promise<void>; user: User | null; ready: boolean; refreshUser: () => Promise<void> };
const App = createContext<Ctx>(null as unknown as Ctx);

export function AppProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<Content>(DEFAULTS);
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const reloadContent = useCallback(async () => { try { setContent(await api.content()); } catch { /* keep defaults */ } }, []);
  const refreshUser = useCallback(async () => { try { setUser(await api.me()); } catch { setUser(null); } }, []);
  useEffect(() => {
    Promise.all([reloadContent(), refreshUser()]).finally(() => setReady(true));
    return onAuthChange(() => { void refreshUser(); });
  }, [reloadContent, refreshUser]);
  return <App.Provider value={{ content, reloadContent, user, ready, refreshUser }}>{children}</App.Provider>;
}
export const useApp = () => useContext(App);
