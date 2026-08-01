"use client";

import { useEffect } from "react";
import { getDeviceKey } from "../auth/device-client";

const IDLE_AFTER = 5 * 60 * 1000;

export function ActivityTracker() {
  useEffect(() => {
    if (location.pathname === "/login" || location.pathname === "/setup") return;
    let lastInteraction = Date.now();
    const touch = () => { lastInteraction = Date.now(); };
    const isActive = () => document.visibilityState === "visible" && Date.now() - lastInteraction < IDLE_AFTER;
    const heartbeat = () => fetch("/api/activity/heartbeat", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ active: isActive(), deviceKey: getDeviceKey() }),
      keepalive: true,
    }).catch(() => undefined);
    const events: (keyof WindowEventMap)[] = ["pointerdown", "keydown", "scroll", "touchstart"];
    events.forEach((name) => window.addEventListener(name, touch, { passive: true }));
    document.addEventListener("visibilitychange", heartbeat);
    void heartbeat();
    const timer = window.setInterval(heartbeat, 60_000);
    return () => {
      window.clearInterval(timer);
      events.forEach((name) => window.removeEventListener(name, touch));
      document.removeEventListener("visibilitychange", heartbeat);
    };
  }, []);
  return null;
}
