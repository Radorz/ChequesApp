import type { ButtonHTMLAttributes } from 'react';
import type { ReactNode } from 'react';

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: ReactNode;
  label: string;
}

export default function IconButton({ icon, label, ...props }: IconButtonProps) {
  return (
    <button {...props} className="flex items-center space-x-1 p-2 rounded hover:bg-gray-100">
      {icon}
      <span>{label}</span>
    </button>
  );
}