import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { App as CapacitorApp } from "@capacitor/app";
import { Browser } from "@capacitor/browser";
import { Capacitor } from "@capacitor/core";
import { supabase } from "../../lib/supabase";

const googleAuthEnabled = ((import.meta as ImportMeta & { env: Record<string, string | undefined> }).env.VITE_ENABLE_GOOGLE_AUTH ?? "").toLowerCase() === "true";

const buildRedirectUrl = (path: string) => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${window.location.origin}${normalizedPath}`;
};

const nativeGoogleRedirectUrl = "com.myafiyah.app://login";

type AuthContextType = {
  user: User | null;
  session: Session | null;
  role: "user" | "admin";
  isAdmin: boolean;
  isGuest: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithPhoneOtp: (phone: string, shouldCreateUser?: boolean) => Promise<void>;
  verifyPhoneOtp: (phone: string, token: string, type?: "sms" | "phone_change") => Promise<void>;
  signInAsGuest: () => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
  updatePhoneNumber: (phone: string) => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthProviderProps = {
  children: ReactNode;
};

type GuestProfile = {
  id: string;
  createdAt: string;
  profileName: string;
  phone: string;
};

const GUEST_PROFILE_KEY = "myafiyah:guest-profile";
const GUEST_SESSION_KEY = "myafiyah:guest-session-active";

const canUseStorage = () => typeof window !== "undefined";

const readGuestProfile = (): GuestProfile | null => {
  if (!canUseStorage()) return null;

  const raw = window.localStorage.getItem(GUEST_PROFILE_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as GuestProfile;
  } catch {
    return null;
  }
};

const writeGuestProfile = (profile: GuestProfile | null) => {
  if (!canUseStorage()) return;

  if (!profile) {
    window.localStorage.removeItem(GUEST_PROFILE_KEY);
    return;
  }

  window.localStorage.setItem(GUEST_PROFILE_KEY, JSON.stringify(profile));
};

const isGuestSessionActive = () => canUseStorage() && window.localStorage.getItem(GUEST_SESSION_KEY) === "true";

const setGuestSessionActive = (active: boolean) => {
  if (!canUseStorage()) return;

  if (active) {
    window.localStorage.setItem(GUEST_SESSION_KEY, "true");
    return;
  }

  window.localStorage.removeItem(GUEST_SESSION_KEY);
};

const createGuestProfile = (): GuestProfile => ({
  id: `guest-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
  createdAt: new Date().toISOString(),
  profileName: "Guest User",
  phone: "",
});

const ensureGuestProfile = (): GuestProfile => {
  const existing = readGuestProfile();
  if (existing) {
    return existing;
  }

  const created = createGuestProfile();
  writeGuestProfile(created);
  return created;
};

const buildGuestUser = (profile: GuestProfile): User => ({
  id: profile.id,
  aud: "authenticated",
  role: "authenticated",
  email: "",
  phone: profile.phone,
  app_metadata: {
    provider: "guest",
    providers: ["guest"],
  },
  user_metadata: {
    full_name: profile.profileName,
    name: profile.profileName,
    phone: profile.phone,
    is_guest: true,
  },
  identities: [],
  created_at: profile.createdAt,
} as unknown as User);

export function AuthProvider({ children }: AuthProviderProps) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<"user" | "admin">("user");
  const [loading, setLoading] = useState(true);

  const loadRole = useCallback(async (userId: string | undefined) => {
    if (!userId) {
      setRole("user");
      return;
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .maybeSingle();

    if (error) {
      console.error("Failed to load user role", error);
      setRole("user");
      return;
    }

    setRole(data?.role === "admin" ? "admin" : "user");
  }, []);

  useEffect(() => {
    let mounted = true;

    const bootstrap = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          console.error("Failed to load session", error);
        }

        if (mounted) {
          const activeSession = data.session ?? null;
          const activeUser = activeSession?.user ?? null;
          const guestProfile = !activeUser && isGuestSessionActive() ? readGuestProfile() ?? ensureGuestProfile() : null;

          setSession(activeSession);
          setUser(activeUser ?? (guestProfile ? buildGuestUser(guestProfile) : null));

          if (activeUser) {
            void loadRole(activeUser.id);
          } else {
            setRole("user");
          }
        }
      } catch (error) {
        console.error("Failed during auth bootstrap", error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    bootstrap();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      const activeUser = nextSession?.user ?? null;
      const guestProfile = !activeUser && isGuestSessionActive() ? readGuestProfile() : null;

      setSession(nextSession ?? null);
      setUser(activeUser ?? (guestProfile ? buildGuestUser(guestProfile) : null));

      if (activeUser) {
        void loadRole(activeUser.id);
      } else {
        setRole("user");
      }

      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [loadRole]);

  const finishNativeGoogleSignIn = useCallback(async (url: string) => {
    if (!url || !url.startsWith(nativeGoogleRedirectUrl)) {
      return;
    }

    try {
      const parsedUrl = new URL(url);
      const hashParams = new URLSearchParams(parsedUrl.hash.replace(/^#/, ""));
      const searchParams = parsedUrl.searchParams;
      const authError =
        searchParams.get("error_description") ??
        hashParams.get("error_description") ??
        searchParams.get("error") ??
        hashParams.get("error");

      if (authError) {
        console.error("Google auth redirect error:", authError);
        return;
      }

      const code = searchParams.get("code") ?? hashParams.get("code");
      const accessToken = hashParams.get("access_token") ?? searchParams.get("access_token");
      const refreshToken = hashParams.get("refresh_token") ?? searchParams.get("refresh_token");

      if (code) {
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          throw error;
        }

        setGuestSessionActive(false);
        setSession(data.session ?? null);
        setUser(data.user ?? null);
        void loadRole(data.user?.id);
      } else if (accessToken && refreshToken) {
        const { data, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (error) {
          throw error;
        }

        setGuestSessionActive(false);
        setSession(data.session ?? null);
        setUser(data.user ?? null);
        void loadRole(data.user?.id);
      } else {
        return;
      }

      window.history.replaceState({}, "", "/app");
      window.dispatchEvent(new PopStateEvent("popstate"));
    } catch (error) {
      console.error("Failed to finish Google sign-in on mobile:", error);
    } finally {
      await Browser.close().catch(() => undefined);
    }
  }, [loadRole]);

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    let listenerHandle: { remove: () => Promise<void> } | null = null;

    const registerListener = async () => {
      listenerHandle = await CapacitorApp.addListener("appUrlOpen", ({ url }) => {
        void finishNativeGoogleSignIn(url);
      });

      const launchData = await CapacitorApp.getLaunchUrl();
      if (launchData?.url) {
        void finishNativeGoogleSignIn(launchData.url);
      }
    };

    void registerListener();

    return () => {
      void listenerHandle?.remove();
    };
  }, [finishNativeGoogleSignIn]);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      throw error;
    }

    setGuestSessionActive(false);
  }, []);

  const signInWithGoogle = useCallback(async () => {
    if (!googleAuthEnabled) {
      throw new Error("Google sign-in is not enabled yet. Set VITE_ENABLE_GOOGLE_AUTH=true after connecting the Google provider in Supabase.");
    }

    const redirectTo = Capacitor.isNativePlatform() ? nativeGoogleRedirectUrl : buildRedirectUrl("/login");
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
        skipBrowserRedirect: true,
        queryParams: {
          prompt: "select_account",
          access_type: "offline",
        },
      },
    });

    if (error) {
      throw error;
    }

    if (!data?.url) {
      throw new Error("Google sign-in could not start. Please check the Google provider configuration.");
    }

    setGuestSessionActive(false);

    if (Capacitor.isNativePlatform()) {
      await Browser.open({ url: data.url });
      return;
    }

    window.location.assign(data.url);
  }, []);

  const signInWithPhoneOtp = useCallback(async (phone: string, shouldCreateUser = true) => {
    const { error } = await supabase.auth.signInWithOtp({
      phone,
      options: { shouldCreateUser },
    });

    if (error) {
      throw error;
    }
  }, []);

  const verifyPhoneOtp = useCallback(async (phone: string, token: string, type: "sms" | "phone_change" = "sms") => {
    const { error } = await supabase.auth.verifyOtp({
      phone,
      token,
      type,
    });

    if (error) {
      throw error;
    }
  }, []);

  const signInAsGuest = useCallback(async () => {
    const guestProfile = ensureGuestProfile();
    setGuestSessionActive(true);
    setSession(null);
    setUser(buildGuestUser(guestProfile));
    setRole("user");
    setLoading(false);
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      throw error;
    }

    setGuestSessionActive(false);
  }, []);

  const signOut = useCallback(async () => {
    if (user?.user_metadata?.is_guest) {
      setGuestSessionActive(false);
      setSession(null);
      setUser(null);
      setRole("user");
      return;
    }

    const { error } = await supabase.auth.signOut();
    if (error) {
      throw error;
    }
  }, [user]);

  const updatePassword = useCallback(async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      throw error;
    }
  }, []);

  const updatePhoneNumber = useCallback(async (phone: string) => {
    if (user?.user_metadata?.is_guest) {
      const guestProfile = {
        ...ensureGuestProfile(),
        phone,
      };

      writeGuestProfile(guestProfile);
      setUser(buildGuestUser(guestProfile));
      return;
    }

    const { data, error } = await supabase.auth.updateUser({
      data: { phone },
    });

    if (error) {
      throw error;
    }

    if (data.user) {
      setUser(data.user);
    }
  }, [user]);

  const requestPasswordReset = useCallback(async (email: string) => {
    const redirectTo = `${window.location.origin}/reset-password`;
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
    if (error) {
      throw error;
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      session,
      role,
      isAdmin: role === "admin",
      isGuest: Boolean(user?.user_metadata?.is_guest),
      loading,
      signIn,
      signInWithGoogle,
      signInWithPhoneOtp,
      verifyPhoneOtp,
      signInAsGuest,
      signUp,
      signOut,
      updatePassword,
      updatePhoneNumber,
      requestPasswordReset,
    }),
    [
      user,
      session,
      role,
      loading,
      signIn,
      signInWithGoogle,
      signInWithPhoneOtp,
      verifyPhoneOtp,
      signInAsGuest,
      signUp,
      signOut,
      updatePassword,
      updatePhoneNumber,
      requestPasswordReset,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
