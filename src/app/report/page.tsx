"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, orderBy, query, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useRouter } from "next/navigation";

export default function LatestReportRedirect() {
  const router = useRouter();
  const [msg, setMsg] = useState("Finding latest incident…");

  useEffect(() => {
    (async () => {
      const q = query(collection(db, "incidents"), orderBy("createdAt", "desc"), limit(1));
      const snap = await getDocs(q);
      if (snap.empty) {
        setMsg("No incidents found yet — trigger an SOS first.");
        setTimeout(() => router.push("/sos"), 1600);
        return;
      }
      router.replace(`/report/${snap.docs[0].id}`);
    })();
  }, [router]);

  return (
    <div className="mx-auto max-w-xl px-6 py-20 text-center text-zinc-400">
      {msg}
    </div>
  );
}
