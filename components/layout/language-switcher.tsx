"use client";

import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Globe } from "lucide-react";
import { locales, localeNames, type Locale } from "@/i18n/config";

export function LanguageSwitcher() {
  const [current, setCurrent] = useState<Locale>("en");

  const handleChange = (locale: Locale) => {
    setCurrent(locale);
    // In production, this would update the URL prefix or cookie
    // For now, just update local state
    document.documentElement.lang = locale;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex h-8 items-center gap-1.5 rounded-lg px-2 text-xs font-medium hover:bg-gray-100 transition-colors" style={{ color: "#585858" }}>
        <Globe className="h-3.5 w-3.5" />
        {localeNames[current].slice(0, 3)}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-36">
        {locales.map((locale) => (
          <DropdownMenuItem
            key={locale}
            onClick={() => handleChange(locale)}
            className={current === locale ? "font-semibold" : ""}
          >
            {localeNames[locale]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
