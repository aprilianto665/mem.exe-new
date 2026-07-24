"use client";

import dynamic from "next/dynamic";

const App = dynamic(() => import("@/components/AppWrapper"), { ssr: false });

export default function SPA() {
  return <App />;
}
