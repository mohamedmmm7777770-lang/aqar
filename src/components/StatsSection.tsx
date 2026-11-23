import { motion } from 'motion/react';
import { Users, Building, ShieldCheck, Award } from 'lucide-react';

const stats = [
  { id: 1, name: 'عميل سعيد', value: '+10,000', icon: Users },
  { id: 2, name: 'عقار تم بيعه', value: '+5,000', icon: Building },
  { id: 3, name: 'معاملة آمنة', value: '100%', icon: ShieldCheck },
  { id: 4, name: 'سنوات خبرة', value: '+15', icon: Award },
];

export default function StatsSection() {
  return (
    <div className="bg-slate-50 py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:max-w-none">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">الأرقام تتحدث عن نجاحنا</h2>
            <p className="mt-4 text-lg leading-8 text-slate-600">
              نفخر بما حققناه في سوق العقارات في كفر البطيخ ودمياط خلال السنوات الماضية.
            </p>
          </div>
          
          <dl className="grid grid-cols-1 gap-x-8 gap-y-16 text-center lg:grid-cols-4">
            {stats.map((stat, index) => (
              <motion.div 
                key={stat.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="mx-auto flex max-w-xs flex-col gap-y-4 items-center"
              >
                <div className="bg-emerald-100 p-4 rounded-2xl">
                  <stat.icon className="h-8 w-8 text-emerald-600" aria-hidden="true" />
                </div>
                <dt className="text-base leading-7 text-slate-600">{stat.name}</dt>
                <dd className="order-first text-3xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
                  {stat.value}
                </dd>
              </motion.div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}
