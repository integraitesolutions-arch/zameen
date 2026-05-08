"use client";

import { useState, useRef, useEffect } from "react";
import { COUNTRY_CODES } from "@/lib/country-codes";
import { ChevronDown } from "lucide-react";

interface CountryCodeSelectProps {
  value: string;
  onChange: (code: string) => void;
}

export function CountryCodeSelect({ value, onChange }: CountryCodeSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  const selected = COUNTRY_CODES.find((c) => c.code === value) || COUNTRY_CODES[0];

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const filtered = COUNTRY_CODES.filter(
    (c) => c.country.toLowerCase().includes(search.toLowerCase()) || c.code.includes(search)
  );

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex h-9 items-center gap-1 rounded-md border bg-muted px-2 text-sm hover:bg-gray-100 transition-colors"
        style={{ borderColor: "#e0e0e0", minWidth: "80px" }}
      >
        <span>{selected.flag}</span>
        <span className="font-medium">{selected.code}</span>
        <ChevronDown className="h-3 w-3 opacity-50" />
      </button>

      {open && (
        <div
          className="absolute left-0 top-full z-50 mt-1 w-64 rounded-xl bg-white shadow-xl overflow-hidden"
          style={{ border: "1px solid #e0e0e0" }}
        >
          <div className="p-2">
            <input
              type="text"
              placeholder="Search country..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              style={{ borderColor: "#e0e0e0" }}
              autoFocus
            />
          </div>
          <div className="max-h-48 overflow-y-auto">
            {filtered.map((country, i) => (
              <button
                key={`${country.short}-${i}`}
                type="button"
                onClick={() => { onChange(country.code); setOpen(false); setSearch(""); }}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 transition-colors"
                style={{ background: value === country.code ? "#f0f7ff" : "transparent" }}
              >
                <span>{country.flag}</span>
                <span className="flex-1 text-left" style={{ color: "#2A2A33" }}>{country.country}</span>
                <span style={{ color: "#869099" }}>{country.code}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
