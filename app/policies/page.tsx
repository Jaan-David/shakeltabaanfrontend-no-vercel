import BackToTopButton from "@/components/UI/BackToTop/BackToTopButton";
import { generateSEO } from "@/config/seo.config";

export const metadata = generateSEO({
  title: "سياسات العملاء",
  description: "سياسات العملاء — منصة شق الثعبان",
  keywords: ["سياسات", "العملاء", "شق الثعبان", "سياسات المنصة"],
});

export default function PoliciesPage() {
  return (
    <main className="min-h-screen bg-white px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-5xl space-y-8">
        <header className="text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">
            سياسات العملاء — منصة <span className="text-primary">شق الثعبان</span>
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate-900">
            مرحبًا بك في منصة شق الثعبان. توضح هذه الصفحة الشروط والسياسات التي تنطبق على العملاء (المشترين) عند استخدام الموقع والتعامل مع البائعين عبر المنصة. باستخدامك المنصة، تكون قد قرأت ووافقت على جميع البنود التالية.
          </p>
        </header>

        <section className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-blue-600">1. التعريفات</h2>
          <ul className="mt-4 list-disc space-y-2 pr-5 text-slate-600">
            <li>المنصة / شق الثعبان: موقع وتطبيق وخدمات المنصة التي تربط بين البائعين والمشترين.</li>
            <li>البائع: المصنع أو المعرض أو الورشة المسجل في المنصة ويعرض منتجاته.</li>
            <li>المشتري / العميل: أي مستخدم يستعرض أو يشتري أو يطلب عروضًا عبر المنصة.</li>
            <li>الطلب العادي: طلب شراء منتج ظاهراً على صفحة المنتج يُقدَّم كونه معروضًا.</li>
            <li>الطلب الخاص: طلب مخصَّص يوضّح متطلبات العميل (مقاسات، نوع، كمية، خواص خاصة) يُعرض على البائعين لتقديم عروض.</li>
            <li>الصفقة: الاتفاق النهائي بين المشتري والبائع (يشمل السعر وطريقة الدفع والتسليم).</li>
          </ul>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-blue-600">2. حول المنصة</h2>
          <ul className="mt-4 list-disc space-y-2 pr-5 text-slate-600">
            <li>وظيفة المنصة: سوقٍ إلكتروني وساطة يربط بين البائعين والمشترين. تُبيّن تقييمات المعارض والبائعين لمساعدة العميل على اتخاذ القرار.</li>
            <li>دور المنصة: تسهيل التواصل، عرض المنتجات، جمع التقييمات، ونشر معلومات توعوية عن أنواع الرخام وطرق الحفاظ عليه.</li>
            <li>تنبيه مهم: المنصة ليس طرفًا مباشرًا في عقد البيع بين المشتري والبائع ما لم يُصرّح خلاف ذلك صراحة في خدمة أو عرض محدد.</li>
          </ul>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-blue-600">3. إنشاء الحساب واستخدامه</h2>
          <ul className="mt-4 list-disc space-y-2 pr-5 text-slate-600">
            <li>يجب إدخال بيانات صحيحة وكاملة عند التسجيل (الاسم، رقم الهاتف، عنوان التسليم، إلخ).</li>
            <li>المشتري مسؤول عن سرية بيانات الدخول وكلمة المرور.</li>
            <li>أي أخطاء أو خسائر ناتجة عن بيانات غير صحيحة تكون مسؤولية المستخدم.</li>
          </ul>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-blue-600">4. الطلبات وكيفية العمل</h2>
          <ul className="mt-4 list-disc space-y-2 pr-5 text-slate-600">
            <li>يمكن للمشتري تقديم طلب عادي أو طلب خاص.</li>
            <li>في حالة الطلب الخاص: تُعرض بيانات الطلب على البائعين المسجلين، ويقدّم كل مهتم عرض سعره. يختار المشتري العرض الأنسب ثم يتواصل البائع والمشتري لاستكمال التفاصيل.</li>
            <li>تُعرض تقييمات كل معرض/بائع على صفحة الملف الخاص به ليطلع المشتري قبل إتمام الصفقة.</li>
            <li>ننصح المشتري بزيارة المعرض أو معاينة المنتج بنفسه بعد الاتفاق ودون استثناء متى أمكن ذلك، خاصة للمنتجات الكبيرة أو المكلفة.</li>
          </ul>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-blue-600">5. الدفع</h2>
          <ul className="mt-4 list-disc space-y-2 pr-5 text-slate-600">
            <li>حاليًا الدفع يتم خارج المنصة بين البائع والمشتري وفق ما يتفقان عليه.</li>
            <li>المنصة وسيط يرسل البيانات للتواصل ولمتابعة حالة الطلب داخل النظام، لكنها لا تتدخل في وسيلة الدفع المتفق عليها خارج المنصة.</li>
            <li>يُنصح بشدة توثيق جميع محادثات الاتفاق عبر قنوات تتيح إثبات الاتفاق (رسائل مكتوبة/إيميل).</li>
            <li>في حال دمج بوابات دفع داخلية لاحقًا، ستُعلن المنصة الشروط وسياسات التعامل المرتبطة بها.</li>
          </ul>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-blue-600">6. التسليم والاستلام</h2>
          <ul className="mt-4 list-disc space-y-2 pr-5 text-slate-600">
            <li>بعد الاتفاق، يتفق المشتري والبائع على طريقة ومكان وموعد التسليم.</li>
            <li>عند الاستلام، يجب على المشتري فحص المنتج ومطابقته للمواصفات المتفق عليها.</li>
            <li>إن أمكن، يُفضَّل معاينة المنتج في المعرض قبل الدفع النهائي أو قبل الشحن.</li>
            <li>في حال وجود خلل ظاهر أو اختلاف جوهري، يُنصح بعدم الاستلام وإن تسجيل الملاحظة فورًا وإبلاغ فريق الدعم.</li>
          </ul>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-blue-600">7. الإلغاء والاسترداد (Refunds & Cancellations) — النسخة النهائية للموقع</h2>
          <div className="mt-4 space-y-4 text-slate-900">
            <p>🔸 قبل تأكيد العرض من البائع أو قبل الاتفاق النهائي (وقبل الدفع):</p>
            <ul className="list-disc space-y-2 pr-5 text-slate-600">
              <li>يمكنك إلغاء الطلب في أي وقت إذا لم يتم الاتفاق مع أي بائع بعد، ويتم استرداد أي مبالغ مدفوعة لكاملها (إن وُجدت).</li>
            </ul>
            <p>🔸 بعد الاتفاق مع البائع ودفع المبلغ (الدفع حالياً خارج المنصة): يُدرَّس طلب الاسترداد أو الإلغاء في الحالات التالية فقط:</p>
            <ol className="list-decimal space-y-2 pr-5 text-slate-600">
              <li>المنتج غير مطابق تمامًا للوصف الذي ظهر في المنصة (اختلاف جوهري في المواصفات أو النوع أو الصور).</li>
              <li>المنتج تالف أو به عيب غير معلن من قبل البائع عند التسليم.</li>
              <li>تأخر التسليم بشكل غير مبرَّر بعد الموعد المتفق عليه بين المشتري والبائع.</li>
            </ol>
            <p>🔹 إجراءات طلب الاسترداد:</p>
            <ol className="list-decimal space-y-2 pr-5 text-slate-600">
              <li>تواصل عبر قنوات الدعم الرسمية خلال 7 أيام من تاريخ الاستلام أو اكتشاف المشكلة.</li>
              <li>أرفق أدلة (صور/فيديو) تُثبت الحالة أو العيب أو عدم المطابقة، ووصفًا واضحًا للمشكلة.</li>
              <li>يقوم فريق المنصة بفتح تحقيق مع البائع، وقد يطلب البائع بدوره مزيدًا من المعلومات أو المعاينة.</li>
              <li>المنصة ستُعلِمك بنتيجة التحقيق والإجراءات الموصى بها (استرداد/استبدال/إصلاح/توجيه حل ودي) خلال مدة تقريرية لا تتجاوز 30 يومًا من تاريخ استلام الطلب الكامل للأدلة (قد تتغير هذه المدة بحسب حالة كل طلب وتعقيد التحقيق).</li>
            </ol>
            <p>🔹 ملاحظات هامة:</p>
            <ul className="list-disc space-y-2 pr-5 text-slate-600">
              <li>في حالة الدفع خارج المنصة، تكون عملية الاسترداد والتسوية مادية بين المشتري والبائع بناءً على نتائج التحقيق والاتفاق، والمنصة تساند بعملية الوساطة والتوثيق.</li>
              <li>المنصة قد تُجري وساطة لاحتواء النزاعات وتسهيل إجراء استرداد الأموال، لكنها لا تضمن تسييل المدفوعات بديلاً عن التزام البائع أو الاتفاق بين الطرفين ما لم تُعلن خلاف ذلك.</li>
            </ul>
          </div>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-blue-600">8. كيف نقيّم طلب الاسترداد؟</h2>
          <ul className="mt-4 list-disc space-y-2 pr-5 text-slate-600">
            <li>نعتمد على الأدلة المقدمة (صور/فيديو/مراسلات) ومطابقة الوصف المنشور في المنصة.</li>
            <li>نتحاور مع البائع لتقديم تفسير أو إصلاح المشكلة خلال إطار زمني معقول.</li>
            <li>إذا تبين وجود غش واضح أو مخالفة من البائع، نوصي باسترداد المبلغ أو اتخاذ إجراء تعويضي، وقد نلجأ لإجراءات صارمة (تعليق حساب البائع أو حذف عروضه) في حالات الاحتيال المتكرّر.</li>
          </ul>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-blue-600">9. التقييمات والمراجعات</h2>
          <ul className="mt-4 list-disc space-y-2 pr-5 text-slate-600">
            <li>يحق للمشتري ترك تقييم بعد إتمام الصفقة أو الاستلام.</li>
            <li>يجب أن تكون التقييمات صادقة وغير مسيئة.</li>
            <li>التقييمات والمراجعات تحسّن ثقة المستخدمين وتُستخدم لتصنيف البائعين.</li>
            <li>المنصة تحتفظ بحق حذف أو تعديل التقييمات التي تنتهك القواعد أو تتضمن إساءة.</li>
          </ul>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-blue-600">10. حماية البيانات والخصوصية</h2>
          <ul className="mt-4 list-disc space-y-2 pr-5 text-slate-600">
            <li>نحترم خصوصيتك: تُستخدم بياناتك لتحسين الخدمة وتسهيل التواصل فقط، ولا يتم بيعها لطرف ثالث بدون موافقتك.</li>
            <li>ننـفذ إجراءات أمنية معقولة لحماية بياناتك، لكن على المستخدم حماية معلومات حسابه وكلمة المرور.</li>
            <li>للاطلاع على التفاصيل: راجع صفحة سياسة الخصوصية الخاصة بالمنصة.</li>
          </ul>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-blue-600">11. المسؤولية وحدودها</h2>
          <ul className="mt-4 list-disc space-y-2 pr-5 text-slate-600">
            <li>المنصة تعمل كوسيط إلكتروني لتسهيل اللقاء بين البائع والمشتري وليست طرفًا مباشرًا في عقد البيع (ما لم تُعلن خدمة خلاف ذلك).</li>
            <li>لا تتحمل المنصة مسؤولية مباشرة عن:</li>
            <li>المدفوعات التي تتم خارج المنصة.</li>
            <li>الأعمال أو العيوب الناتجة عن البائع إن لم تُثبت مسؤولية مباشرة تتحملها المنصة.</li>
            <li>أي خسائر ناتجة عن معلومات غير صحيحة أدخلها العميل بنفسه.</li>
            <li>تحتفظ المنصة بحق تعليق أو إغلاق حسابات تتكرر فيها المخالفات أو الاحتيال.</li>
          </ul>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-blue-600">12. النزاعات وحلها</h2>
          <ul className="mt-4 list-disc space-y-2 pr-5 text-slate-600">
            <li>نسعى لحل النزاعات وديًا بين المشتري والبائع عبر إجراءات الوساطة الداخلية.</li>
            <li>إن تعذّر الحل الودي، يُمكن للطرفين الاحتكام للإجراءات القانونية المعمول بها في جمهورية مصر العربية.</li>
            <li>للمساعدة في النزاع: يرجي التواصل و ارسال التفاصيل علي الميل او الواتساب</li>
          </ul>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-blue-600">13. التعديلات على السياسات</h2>
          <ul className="mt-4 list-disc space-y-2 pr-5 text-slate-600">
            <li>تحتفظ المنصة بحق تعديل هذه السياسات في أي وقت.</li>
            <li>سيُعلَن أي تعديل جديد على الموقع أو عبر إشعار للمستخدمين.</li>
            <li>استمرارك في الاستخدام بعد نشر التعديل يعني قبولك للتغييرات.</li>
          </ul>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-blue-600">14. تواصل معنا</h2>
          <div className="mt-4 text-slate-600 space-y-2">
            <p>البريد الإلكتروني:</p>
            <p>رقم الهاتف / واتساب:</p>
          </div>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-blue-600">ختامًا</h2>
          <p className="mt-4 text-slate-900">
            باستخدامك منصة شق الثعبان، فإنك توافق على شروط هذه السياسة وتتعهد بالتعامل بنزاهة واحترام مع البائعين والأطراف الأخرى. هدفنا تمكين سوق رخام شفاف وآمن ورفع مستوى الثقة والمعرفة لدى المشترين والبائعين على حد سواء.
          </p>
        </section>
      </div>

      <BackToTopButton />
    </main>
  );
}
