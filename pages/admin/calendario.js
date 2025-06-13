
import dynamic from 'next/dynamic';

const Calendar = dynamic(() => import('@/modules/chat/components/Calendar'), { ssr: false });

export default function CalendarioPage() {
  return (
    <div className="max-w-6xl mx-auto mt-10">
      <h1 className="text-3xl font-bold mb-6">Calendário TAMAI</h1>
      <Calendar />
    </div>
  );
}
