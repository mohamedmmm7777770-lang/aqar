import { motion } from 'motion/react';
import { Home, Map, Zap, HeadphonesIcon } from 'lucide-react';

const features = [
  {
    name: 'تغطية شاملة',
    description: 'نغطي كافة أحياء كفر البطيخ والمناطق المجاورة بأفضل العروض العقارية.',
    icon: Map,
  },
  {
    name: 'جولات ثلاثية الأبعاد',
    description: 'استكشف العقار من مكانك كأنك داخله بفضل تقنية التجول الافتراضي 3D.',
    icon: Home,
  },
  {
    name: 'تحديثات لحظية',
    description: 'يتم تحديث العقارات والأسعار يومياً لضمان حصولك على أحدث الفرص.',
    icon: Zap,
  },
  {
    name: 'دعم فني مستمر',
    description: 'فريقنا والمساعد الذكي متاحون على مدار الساعة للرد على استفساراتك.',
    icon: HeadphonesIcon,
  },
];

export default function WhyUs() {
  return (
    <div className="bg-white py-24 sm:py-32 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center mb-16">
          <h2 className="text-base font-semibold leading-7 text-emerald-600">اختيارك الأول</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            لماذا عقارات؟
          </p>
          <p className="mt-6 text-lg leading-8 text-slate-600">
            نجمع بين التكنولوجيا الحديثة والخبرة المحلية لنقدم لك أفضل تجربة للبحث عن العقارات في دمياط.
          </p>
        </div>
        
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-4">
            {features.map((feature, index) => (
              <motion.div 
                key={feature.name} 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="flex flex-col relative bg-slate-50 p-8 rounded-2xl hover:shadow-xl transition-shadow border border-slate-100"
              >
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-slate-900 mb-4">
                  <div className="h-12 w-12 flex items-center justify-center rounded-xl bg-emerald-500 text-white shadow-md shadow-emerald-500/20">
                    <feature.icon className="h-6 w-6" aria-hidden="true" />
                  </div>
                  {feature.name}
                </dt>
                <dd className="mt-1 flex flex-auto flex-col text-base leading-7 text-slate-600">
                  <p className="flex-auto">{feature.description}</p>
                </dd>
              </motion.div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}
