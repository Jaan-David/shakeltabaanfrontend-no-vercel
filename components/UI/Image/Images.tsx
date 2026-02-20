"use client";

import React, { useMemo, useState, useEffect } from "react";
import Image, { StaticImageData } from "next/image";
import { cn } from "@/lib/utils";
import { CSSProperties } from 'react';

interface ImageProps {
  src: string | StaticImageData;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  objectFit?: "cover" | "contain" | "fill" | "none" | "scale-down";
  priority?: boolean;
  rounded?: "none" | "sm" | "md" | "lg" | "full";
  fallbackSrc?: string;
  fill?: boolean;
  onClick?: () => void;
  style?: CSSProperties;
  sizes?: string;
}

interface MediaProps extends ImageProps {
  controls?: boolean;
  muted?: boolean;
  loop?: boolean;
  playsInline?: boolean;
  preload?: "none" | "metadata" | "auto";
}

const HEIC_REGEX = /\.(heic|heif)(\?|#|$)/i;
const VIDEO_REGEX = /\.(mp4|mov|m4v|webm|ogv|ogg)(\?|#|$)/i;

const ALLOWED_PROXY_HOSTS = new Set([
  "shakeltabaanstorage.blob.core.windows.net",
]);

const resolveMediaSrc = (src: string | StaticImageData, fallbackSrc: string) => {
  if (typeof src !== "string") {
    return src;
  }
  const trimmed = src.trim();
  if (!trimmed) {
    return fallbackSrc;
  }
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    try {
      const url = new URL(trimmed);
      if (
        ALLOWED_PROXY_HOSTS.has(url.hostname) &&
        (HEIC_REGEX.test(trimmed) || VIDEO_REGEX.test(trimmed))
      ) {
        return `/api/media?url=${encodeURIComponent(trimmed)}`;
      }
    } catch {
      return trimmed;
    }
    return trimmed;
  }
  if (trimmed.startsWith("/")) {
    return trimmed;
  }
  const apiBase = (
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "https://shakeltaaban-d8cwcdeteadge4fe.switzerlandnorth-01.azurewebsites.net/app/v1"
  ).replace(/\/app\/v1\/?$/, "");
  if (!apiBase) {
    return `/${trimmed}`;
  }
  return `${apiBase}/${trimmed.replace(/^\//, "")}`;
};

const getProxyTarget = (value: string): string | null => {
  try {
    const parsed = new URL(value, "http://local");
    if (parsed.pathname === "/api/media") {
      return parsed.searchParams.get("url");
    }
  } catch {
    return null;
  }
  return null;
};

const isVideoSource = (src: string | StaticImageData): boolean => {
  if (typeof src !== "string") return false;
  if (VIDEO_REGEX.test(src)) return true;
  const proxied = getProxyTarget(src);
  return proxied ? VIDEO_REGEX.test(proxied) : false;
};

const isHeicSource = (src: string | StaticImageData): boolean => {
  if (typeof src !== "string") return false;
  if (HEIC_REGEX.test(src)) return true;
  const proxied = getProxyTarget(src);
  return proxied ? HEIC_REGEX.test(proxied) : false;
};

export function CustomImage({
  src,
  alt,
  width,
  height,
  className,
  objectFit = "cover",
  priority,
  rounded = "none",
  fallbackSrc = "/acessts/NoImage.jpg",
  fill,
  onClick,
  style,
  sizes,
  ...props
}: ImageProps) {
  const resolvedSrc = useMemo(() => resolveMediaSrc(src, fallbackSrc), [src, fallbackSrc]);

  const isRemoteSrc =
    typeof resolvedSrc === "string" &&
    (resolvedSrc.startsWith("http://") || resolvedSrc.startsWith("https://"));

  const [imgSrc, setImgSrc] = useState(resolvedSrc);
  const [convertedSrc, setConvertedSrc] = useState<string | null>(null);
  const [isConverting, setIsConverting] = useState(false);

  useEffect(() => {
    setImgSrc(resolvedSrc);
    setConvertedSrc(null);
  }, [resolvedSrc]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!isHeicSource(resolvedSrc) || typeof resolvedSrc !== "string") {
      setConvertedSrc(null);
      return;
    }

    let isActive = true;
    let objectUrl: string | null = null;
    const controller = new AbortController();

    const convert = async () => {
      try {
        setIsConverting(true);
        const response = await fetch(resolvedSrc, { signal: controller.signal });
        const blob = await response.blob();
        const mod = await import("heic2any");
        const heic2any = mod.default as (input: {
          blob: Blob;
          toType?: string;
          quality?: number;
        }) => Promise<Blob | Blob[]>;
        const converted = await heic2any({ blob, toType: "image/jpeg", quality: 0.9 });
        const convertedBlob = Array.isArray(converted) ? converted[0] : converted;
        objectUrl = URL.createObjectURL(convertedBlob);
        if (isActive) {
          setConvertedSrc(objectUrl);
        }
      } catch {
        if (isActive) {
          setConvertedSrc(null);
        }
      } finally {
        if (isActive) {
          setIsConverting(false);
        }
      }
    };

    convert();

    return () => {
      isActive = false;
      controller.abort();
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [resolvedSrc]);

  const handleError = () => {
    if (imgSrc !== fallbackSrc) setImgSrc(fallbackSrc);
  };

  const roundedClasses = {
    none: "",
    sm: "rounded-sm",
    md: "rounded-md",
    lg: "rounded-lg",
    full: "rounded-full",
  };

  const isHeic = isHeicSource(imgSrc);
  const displaySrc = convertedSrc ?? (isHeic && isConverting ? fallbackSrc : imgSrc);
  const shouldUseImgTag = isHeic || !!convertedSrc;

  return (
    <div
      className={cn(
        "relative overflow-hidden",
        roundedClasses[rounded],
        className
      )}
      onClick={onClick}
    >
      {shouldUseImgTag ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={displaySrc as string}
          alt={alt}
          onError={handleError}
          loading={priority ? "eager" : "lazy"}
          crossOrigin="anonymous"
          className={cn(
            objectFit === "cover" && "object-cover",
            objectFit === "contain" && "object-contain",
            objectFit === "fill" && "object-fill",
            objectFit === "none" && "object-none",
            objectFit === "scale-down" && "object-scale-down",
            "transition-opacity duration-300",
            fill ? "absolute inset-0 h-full w-full" : ""
          )}
          style={style}
        />
      ) : (
        <Image
          src={displaySrc}
          alt={alt}
          fill={fill}
          width={!fill ? width : undefined}
          height={!fill ? height : undefined}
          sizes={sizes}
          onError={handleError}
          priority={priority}
          unoptimized={isRemoteSrc}
          className={cn(
            objectFit === "cover" && "object-cover",
            objectFit === "contain" && "object-contain",
            objectFit === "fill" && "object-fill",
            objectFit === "none" && "object-none",
            objectFit === "scale-down" && "object-scale-down",
            "transition-opacity duration-300"
          )}
          style={style}
          {...props}
        />
      )}
    </div>
  );
}

export function CustomMedia({
  src,
  alt,
  width,
  height,
  className,
  objectFit = "cover",
  priority,
  rounded = "none",
  fallbackSrc = "/acessts/NoImage.jpg",
  fill,
  onClick,
  style,
  controls = true,
  muted = true,
  loop = false,
  playsInline = true,
  preload = "metadata",
  ...props
}: MediaProps) {
  const resolvedSrc = useMemo(() => resolveMediaSrc(src, fallbackSrc), [src, fallbackSrc]);
  const [mediaError, setMediaError] = useState(false);
  const isVideo = isVideoSource(resolvedSrc);

  if (!isVideo || mediaError) {
    return (
      <CustomImage
        src={resolvedSrc as string | StaticImageData}
        alt={alt}
        width={width}
        height={height}
        className={className}
        objectFit={objectFit}
        priority={priority}
        rounded={rounded}
        fallbackSrc={fallbackSrc}
        fill={fill}
        onClick={onClick}
        style={style}
        {...props}
      />
    );
  }

  const roundedClasses = {
    none: "",
    sm: "rounded-sm",
    md: "rounded-md",
    lg: "rounded-lg",
    full: "rounded-full",
  };

  return (
    <div
      className={cn(
        "relative overflow-hidden",
        roundedClasses[rounded],
        className
      )}
      onClick={onClick}
    >
      <video
        src={resolvedSrc as string}
        width={!fill ? width : undefined}
        height={!fill ? height : undefined}
        controls={controls}
        muted={muted}
        loop={loop}
        playsInline={playsInline}
        preload={preload}
        onError={() => setMediaError(true)}
        aria-label={alt}
        crossOrigin="anonymous"
        className={cn(
          objectFit === "cover" && "object-cover",
          objectFit === "contain" && "object-contain",
          objectFit === "fill" && "object-fill",
          objectFit === "none" && "object-none",
          objectFit === "scale-down" && "object-scale-down",
          fill ? "absolute inset-0 h-full w-full" : ""
        )}
        style={style}
      />
    </div>
  );
}
