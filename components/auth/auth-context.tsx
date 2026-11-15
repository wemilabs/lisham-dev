"use client";

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";

type AuthMode = "signin" | "signup";

interface AuthContextType {
  isOpen: boolean;
  mode: AuthMode;
  openAuth: (mode?: AuthMode) => void;
  closeAuth: () => void;
  switchMode: () => void;
  returnFocusRef: React.RefObject<HTMLElement | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<AuthMode>("signin");
  const returnFocusRef = useRef<HTMLElement | null>(null);

  const openAuth = useCallback((initialMode: AuthMode = "signin") => {
    returnFocusRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    setMode(initialMode);
    setIsOpen(true);
  }, []);

  const closeAuth = useCallback(() => setIsOpen(false), []);

  const switchMode = useCallback(() => {
    setMode((prev) => (prev === "signin" ? "signup" : "signin"));
  }, []);

  return (
    <AuthContext.Provider
      value={{ isOpen, mode, openAuth, closeAuth, switchMode, returnFocusRef }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
