"use client";
import { useState, useEffect, useRef } from 'react';
import PartnerCard from './PartnerCard';
import { organizationService, Organization } from '@/services/api/organizations';
import { Api } from '@/services/api/endpoints';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './PartnersSection.module.css';

export const dynamic = 'force-dynamic';

interface Partner {
  id: string;
  name: string;
  logo: string;
  organizationId: string;
  location?: string;
  typeLabel: 'مصنع' | 'معرض' | 'شركة';
}

const imageBaseUrl = Api.replace(/\/app\/v1\/?$/, '');

const normalizeApiImage = (path?: string | null): string => {
  if (!path) return '/acessts/placeholder.svg';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const cleaned = path.startsWith('/') ? path.slice(1) : path;
  return `${imageBaseUrl}/${cleaned}`;
};

export default function PartnersSection() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const getTypeLabel = (organization: Organization): Partner['typeLabel'] => {
    const name = (organization.name || '').toLowerCase();
    if (name.includes('مصنع')) return 'مصنع';
    if (name.includes('معرض')) return 'معرض';
    return 'شركة';
  };

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Fetch organizations
  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        setLoading(true);
        const data = await organizationService.getOrganizations();

        const mappedPartners: Partner[] = data
          .filter((org: Organization) => {
            // Exclude ala5las organization
            return org.name?.toLowerCase() !== 'ala5las';
          })
          .map((org: Organization, index: number) => {
            const rawPhoto = org.photo || '';
            const logo = rawPhoto ? normalizeApiImage(rawPhoto) : '/acessts/placeholder.svg';
            return {
              id: org.organizationId || org.id || org._id || String(index),
              organizationId: org.organizationId,
              name: org.name,
              logo,
              location: org.location,
              typeLabel: getTypeLabel(org),
            };
          });
        setPartners(mappedPartners);
      } catch (error) {
        console.error('Error loading organizations:', error);
        setPartners([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrganizations();
  }, []);

  // Check scroll position
  const checkScroll = () => {
    if (!scrollContainerRef.current) return;

    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  useEffect(() => {
    checkScroll();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScroll);
      window.addEventListener('resize', checkScroll);
      return () => {
        container.removeEventListener('scroll', checkScroll);
        window.removeEventListener('resize', checkScroll);
      };
    }
  }, [partners]);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;
    const scrollAmount = 320; // Approximate card width + gap
    const newScrollLeft = direction === 'left'
      ? scrollContainerRef.current.scrollLeft - scrollAmount
      : scrollContainerRef.current.scrollLeft + scrollAmount;

    scrollContainerRef.current.scrollTo({
      left: newScrollLeft,
      behavior: 'smooth',
    });
  };

  return (
    <section className="px-4 pb-16" aria-labelledby="partners-title">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        {/* Header */}
        <div className="text-center">
          <h2 id="partners-title" className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900">
            شركاؤنا من المصانع والمعارض الموثوقة
          </h2>
          <p className="mt-3 text-base sm:text-lg text-slate-600">
            نتعاون مع أفضل الموردين في مجال الرخام والجرانيت لتقديم أفضل جودة وأسعار
          </p>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center rounded-2xl border border-slate-200 bg-white py-16">
            <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-500" />
          </div>
        ) : partners.length === 0 ? (
          // Empty State
          <div className="rounded-2xl border border-slate-200 bg-white py-16 text-center">
            <div className="text-5xl">🤝</div>
            <h3 className="mt-4 text-xl font-semibold text-slate-900">لا يوجد شركاء حالياً</h3>
            <p className="mt-2 text-sm text-slate-500">جاري العمل على إضافة شركاء جدد</p>
          </div>
        ) : (
          <>
            {/* Desktop Grid */}
            <div className="hidden md:grid gap-6 grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {partners.map((partner) => (
                <PartnerCard
                  key={partner.id}
                  name={partner.name}
                  logo={partner.logo}
                  typeLabel={partner.typeLabel}
                  location={partner.location}
                  href={`/organization/${encodeURIComponent(partner.organizationId)}`}
                />
              ))}
            </div>

            {/* Mobile Horizontal Scroll with Buttons */}
            <div className="md:hidden space-y-4">
              {/* Scroll Container */}
              <div className="relative">
                {/* Left Scroll Button */}
                {canScrollLeft && isMobile && (
                  <button
                    onClick={() => scroll('left')}
                    className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-all active:scale-95"
                    aria-label="التمرير لليسار"
                  >
                    <ChevronRight size={20} className="text-blue-600" />
                  </button>
                )}

                {/* Scroll Container */}
                <div
                  ref={scrollContainerRef}
                  className={`overflow-x-auto scroll-smooth snap-x snap-mandatory flex gap-4 px-12 py-2 ${styles.scrollContainer}`}
                >
                  {partners.map((partner) => (
                    <div key={partner.id} className="flex-shrink-0 w-64 snap-center">
                      <PartnerCard
                        name={partner.name}
                        logo={partner.logo}
                        typeLabel={partner.typeLabel}
                        location={partner.location}
                        href={`/organization/${encodeURIComponent(partner.organizationId)}`}
                      />
                    </div>
                  ))}
                </div>

                {/* Right Scroll Button */}
                {canScrollRight && isMobile && (
                  <button
                    onClick={() => scroll('right')}
                    className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-all active:scale-95"
                    aria-label="التمرير لليمين"
                  >
                    <ChevronLeft size={20} className="text-blue-600" />
                  </button>
                )}
              </div>

              {/* Mobile Scroll Indicator */}
              {isMobile && partners.length > 1 && (
                <div className="flex justify-center gap-1">
                  {Array.from({ length: Math.ceil(partners.length / 2) }).map((_, i) => (
                    <div
                      key={i}
                      className="h-1 w-6 rounded-full bg-slate-300"
                      aria-hidden="true"
                    />
                  ))}
                </div>
              )}

              {/* Scroll Hint */}
              {isMobile && canScrollRight && (
                <p className="text-center text-xs text-slate-500">
                  👈 تمرير لليسار لمشاهدة المزيد
                </p>
              )}
            </div>
          </>
        )}
      </div>

    </section>
  );
}