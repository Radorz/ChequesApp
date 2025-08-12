import clsx from 'clsx';

type Props = {
  compact?: boolean;      // true = solo el ícono
  className?: string;     // tamaños/espaciados externos
};

export default function Logo({ compact = false, className }: Props) {
  return (
    <div className={clsx('flex items-center select-none', className)}>
      {/* Icono */}
      <svg
        width={40}
        height={40}
        viewBox="0 0 48 48"
        role="img"
        aria-label="ChequeApp logo"
        className="shrink-0"
      >
        <defs>
          <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#4f46e5" /> {/* indigo-600 */}
            <stop offset="1" stopColor="#22c55e" /> {/* green-500 */}
          </linearGradient>
        </defs>

        {/* Fondo redondeado */}
        <rect x="1.5" y="1.5" width="45" height="45" rx="11"
              fill="url(#g)" />

        {/* “Cheque” interior */}
        <rect x="8" y="10" width="32" height="16" rx="3"
              fill="#ffffff" opacity="0.95" />
        {/* líneas del cheque */}
        <rect x="11" y="14" width="12" height="2.5" rx="1.25"
              fill="#cbd5e1" />
        <rect x="11" y="18" width="18" height="2.5" rx="1.25"
              fill="#e2e8f0" />

        {/* Check */}
        <path d="M17 31 l6 6 l12 -14"
              fill="none"
              stroke="#ffffff"
              strokeWidth="3.2"
              strokeLinecap="round"
              strokeLinejoin="round" />
      </svg>

      {/* Wordmark */}
      {!compact && (
        <div className="ml-2 leading-none">
          <span className="block font-bold text-xl text-slate-900 dark:text-slate-600">
            Cheque
            <span className="font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-green-500">
              App
            </span>
          </span>
          <span className="block text-[10px] uppercase tracking-widest text-slate-400 dark:text-slate-500">
            gestionar • pagar • conciliar
          </span>
        </div>
      )}
    </div>
  );
}
