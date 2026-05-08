"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, X, MapPin } from "lucide-react";

interface SearchBarProps {
  defaultValue?: string;
  large?: boolean;
}

export function SearchBar({ defaultValue = "", large }: SearchBarProps) {
  const [query, setQuery] = useState(defaultValue);
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full group">
      <MapPin
        className={`absolute top-1/2 -translate-y-1/2 ${large ? "left-4 h-5 w-5" : "left-3 h-4 w-4"}`}
        style={{ color: "#727785" }}
      />
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search by city, locality, project, or landmark..."
        className={`w-full bg-white transition-all placeholder:text-[#c1c6d6] focus:outline-none ${
          large
            ? "rounded-lg py-3 pl-12 pr-12 text-base border-0"
            : "rounded-lg py-2.5 pl-10 pr-10 text-sm"
        }`}
        style={{ border: large ? "none" : "1px solid #e8eaed" }}
      />
      {query && (
        <button
          type="button"
          onClick={() => setQuery("")}
          className="absolute right-4 top-1/2 -translate-y-1/2 hover:text-gray-600"
          style={{ color: "#c1c6d6" }}
        >
          <X className={large ? "h-5 w-5" : "h-4 w-4"} />
        </button>
      )}
    </form>
  );
}
