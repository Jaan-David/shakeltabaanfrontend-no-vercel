#!/bin/bash

# 🔍 سكريبت التحقق من ملفات WOFF2
# How to use: bash scripts/check-fonts.sh

set -e

FONTS_DIR="./public/fonts/beiruti/static"
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║       فحص ملفات الخطوط - Font Check    ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""

# الملفات المطلوبة
declare -a FONTS=(
  "Beiruti-Regular.ttf"
  "Beiruti-Medium.ttf"
  "Beiruti-SemiBold.ttf"
  "Beiruti-Bold.ttf"
  "Beiruti-Regular.woff2"
  "Beiruti-Medium.woff2"
  "Beiruti-SemiBold.woff2"
  "Beiruti-Bold.woff2"
)

# التحقق من وجود المجلد
if [ ! -d "$FONTS_DIR" ]; then
  echo -e "${RED}✗ خطأ: المجلد غير موجود${NC}"
  echo "  المسار: $FONTS_DIR"
  exit 1
fi

echo -e "${YELLOW}📁 المجلد: $FONTS_DIR${NC}"
echo ""

# عداد الملفات
total=0
found=0
ttf_size=0
woff2_size=0

echo -e "${BLUE}ملفات TTF (الأصلية):${NC}"
for font in Beiruti-Regular.ttf Beiruti-Medium.ttf Beiruti-SemiBold.ttf Beiruti-Bold.ttf; do
  total=$((total+1))
  if [ -f "$FONTS_DIR/$font" ]; then
    found=$((found+1))
    size=$(ls -lh "$FONTS_DIR/$font" | awk '{print $5}')
    ttf_size=$((ttf_size + $(ls -l "$FONTS_DIR/$font" | awk '{print $5}')))
    echo -e "  ${GREEN}✓${NC} $font ($size)"
  else
    echo -e "  ${RED}✗${NC} $font (غير موجود)"
  fi
done

echo ""
echo -e "${BLUE}ملفات WOFF2 (المحسّنة):${NC}"
woff2_found=0
# Check for both named formats: 'Beiruti-*.woff2' and 'subset-Beiruti-*.woff2'
for font in subset-Beiruti-Regular.woff2 subset-Beiruti-Medium.woff2 subset-Beiruti-SemiBold.woff2 subset-Beiruti-Bold.woff2 Beiruti-Regular.woff2 Beiruti-Medium.woff2 Beiruti-SemiBold.woff2 Beiruti-Bold.woff2; do
  if [ -f "$FONTS_DIR/$font" ]; then
    woff2_found=$((woff2_found+1))
    found=$((found+1))
    total=$((total+1))
    size=$(ls -lh "$FONTS_DIR/$font" | awk '{print $5}')
    woff2_size=$((woff2_size + $(ls -l "$FONTS_DIR/$font" | awk '{print $5}')))
    echo -e "  ${GREEN}✓${NC} $font ($size)"
  fi
done

# If no WOFF2 found, show message
if [ $woff2_found -eq 0 ]; then
  for font in Beiruti-Regular.woff2 Beiruti-Medium.woff2 Beiruti-SemiBold.woff2 Beiruti-Bold.woff2; do
    total=$((total+1))
    echo -e "  ${YELLOW}○${NC} $font (لم يتم التحويل بعد)"
  done
fi

echo ""
echo -e "${BLUE}📊 الملخص:${NC}"
echo "  إجمالي الملفات المتوقعة: $total"
echo "  الملفات الموجودة: $found"

if [ $woff2_found -gt 0 ]; then
  ttf_kb=$((ttf_size / 1024))
  woff2_kb=$((woff2_size / 1024))
  savings=$((100 - (woff2_kb * 100 / ttf_kb)))
  echo -e "  حجم TTF الكلي: ${YELLOW}$ttf_kb KB${NC}"
  echo -e "  حجم WOFF2 الكلي: ${GREEN}$woff2_kb KB${NC}"
  echo -e "  الحفظ: ${GREEN}$savings %${NC} 📉"
fi

echo ""

# التحقق من الحالة
if [ $woff2_found -eq 4 ]; then
  echo -e "${GREEN}✓ جاهز! جميع ملفات WOFF2 موجودة${NC}"
  echo -e "${BLUE}الخطوة التالية:${NC}"
  echo "  1. قم بتشغيل: npm run build"
  echo "  2. ثم: npm run start"
  echo "  3. اختبر على: http://localhost:3000"
  exit 0
elif [ $woff2_found -gt 0 ]; then
  echo -e "${YELLOW}⚠ تنبيه: بعض ملفات WOFF2 موجودة ($woff2_found من 4)${NC}"
  echo "  استكمل التحويل في transfonter.org"
  exit 1
else
  echo -e "${YELLOW}○ معلومة: لم يتم تحويل ملفات WOFF2 بعد${NC}"
  echo -e "${BLUE}للتحويل:${NC}"
  echo "  1. اذهب إلى: https://transfonter.org"
  echo "  2. احمّل ملفات TTF الـ 4"
  echo "  3. اختر WOFF2 وحمّل"
  echo "  4. انسخ الملفات إلى: $FONTS_DIR"
  echo "  5. شغّل السكريبت مرة أخرى"
  exit 1
fi
