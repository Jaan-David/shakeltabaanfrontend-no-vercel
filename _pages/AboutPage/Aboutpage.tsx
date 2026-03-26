import React from "react";
import Image from "next/image";

export default function AboutPage() {
  return (
    <div
      dir="rtl"
      className="
        w-full
        mx-auto mt-24
        mb-10
        rounded-3xl
        border border-gray-200
        p-6 sm:p-8 lg:p-12
        flex flex-col gap-6 sm:gap-8 lg:gap-10
        bg-white text-slate-900 shadow-sm
      "
    >
      {/* ===== Header ===== */}
      <section className="flex flex-col items-center text-center gap-4">
        <div className="w-48 h-28 sm:w-56 sm:h-32 rounded-2xl bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 p-2 shadow-sm">
          <div className="relative w-full h-full bg-white rounded-xl flex items-center justify-center">
            <Image
              src="/logo/logo1.png"
              alt="منصة شق الثعبان"
              fill
              className="object-contain"
              sizes="(max-width: 640px) 192px, 224px"
            />
          </div>
        </div>

        <span className="px-4 py-1 text-sm rounded-full bg-blue-100 text-blue-700 font-semibold">
          من نحن
        </span>

        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">
          منصة شق تعبان
        </h1>

        <p className="text-base sm:text-lg text-slate-600 max-w-3xl leading-relaxed">
          منصة إلكترونية مصرية متخصصة في تنظيم وتطوير سوق الرخام والجرانيت والكوارتز داخل جمهورية مصر العربية، وتهدف إلى ربط جميع أطراف السوق في نظام رقمي واحد شفاف وموثوق.
        </p>
      </section>

      {/* ===== Intro ===== */}
      <section className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-sm">
        <p className="text-slate-600 leading-relaxed text-base sm:text-lg">
          انطلقت فكرة المنصة من واقع عملي حقيقي، بعد ملاحظة التحديات الكبيرة التي يواجهها سوق الرخام في مصر، سواء من ناحية المصانع والمعارض أو من ناحية العملاء النهائيين، مثل الاعتماد على الوسطاء، غياب الشفافية في الأسعار، وصعوبة وصول العميل إلى معلومات صحيحة عن أنواع الرخام وجودته وطرق استخدامه.
        </p>
      </section>

      {/* ===== Vision & Mission ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="rounded-2xl border border-gray-200 p-6 sm:p-8 bg-white shadow-sm">
          <h2 className="text-2xl font-bold text-slate-900 mb-3">رؤيتنا</h2>
          <p className="text-slate-600 leading-relaxed">
            نسعى إلى أن تكون منصة شق تعبان المرجع الرقمي الأول لسوق الرخام في مصر، وأن نُحدث نقلة نوعية من سوق تقليدي غير منظم إلى سوق إلكتروني ذكي يعتمد على البيانات، الشفافية، والتكنولوجيا الحديثة.
          </p>
        </section>

        <section className="rounded-2xl border border-gray-200 p-6 sm:p-8 bg-white shadow-sm">
          <h2 className="text-2xl font-bold text-slate-900 mb-3">رسالتنا</h2>
          <ul className="list-disc pr-5 space-y-2 text-slate-600">
            <li>تمكين المصانع والمعارض من الوصول المباشر إلى العملاء بدون وسطاء.</li>
            <li>مساعدة العملاء على اتخاذ قرارات شراء واعية مبنية على معلومات دقيقة.</li>
            <li>تنظيم عمليات البيع والشراء من خلال نظام موحد وآمن.</li>
            <li>رفع كفاءة السوق المصري وتعزيز قدرته التنافسية محليًا وإقليميًا.</li>
          </ul>
        </section>
      </div>

      {/* ===== Services ===== */}
      <section className="rounded-2xl border border-gray-200 p-6 sm:p-8 bg-white shadow-sm">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">ماذا نقدم؟</h2>

        <div className="space-y-6">
          {[
            {
              title: "أولًا: سوق إلكتروني متخصص",
              items: [
                "رخام مصري",
                "رخام مصنع",
                "رخام مستورد",
                "جرانيت مصري",
                "جرانيت مستورد",
                "كوارتز",
              ],
            },
            {
              title: "ثانيًا: نظام الطلبات الخاصة",
              items: [
                "إنشاء طلبات مخصصة حسب الاحتياج",
                "عرض الطلبات على المصانع والمعارض",
                "استقبال عروض أسعار متعددة",
              ],
            },
            {
              title: "ثالثًا: مركز معلومات الرخام",
              items: [
                "شرح شامل للأنواع",
                "صور حقيقية",
                "إرشادات الاستخدام والتركيب",
                "طرق العناية بالرخام",
              ],
            },
            
          ].map((section, index) => (
            <div key={index} className="bg-slate-50 rounded-xl p-5 border border-gray-200">
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                {section.title}
              </h3>
              <ul className="list-disc pr-5 space-y-2 text-slate-600">
                {section.items.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* ===== Why & Values ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="rounded-2xl border border-gray-200 p-6 sm:p-8 bg-white shadow-sm">
          <h2 className="text-2xl font-bold text-slate-900 mb-3">
            لماذا منصة شق تعبان؟
          </h2>
          <ul className="list-disc pr-5 space-y-2 text-slate-600">
            <li>تقليل الغش التجاري.</li>
            <li>معلومات موثوقة ومبسطة.</li>
            <li>منافسة عادلة بين الموردين.</li>
            <li>دعم المصانع الصغيرة والمتوسطة.</li>
            <li>منصة موحدة للبيع والتحليل.</li>
          </ul>
        </section>

        <section className="rounded-2xl border border-gray-200 p-6 sm:p-8 bg-white shadow-sm">
          <h2 className="text-2xl font-bold text-slate-900 mb-3">قيمنا</h2>
          <ul className="list-disc pr-5 space-y-2 text-slate-600">
            <li>الشفافية</li>
            <li>المصداقية</li>
            <li>الاحترافية</li>
            <li>الابتكار</li>
            <li>التركيز على العميل</li>
          </ul>
        </section>
      </div>

      {/* ===== Future ===== */}
      <section className="rounded-2xl border border-blue-100 p-6 sm:p-8 bg-blue-50">
        <h2 className="text-2xl font-bold text-slate-900 mb-3">
          طموحنا المستقبلي
        </h2>
        <ul className="list-disc pr-5 space-y-2 text-slate-700">
          <li>التوسع داخل مصر ثم إقليميًا</li>
          <li>إطلاق تطبيقات موبايل</li>
          <li>إضافة مواد بناء أخرى</li>
          <li>استخدام الذكاء الاصطناعي</li>
          <li>تطوير صناعة الرخام المصرية</li>
        </ul>
      </section>
    </div>
  );
}
