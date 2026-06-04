"use client";
import React from 'react';
import { ArrowLeft, Mountain, Shield, Palette, Wrench } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Script from "next/script";

export default function AboutMarblePage() {
  const router = useRouter();

  const marbleFeatures = [
    {
      icon: <Mountain className="w-8 h-8 text-blue-400" />,
      title: "الأصل الطبيعي",
      description: "الرخام هو صخور متحولة تتكون من الكالسيت أو الدولوميت، وهو يتميز بجماله الطبيعي ومتانته العالية."
    },
    {
      icon: <Shield className="w-8 h-8 text-green-400" />,
      title: "المتانة والقوة",
      description: "يتميز الرخام بقوته العالية ومقاومته للخدوش والتآكل، مما يجعله مثالياً للاستخدامات الداخلية والخارجية."
    },
    {
      icon: <Palette className="w-8 h-8 text-purple-400" />,
      title: "التنوع في الألوان",
      description: "يأتي الرخام بألوان متنوعة من الأبيض النقي إلى الأسود الداكن، مع عروق طبيعية تجعل كل قطعة فريدة."
    },
    {
      icon: <Wrench className="w-8 h-8 text-orange-400" />,
      title: "سهولة الصيانة",
      description: "سهل التنظيف والصيانة، ولا يتطلب سوى مواد تنظيف بسيطة للحفاظ على لمعانه."
    }
  ];

  const marbleTypes = [
    {
      name: "رخام كرارا",
      origin: "إيطاليا",
      description: "الرخام الأبيض الكلاسيكي المعروف بصفائه ونقائه، يُستخدم في أرقى المباني حول العالم.",
      image: "/acessts/marble-types/carrara.jpg"
    },
    {
      name: "رخام ترافرتين",
      origin: "تركيا",
      description: "رخام بني فاتح مع ثقوب طبيعية، يتميز بمظهره الفريد واستخدامه في التصاميم الحديثة.",
      image: "/acessts/marble-types/travertine.jpg"
    },
    {
      name: "رخام إمبرادور",
      origin: "البرازيل",
      description: "رخام أحمر داكن مع عروق ذهبية، يُعتبر من أغلى أنواع الرخام في العالم.",
      image: "/acessts/marble-types/emperador.jpg"
    },
    {
      name: "رخام بيانكو",
      origin: "مختلف الدول",
      description: "رخام أبيض نقي مع عروق رمادية أو سوداء، مثالي للتصاميم الأنيقة.",
      image: "/acessts/marble-types/bianco.jpg"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900/20 to-purple-900/20 text-white">
      <Script
        id="about-marble-article-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: "أنواع الرخام في مصر | شق التعبان",
            description:
              "تعرف على أنواع الرخام في مصر ومميزاته واستخداماته مع مقارنة الرخام والجرانيت ونصائح اختيار الرخام من شق التعبان.",
            url: "https://www.shkelteaban.com/about-marble",
            inLanguage: "ar",
          }),
        }}
      />
      {/* Header */}
      <div className="bg-gradient-to-br from-slate-800 via-blue-900 to-purple-900 py-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg mb-8 mx-auto transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            العودة
          </button>

          <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
            تعرف على الرخام
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            اكتشف عالم الرخام الرائع، من أصله الطبيعي إلى استخداماته المتنوعة في التصميم والديكور
          </p>
        </div>
      </div>

      {/* Features Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-white">مميزات الرخام</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {marbleFeatures.map((feature, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:border-blue-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/20"
              >
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-3 text-white">{feature.title}</h3>
                <p className="text-gray-300 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Types Section */}
      <section className="py-16 px-4 bg-slate-800/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-white">أنواع الرخام الشهيرة</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {marbleTypes.map((type, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-slate-700/90 to-slate-800/90 backdrop-blur-xl rounded-2xl overflow-hidden border border-white/10 hover:border-purple-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/20"
              >
                <div className="h-48 bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center">
                  <Mountain className="w-16 h-16 text-gray-400" />
                </div>
                <div className="p-6">
                  <h3 className="text-2xl font-bold mb-2 text-white">{type.name}</h3>
                  <p className="text-purple-400 font-medium mb-3">الأصل: {type.origin}</p>
                  <p className="text-gray-300 leading-relaxed">{type.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Uses Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-white">استخدامات الرخام</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🏠</span>
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">الاستخدام المنزلي</h3>
              <p className="text-gray-300">أرضيات المطابخ والحمامات، واجهات المواقد، وطاولات الطعام</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🏢</span>
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">المباني التجارية</h3>
              <p className="text-gray-300">واجهات المباني، لوبي الفنادق، وأرضيات المكاتب الفاخرة</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎨</span>
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">الأعمال الفنية</h3>
              <p className="text-gray-300">التماثيل، المنحوتات، والأعمال الفنية المعمارية</p>
            </div>
          </div>
        </div>
      </section>

      {/* Care Tips */}
      <section className="py-16 px-4 bg-slate-800/50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-8 text-white">نصائح للعناية بالرخام</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-slate-700/90 to-slate-800/90 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
              <h3 className="text-xl font-bold mb-4 text-blue-400">التنظيف اليومي</h3>
              <ul className="text-gray-300 text-right space-y-2">
                <li>• استخدم الماء والصابون الخفيف</li>
                <li>• تجنب المواد الكيميائية القوية</li>
                <li>• امسح البقع فوراً</li>
                <li>• استخدم إسفنجة ناعمة</li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-slate-700/90 to-slate-800/90 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
              <h3 className="text-xl font-bold mb-4 text-green-400">الحماية والصيانة</h3>
              <ul className="text-gray-300 text-right space-y-2">
                <li>• ضع حامي الرخام كل 6-12 شهر</li>
                <li>• تجنب الأحماض والمواد الحمضية</li>
                <li>• استخدم واقيات الأثاث</li>
                <li>• تجنب التعرض المباشر لأشعة الشمس</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}