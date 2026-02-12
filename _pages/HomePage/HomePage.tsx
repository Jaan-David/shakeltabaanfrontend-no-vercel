// pages/index.tsx (for homepage at "/")
"use client";
import React from "react";

import HomeContent from "@/_pages/HomePage/HomeContent";

// Prevent static prerendering which causes auth context errors
export const dynamic = 'force-dynamic';

export default function HomePage() {
  return (
    <div>
      <HomeContent />
    </div>
  );
}