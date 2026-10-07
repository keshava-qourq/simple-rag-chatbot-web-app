"use client";
// The static export has no server to issue a redirect, so the root route
// sends the browser to the chat screen client-side. Both nav links in
// RootLayout point at /chat and /library; nothing else links to "/" itself.

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/chat/");
  }, [router]);

  return null;
}
