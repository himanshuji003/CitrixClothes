import { Phone, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function TopInfoBar({ show }: { show: boolean }) {
  return (
    <div
      className={cn(
        'overflow-hidden bg-brand-700 border-b border-brand-800/10 transition-all duration-300 ease-in-out',
        show ? 'h-[40px] md:h-[45px] opacity-100' : 'h-0 opacity-0'
      )}
    >
      <div className="mx-auto max-w-5xl px-4 h-full">
        <div className="flex h-full items-center justify-between gap-4 text-[11px] md:text-sm">
          <div className="flex items-center gap-2 text-white">
            <Phone className="h-3.5 w-3.5 md:h-4 md:w-4 text-white/90 flex-shrink-0" />
            <span className="tracking-[0.03em] font-medium">
              Support:+91 98118 38318
            </span>
          </div>

          <div className="flex items-center gap-2 text-white">
            <Clock className="h-3.5 w-3.5 md:h-4 md:w-4 text-white/90 flex-shrink-0" />
            <span className="tracking-[0.03em] font-medium">
              Timings: 10:00 AM - 6:00 PM
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}