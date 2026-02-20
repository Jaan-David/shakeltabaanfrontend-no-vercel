"use client";

import Image from "next/image";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PreviousWorkCardProps {
  title: string;
  description?: string;
  images: string[];
  primaryImage: string;
  isRemote: boolean;
}

export default function PreviousWorkCard({
  title,
  description,
  images,
  primaryImage,
  isRemote,
}: PreviousWorkCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Get valid images list
  const validImages = images.filter((img) => img && img !== "");
  const displayImages = validImages.length > 0 ? validImages : [primaryImage];
  const showGallery = displayImages.length > 1;
  const currentImage = displayImages[currentImageIndex] || primaryImage;

  const handlePrevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === 0 ? displayImages.length - 1 : prev - 1));
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === displayImages.length - 1 ? 0 : prev + 1));
  };

  const hasDescription = Boolean(description?.trim());

  return (
    <div className="group h-full flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      {/* Image Container with Gallery */}
      <div className="relative aspect-[16/10] w-full flex-shrink-0">
        <Image
          key={currentImage}
          src={currentImage}
          alt={`${title} - الصورة ${currentImageIndex + 1}`}
          width={520}
          height={340}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          unoptimized={isRemote}
        />
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-slate-900/20 to-transparent opacity-70 transition-opacity duration-300 group-hover:opacity-80" />

        {/* Image Counter Badge */}
        {showGallery && (
          <div className="absolute top-3 right-3 bg-slate-900/70 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-semibold text-white">
            {currentImageIndex + 1}/{displayImages.length}
          </div>
        )}

        {/* Gallery Navigation Buttons */}
        {showGallery && (
          <>
            <button
              onClick={handlePrevImage}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/40 transition-colors duration-200 text-white"
              aria-label="الصورة السابقة"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <button
              onClick={handleNextImage}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/40 transition-colors duration-200 text-white"
              aria-label="الصورة التالية"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Image Dots Indicator */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 z-10">
              {displayImages.map((_, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setCurrentImageIndex(index);
                  }}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index === currentImageIndex
                      ? "w-6 bg-white"
                      : "w-2 bg-white/50 hover:bg-white/70"
                  }`}
                  aria-label={`انتقل إلى الصورة ${index + 1}`}
                />
              ))}
            </div>
          </>
        )}

        {/* Title Overlay */}
        <div className="absolute bottom-4 right-4 left-4 md:bottom-6 md:right-6 md:left-6">
          <h4 className="text-base md:text-lg font-semibold text-white line-clamp-2">
            {title}
          </h4>
        </div>
      </div>

      {/* Description Section - Premium UX Spacing */}
      {hasDescription && (
        <div className="flex-grow px-5 md:px-6 py-4 md:py-5 flex flex-col space-y-3 border-t border-slate-100">
          <p className="text-sm text-slate-600 leading-relaxed line-clamp-3">
            {description}
          </p>
          <div className="flex-grow" />
        </div>
      )}

      {/* Metadata Footer - Image Count Indicator */}
      {showGallery && (
        <div className="px-5 md:px-6 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            <p className="text-xs font-medium text-slate-600">
              معرض صور ({displayImages.length})
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
