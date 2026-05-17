"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/browserClient";
import type { User } from "@supabase/supabase-js";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [ready, setReady] = useState(false);
  const resolvedRef = useRef(false);

  useEffect(() => {
    const supabase = createClient();
    let timeoutId: NodeJS.Timeout;

    async function init() {
      try {
        console.log("[useAuth] Checking session...");
        const { data: sessionData } = await supabase.auth.getSession();
        console.log("[useAuth] getSession result:", !!sessionData.session, sessionData.session?.user?.email);

        if (sessionData.session) {
          resolvedRef.current = true;
          setUser(sessionData.session.user);
          setLoading(false);
          setReady(true);
        }
      } catch (e) {
        console.error("[useAuth] init error:", e);
      }
    }

    init();

    // Listen for auth changes
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("[useAuth] onAuthStateChange:", event, session?.user?.email);
      
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED" || event === "USER_UPDATED" || event === "INITIAL_SESSION") {
        resolvedRef.current = true;
        setUser(session?.user ?? null);
        setLoading(false);
        setReady(true);
        if (timeoutId) clearTimeout(timeoutId);
      } else if (event === "SIGNED_OUT") {
        resolvedRef.current = true;
        setUser(null);
        setLoading(false);
        setReady(true);
        if (timeoutId) clearTimeout(timeoutId);
      }
    });

    // Fallback: if no session detected after 3s, conclude no auth
    timeoutId = setTimeout(() => {
      if (!resolvedRef.current) {
        console.log("[useAuth] No session detected after timeout");
        resolvedRef.current = true;
        setUser(null);
        setLoading(false);
        setReady(true);
      }
    }, 3000);

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      listener.subscription.unsubscribe();
    };
  }, []);

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    try {
      localStorage.clear();
    } catch {
      // ignore
    }
    window.location.reload();
  }

  return { user, loading, ready, signOut };
}
