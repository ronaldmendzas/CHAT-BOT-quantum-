"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/browserClient";
import type { User } from "@supabase/supabase-js";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    async function init(retryCount = 0) {
      try {
        console.log(`[useAuth] getSession attempt ${retryCount}...`);
        const { data: sessionData } = await supabase.auth.getSession();
        console.log("[useAuth] getSession result:", !!sessionData.session, sessionData.session?.user?.email);

        if (sessionData.session) {
          setUser(sessionData.session.user);
          setLoading(false);
          setReady(true);
        } else if (retryCount < 5) {
          // Retry several times — localStorage can take a moment to write/read
          setTimeout(() => init(retryCount + 1), 500);
        } else {
          setUser(null);
          setLoading(false);
          setReady(true);
        }
      } catch (e) {
        console.error("[useAuth] init error:", e);
        setUser(null);
        setLoading(false);
        setReady(true);
      }
    }

    init();

    // Listen for auth changes
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("[useAuth] onAuthStateChange:", event, session?.user?.email);
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED" || event === "USER_UPDATED" || event === "INITIAL_SESSION") {
        setUser(session?.user ?? null);
      } else if (event === "SIGNED_OUT") {
        setUser(null);
      }
      setLoading(false);
      setReady(true);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    // Clear ALL localStorage to avoid showing previous user's data
    try {
      localStorage.clear();
    } catch {
      // ignore
    }
    // Force full page reload to clear all React state
    window.location.reload();
  }

  return { user, loading, ready, signOut };
}
