const IMAGE_EXTENSIONS = /\.(jpg|jpeg|png|gif|webp|svg|bmp|heic|heif)(\?|#|$)/i;
const VIDEO_EXTENSIONS = /\.(mp4|mov|m4v|webm|ogv|ogg)(\?|#|$)/i;

export const isSupportedMediaUrl = (value: string): boolean => {
  const trimmed = value.trim();
  if (!trimmed) return false;
  if (trimmed.startsWith("data:") || trimmed.startsWith("blob:")) return true;
  return IMAGE_EXTENSIONS.test(trimmed) || VIDEO_EXTENSIONS.test(trimmed);
};

export const normalizeMediaList = (list: Array<string | null | undefined>): string[] => {
  const media = list
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter((item) => isSupportedMediaUrl(item));

  return Array.from(new Set(media));
};

export const getPrimaryMedia = (
  list: Array<string | null | undefined>,
  placeholder: string
): string => {
  const media = normalizeMediaList(list);
  return media[0] || placeholder;
};
