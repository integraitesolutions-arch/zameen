"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu, Plus, User, LogOut, LayoutDashboard, Heart, MessageCircle, Bell } from "lucide-react";
import { NotificationBell } from "./notification-bell";

const NAV_LINKS = [
  { href: "/search?listing_type=sale", label: "Buy" },
  { href: "/search?listing_type=rent", label: "Rent" },
  { href: "/search?listing_type=pg_coliving", label: "PG" },
  { href: "/search?property_type=commercial_shop,commercial_office", label: "Commercial" },
  { href: "/dashboard", label: "Dashboard" },
];

export function Navbar() {
  const { user, loading, signOut } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full bg-white" style={{ borderBottom: "1px solid #e8eaed" }}>
      <div className="mx-auto flex h-12 md:h-14 max-w-[1280px] items-center justify-between px-4 md:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-1.5">
          <span className="font-heading text-lg md:text-xl font-bold" style={{ color: "#1a73e8" }}>ZAMINDHAAR</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-5 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-sm font-medium transition-colors hover:text-[#1a73e8]"
              style={{ color: "#414754" }}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right Side */}
        <div className="flex items-center gap-2">
          {!loading && (
            <>
              {user ? (
                <>
                  <NotificationBell />
                  <Link href="/dashboard/favorites">
                    <button className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-gray-100">
                      <Heart className="h-5 w-5" style={{ color: "#414754" }} />
                    </button>
                  </Link>
                  <DropdownMenu>
                    <DropdownMenuTrigger className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-gray-100">
                      <Avatar className="h-7 w-7">
                        <AvatarFallback className="text-xs font-semibold text-white" style={{ background: "#1a73e8" }}>
                          {user.full_name?.charAt(0)?.toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-52">
                      <div className="px-3 py-2">
                        <p className="text-sm font-semibold" style={{ color: "#202124" }}>{user.full_name}</p>
                        <p className="text-xs" style={{ color: "#727785" }}>{user.email}</p>
                      </div>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => window.location.href = "/dashboard"}>
                        <LayoutDashboard className="mr-2 h-4 w-4" style={{ color: "#1a73e8" }} />Dashboard
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => window.location.href = "/messages"}>
                        <MessageCircle className="mr-2 h-4 w-4" style={{ color: "#1a73e8" }} />Messages
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => window.location.href = "/dashboard/favorites"}>
                        <Heart className="mr-2 h-4 w-4" style={{ color: "#1a73e8" }} />Saved
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={signOut}>
                        <LogOut className="mr-2 h-4 w-4" />Sign Out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <Link href="/login">
                  <Button variant="outline" size="sm" className="rounded-md font-medium" style={{ borderColor: "#1a73e8", color: "#1a73e8" }}>
                    Login
                  </Button>
                </Link>
              )}
            </>
          )}

          <Link href="/listing/new">
            <Button size="sm" className="rounded-md font-semibold text-white" style={{ background: "linear-gradient(180deg, #4285f4, #1a73e8)" }}>
              Post Property
            </Button>
          </Link>

          {/* Mobile */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger className="inline-flex h-9 w-9 items-center justify-center rounded-md md:hidden hover:bg-gray-100">
              <Menu className="h-5 w-5" style={{ color: "#414754" }} />
            </SheetTrigger>
            <SheetContent side="right" className="w-72 bg-white">
              <div className="mt-8 flex flex-col gap-2">
                {NAV_LINKS.map((link) => (
                  <Link key={link.label} href={link.href} onClick={() => setOpen(false)}
                    className="rounded-md px-4 py-3 text-sm font-medium hover:bg-gray-50" style={{ color: "#414754" }}>
                    {link.label}
                  </Link>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
