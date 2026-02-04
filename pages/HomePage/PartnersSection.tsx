"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './PartnersSection.module.css';
import { organizationService, Organization } from '@/services/api/organizations';

interface Partner {
  id: string;
  name: string;
  logo: string;
  organizationId: string;
}

const normalizeApiImage = (path?: string | null): string => {
  if (!path) return '/acessts/placeholder.svg';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const cleaned = path.startsWith('/') ? path.slice(1) : path;
  return `https://shk2t-t3ban.fly.dev/${cleaned}`;
};

export default function PartnersSection() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        setLoading(true);
        console.log('Fetching organizations...');
        const data = await organizationService.getOrganizations();
        console.log('Received organizations data:', data);
        
        const mappedPartners: Partner[] = data.map((org: Organization, index: number) => {
          const rawPhoto = org.photo || '';
          const logo = rawPhoto ? normalizeApiImage(rawPhoto) : '/acessts/placeholder.svg';
          return {
            id: org.organizationId || org.id || org._id || String(index),
            organizationId: org.organizationId,
            name: org.name,
            logo,
          };
        });
        
        console.log('Mapped partners:', mappedPartners);
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
    <section className={styles.partnersSection}>
      <div className={styles.header}>
        <h2 className={styles.sectionTitle}>شركاؤنا</h2>
        <p className={styles.sectionSubtitle}>
          نفخر بالشراكة مع أفضل الشركات في مجال الرخام والجرانيت
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
        </div>
      ) : partners.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🤝</div>
          <h3 className="text-2xl font-bold text-blue-900 mb-2">لا يوجد شركاء حالياً</h3>
          <p className="text-gray-400">جاري العمل على إضافة شركاء جدد</p>
        </div>
      ) : (
        <div className={styles.partnersGrid}>
          {partners.map((partner) => (
            <Link
              key={partner.id}
              href={`/organization/${encodeURIComponent(partner.organizationId)}`}
              className={styles.partnerCard}
            >
              <div className={styles.partnerLogo}>
                <img
                  src={partner.logo}
                  alt={partner.name}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/acessts/placeholder.svg';
                  }}
                />
              </div>
              <div className={styles.partnerInfo}>
                <h3 className={styles.partnerName}>{partner.name}</h3>
              </div>
            </Link>
          ))}
        </div>
      )}

      
    </section>
  );
}