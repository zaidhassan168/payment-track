"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Page() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard");
  }, [router]);

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="max-w-md w-full bg-white p-8 rounded shadow-md text-center">
        <h2 className="text-2xl font-bold mb-4">Authentication Disabled</h2>
        <p className="text-muted-foreground mb-4">Redirecting to dashboard...</p>
      </div>
    </div>
  );
}
