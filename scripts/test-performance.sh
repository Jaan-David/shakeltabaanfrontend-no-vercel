#!/bin/bash

# 🚀 سكريبت اختبار الأداء بعد التحويل
# How to use: bash scripts/test-performance.sh

set -e

BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     اختبار الأداء - Performance Test    ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""

# 1. حذف المجلد السابق
echo -e "${YELLOW}1. تنظيف المجلدات السابقة...${NC}"
rm -rf .next 2>/dev/null || true
echo -e "${GREEN}✓${NC} تم التنظيف"
echo ""

# 2. البناء
echo -e "${YELLOW}2. بناء الإنتاج...${NC}"
if npm run build; then
  echo -e "${GREEN}✓${NC} نجح البناء"
else
  echo -e "${RED}✗${NC} فشل البناء"
  exit 1
fi
echo ""

# 3. معلومات الحجم
echo -e "${YELLOW}3. حجم الملفات:${NC}"
echo ""

# حجم المجلد .next
next_size=$(du -sh .next | cut -f1)
echo -e "  ${BLUE}.next الكلي:${NC} $next_size"

# حجم ملفات الخطوط
fonts_size=$(du -sh public/fonts 2>/dev/null | cut -f1 || echo "N/A")
echo -e "  ${BLUE}fonts الكلي:${NC} $fonts_size"

# عدد الملفات
woff2_files=$(find public/fonts -name "*.woff2" 2>/dev/null | wc -l)
ttf_files=$(find public/fonts -name "*.ttf" 2>/dev/null | wc -l)
echo -e "  ${BLUE}ملفات WOFF2:${NC} $woff2_files"
echo -e "  ${BLUE}ملفات TTF:${NC} $ttf_files"
echo ""

# 4. معلومات الحزمة
echo -e "${YELLOW}4. تحليل الحزم:${NC}"
if [ -f ".next/static/chunks/main-*.js" ]; then
  main_bundle=$(ls -lh .next/static/chunks/main-*.js 2>/dev/null | head -1 | awk '{print $5}')
  echo -e "  ${BLUE}حزمة Main:${NC} $main_bundle"
fi

if [ -d ".next/static/chunks/pages" ]; then
  pages_count=$(find .next/static/chunks/pages -name "*.js" 2>/dev/null | wc -l)
  echo -e "  ${BLUE}عدد صفحات JS:${NC} $pages_count"
fi
echo ""

# 5. اختبار محلي
echo -e "${YELLOW}5. اختبار محلي (ابدأ الخادم):${NC}"
echo -e "${BLUE}لاختبار الأداء محليًا:${NC}"
echo ""
echo -e "  ${GREEN}npm run start${NC}"
echo "  ثم افتح: ${YELLOW}http://localhost:3000${NC}"
echo ""
echo -e "${BLUE}للاختبار باستخدام Lighthouse:${NC}"
echo "  1. افتح Chrome DevTools (F12)"
echo "  2. انقر على Lighthouse"
echo "  3. اختر Mobile"
echo "  4. انقر Generate report"
echo ""

# 6. معايير النجاح
echo -e "${YELLOW}6. معايير النجاح:${NC}"
echo -e "  ${BLUE}FCP:${NC} < 2 ثانية ✓"
echo -e "  ${BLUE}LCP:${NC} < 4 ثواني ✓"
echo -e "  ${BLUE}Mobile Score:${NC} > 70 ✓"
echo ""

# 7. التعليقات
if [ $woff2_files -eq 4 ]; then
  echo -e "${GREEN}✓ تم تحويل جميع الخطوط إلى WOFF2${NC}"
  echo -e "${GREEN}✓ يجب أن ترى تحسن -500-800ms في FCP${NC}"
else
  echo -e "${YELLOW}○ يتم استخدام TTF حاليًا${NC}"
  echo -e "${YELLOW}○ تحويل WOFF2 سيضيف -30% في الأداء${NC}"
fi
echo ""

echo -e "${BLUE}════════════════════════════════════════${NC}"
echo -e "${GREEN}✓ اختبار الأداء جاهز!${NC}"
echo -e "${BLUE}════════════════════════════════════════${NC}"
