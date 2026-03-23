const IMAGE_EXTENSIONS = /\.(jpg|jpeg|png|gif|webp|svg|bmp|heic|heif)(\?|#|$)/i;
const VIDEO_EXTENSIONS = /\.(mp4|mov|m4v|webm|ogv|ogg)(\?|#|$)/i;

type UnknownMedia =
  | string
  | null
  | undefined
  | {
      url?: string;
      src?: string;
      path?: string;
      file?: string;
      fileUrl?: string;
      videoUrl?: string;
      secure_url?: string;
      type?: string;
      mediaType?: string;
      mimeType?: string;
      contentType?: string;
      resourceType?: string;
      resource_type?: string;
      kind?: string;
    };

export const isSupportedMediaUrl = (value: string): boolean => {
  const trimmed = value.trim().replace(/\\/g, "/");
  if (!trimmed) return false;
  if (trimmed.includes("#video")) return true;
  if (trimmed.startsWith("data:") || trimmed.startsWith("blob:")) return true;
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return true;
  if (
    trimmed.startsWith("/uploads/") ||
    trimmed.startsWith("uploads/") ||
    trimmed.startsWith("/public/") ||
    trimmed.startsWith("public/")
  ) {
    return true;
  }
  return IMAGE_EXTENSIONS.test(trimmed) || VIDEO_EXTENSIONS.test(trimmed);
};

export const isVideoMediaUrl = (value: string): boolean => {
  const trimmed = value.trim().replace(/\\/g, "/");
  if (!trimmed) return false;
  if (trimmed.includes("#video")) return true;
  if (/(^|[/?&=_-])video([/?&=_-]|$)/i.test(trimmed)) return true;
  return VIDEO_EXTENSIONS.test(trimmed);
};

const hasVideoHint = (item: Exclude<UnknownMedia, string | null | undefined>): boolean => {
  const hintSource = [
    item.type,
    item.mediaType,
    item.mimeType,
    item.contentType,
    item.resourceType,
    item.resource_type,
    item.kind,
  ]
    .filter((v): v is string => typeof v === "string" && v.trim().length > 0)
    .join(" ")
    .toLowerCase();

  return hintSource.includes("video");
};

const toMediaUrl = (item: UnknownMedia): string | null => {
  if (typeof item === "string") {
    return item;
  }

  if (!item || typeof item !== "object") {
    return null;
  }

  const raw = (
    item.url ||
    item.src ||
    item.path ||
    item.file ||
    item.fileUrl ||
    item.videoUrl ||
    item.secure_url ||
    null
  );

  if (!raw) return null;

  if (hasVideoHint(item) && !isVideoMediaUrl(raw)) {
    return `${raw}#video`;
  }

  return raw;
};

export const normalizeMediaList = (list: Array<UnknownMedia>): string[] => {
  const media = list
    .map((item) => toMediaUrl(item))
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim().replace(/\\/g, "/"))
    .filter((item) => isSupportedMediaUrl(item));

  return Array.from(new Set(media));
};

export const getProductMediaList = (product: Record<string, any> | null | undefined): string[] => {
  if (!product || typeof product !== "object") return [];

  const buckets: UnknownMedia[] = [];
  const arrayFields = [
    "imageList",
    "images",
    "mediaList",
    "videos",
    "videoList",
    "gallery",
    "attachments",
    "assets",
    "files",
  ];

  for (const field of arrayFields) {
    const value = product[field];
    if (Array.isArray(value)) {
      buckets.push(...value);
    }
  }

  buckets.push(
    product.image,
    product.video,
    product.media,
    product.thumbnail,
    product.mainImage,
    product.coverImage
  );

  return normalizeMediaList(buckets);
};

export const getPrimaryMedia = (
  list: Array<UnknownMedia>,
  placeholder: string
): string => {
  const media = normalizeMediaList(list);
  return media[0] || placeholder;
};
