"use client";

import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, X, Camera } from "lucide-react";
import type { ListingMedia } from "@/lib/supabase/types";

interface ListingGalleryProps {
  media: ListingMedia[];
  title: string;
}

export function ListingGallery({ media, title }: ListingGalleryProps) {
  const photos = media.filter((m) => m.type === "photo");
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  if (photos.length === 0) {
    return (
      <div className="aspect-[16/9] rounded-xl bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center">
        <div className="text-center text-gray-400">
          <Camera className="mx-auto mb-2 h-12 w-12" />
          <p>No photos available</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-2">
        {/* Hero Image */}
        <div
          className="relative aspect-[16/9] cursor-pointer overflow-hidden rounded-xl"
          onClick={() => setLightboxOpen(true)}
        >
          <img
            src={photos[activeIndex]?.url}
            alt={`${title} - Photo ${activeIndex + 1}`}
            className="h-full w-full object-cover"
          />
          <div className="absolute bottom-3 right-3 rounded bg-black/60 px-2 py-1 text-xs text-white">
            <Camera className="mr-1 inline h-3 w-3" />
            {photos.length} photos
          </div>
        </div>

        {/* Thumbnails */}
        {photos.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {photos.slice(0, 6).map((photo, idx) => (
              <button
                key={photo.id}
                onClick={() => setActiveIndex(idx)}
                className={`relative h-16 w-24 flex-shrink-0 overflow-hidden rounded-md ${
                  idx === activeIndex ? "ring-2 ring-blue-500" : "opacity-70 hover:opacity-100"
                }`}
              >
                <img src={photo.url} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
            {photos.length > 6 && (
              <button
                onClick={() => setLightboxOpen(true)}
                className="flex h-16 w-24 flex-shrink-0 items-center justify-center rounded-md bg-gray-100 text-sm font-medium text-gray-600"
              >
                +{photos.length - 6} more
              </button>
            )}
          </div>
        )}
      </div>

      {/* Lightbox */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-4xl border-0 bg-black/95 p-0">
          <div className="relative flex items-center justify-center p-4">
            <button
              onClick={() => setLightboxOpen(false)}
              className="absolute right-4 top-4 z-10 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
            >
              <X className="h-5 w-5" />
            </button>

            {photos.length > 1 && (
              <button
                onClick={() => setActiveIndex((prev) => (prev > 0 ? prev - 1 : photos.length - 1))}
                className="absolute left-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
            )}

            <img
              src={photos[activeIndex]?.url}
              alt={`${title} - Photo ${activeIndex + 1}`}
              className="max-h-[80vh] rounded object-contain"
            />

            {photos.length > 1 && (
              <button
                onClick={() => setActiveIndex((prev) => (prev < photos.length - 1 ? prev + 1 : 0))}
                className="absolute right-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            )}

            <div className="absolute bottom-4 text-sm text-white/70">
              {activeIndex + 1} / {photos.length}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
