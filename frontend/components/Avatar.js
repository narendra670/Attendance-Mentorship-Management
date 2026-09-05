import { cn, initials } from '@/lib/utils';

export default function Avatar({ name, src, size = 'md', className }) {
  const sizes = {
    xs: 'h-7 w-7 text-[10px]',
    sm: 'h-9 w-9 text-xs',
    md: 'h-11 w-11 text-sm',
    lg: 'h-16 w-16 text-lg',
    xl: 'h-24 w-24 text-2xl',
  };
  const base = 'inline-flex shrink-0 items-center justify-center rounded-full object-cover overflow-hidden ring-2 ring-white';
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={name || 'avatar'} className={cn(base, sizes[size], className)} />;
  }
  return (
    <div className={cn(base, 'bg-brand-600 text-white font-semibold', sizes[size], className)}>{initials(name)}</div>
  );
}