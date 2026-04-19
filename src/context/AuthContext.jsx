import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user,      setUser]      = useState(null);
  const [session,   setSession]   = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [avatarUrl, setAvatarUrl] = useState(null); // shared across Navbar + Profile


  useEffect(() => {
    /**
     * 1. Register onAuthStateChange FIRST.
     *    The Supabase client fires this immediately with the current
     *    session (INITIAL_SESSION event), and again for every subsequent
     *    SIGNED_IN / SIGNED_OUT / TOKEN_REFRESHED.
     *
     *    With detectSessionInUrl:true, when the OAuth ?code= param is
     *    present on page load the client exchanges it in the background
     *    and then fires SIGNED_IN here — no manual handling needed.
     *
     * 2. No useRef guard.
     *    React StrictMode double-invokes effects but always runs the
     *    cleanup between the two invocations, so the subscription is
     *    properly unsubscribed and re-subscribed.  A ref guard that
     *    skips the second mount leaves the app with NO listener.
     */
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        console.log('[Auth]', event, newSession?.user?.email ?? 'signed out');
        setSession(newSession);
        setUser(newSession?.user ?? null);

        // Only clear loading on the FIRST session resolution events.
        // TOKEN_REFRESHED / USER_UPDATED fire silently in the background
        // (e.g. when switching tabs). Calling setLoading(false) on those
        // events re-renders the entire tree and looks like a page refresh.
        if (
          event === 'INITIAL_SESSION' ||
          event === 'SIGNED_IN'       ||
          event === 'SIGNED_OUT'
        ) {
          setLoading(false);
        }

        // Clear cached avatar when user signs out
        if (event === 'SIGNED_OUT') {
          setAvatarUrl(null);
        }
      }
    );

    /**
     * 2. getSession() as a synchronous safety net.
     *    Reads from localStorage immediately — resolves on the same tick.
     *    Covers the case where the client was already authed before this
     *    component mounted (e.g. page refresh with an existing session).
     */
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setUser(s?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  /* ───────────────────────── Auth actions ───────────────────────────── */

  const signUp = async (email, password) => {
    return supabase.auth.signUp({ email, password });
  };

  const signIn = async (email, password) => {
    return supabase.auth.signInWithPassword({ email, password });
  };

  /**
   * Google OAuth with PKCE.
   *
   * Before the page redirects to Google, Supabase writes:
   *   localStorage["supabase.auth.token-code-verifier"] = <random>
   *
   * After Google redirects back to redirectTo?code=..., Supabase's
   * detectSessionInUrl:true reads the verifier, exchanges the code,
   * stores the session, and fires SIGNED_IN via onAuthStateChange.
   *
   * Rules that must hold for this to work:
   *  • redirectTo must be http://localhost:5173 (no trailing slash,
   *    no path) and must be listed EXACTLY in Supabase Dashboard →
   *    Authentication → URL Configuration → Redirect URLs.
   *  • skipBrowserRedirect: false  → Supabase performs the redirect.
   *  • Custom storageKey must NOT be set (see supabase.js).
   */
  const signInWithGoogle = async () => {
    const redirectTo = window.location.origin; // "http://localhost:5173"
    console.log('[Auth] Google OAuth start, redirectTo:', redirectTo);

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        skipBrowserRedirect: false,
      },
    });

    if (error) console.error('[Auth] Google OAuth error:', error.message);
    return { data, error };
  };

  const signOut = async () => {
    return supabase.auth.signOut();
  };

  const resetPassword = async (email) => {
    return supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
  };

  /* ─────────────────────────────────────────────────────────────────── */

  return (
    <AuthContext.Provider value={{
      user, session, loading,
      avatarUrl, setAvatarUrl,
      signUp, signIn, signInWithGoogle, signOut, resetPassword,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside <AuthProvider>');
  return ctx;
};
