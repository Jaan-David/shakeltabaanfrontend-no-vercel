"use client";
import { useState, useEffect } from 'react';
import PartnerCard from './PartnerCard';
import { organizationService, Organization } from '@/services/api/organizations';
import { Api } from '@/services/api/endpoints';

// Prevent static prerendering which causes auth context errors
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

  const getTypeLabel = (organization: Organization): Partner['typeLabel'] => {
    const name = (organization.name || '').toLowerCase();
    if (name.includes('مصنع')) return 'مصنع';
    if (name.includes('معرض')) return 'معرض';
    return 'شركة';
  };

  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        setLoading(true);
        const data = await organizationService.getOrganizations();
        
        const mappedPartners: Partner[] = data.map((org: Organization, index: number) => {
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

  return (
    <section className="px-4 pb-16">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 md:text-3xl">
            شركاؤنا من المصانع والمعارض الموثوقة
          </h2>
          <p className="mt-2 text-sm text-slate-600 md:text-base">
            نتعاون مع أفضل الموردين في مجال الرخام والجرانيت لتقديم أفضل جودة وأسعار
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center rounded-2xl border border-slate-200 bg-white py-16">
            <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-500"></div>
          </div>
        ) : partners.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white py-16 text-center">
            <div className="text-5xl">🤝</div>
            <h3 className="mt-4 text-xl font-semibold text-slate-900">لا يوجد شركاء حالياً</h3>
            <p className="mt-2 text-sm text-slate-500">جاري العمل على إضافة شركاء جدد</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
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
        )}

        <div className="flex justify-center">
          <button
            type="button"
            className="rounded-xl border border-blue-200 bg-white px-6 py-3 text-sm font-semibold text-blue-700 transition hover:border-blue-300 hover:bg-blue-50"
          >
            عرض جميع الشركاء
          </button>
        </div>
      </div>
    </section>
  );
}