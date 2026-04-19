// page.tsx — Landing page at /
// Two buttons: navigate to /ingest and /chat

import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex flex-col items-center text-center gap-8">
      {/* Hero */}
      <div className="space-y-3">
        <h1 className="text-5xl font-extrabold tracking-tight">Company Brain</h1>
        <p className="text-gray-400 text-lg max-w-md">
          Upload your company docs and chat with your knowledge base — powered by AI.
        </p>
      </div>

      {/* Action buttons */}
      <div className="flex gap-4 mt-4">
        {/* Goes to /ingest — where users will upload documents */}
        <Link
          href="/ingest"
          className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 font-semibold transition-colors"
        >
          Upload Docs
        </Link>

        {/* Goes to /chat — where users will query the knowledge base */}
        <Link
          href="/chat"
          className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 font-semibold transition-colors"
        >
          Chat
        </Link>
      </div>
    </div>
  );
}
