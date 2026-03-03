import { cn } from '@/lib/utils'

const variants = {
  primary:  'bg-gold text-white hover:bg-rose-deep active:scale-95',
  outline:  'border border-gold text-gold hover:bg-gold hover:text-white active:scale-95',
  ghost:    'text-brown-light hover:text-gold',
  whatsapp: 'bg-[#25D366] text-white hover:bg-[#1fba57] active:scale-95',
}

const sizes = {
  sm: 'px-4 py-2 text-xs tracking-[0.12em]',
  md: 'px-6 py-3 text-xs tracking-[0.15em]',
  lg: 'px-8 py-4 text-sm tracking-[0.15em]',
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className,
  fullWidth = false,
  ...props
}) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-sm',
        'font-sans font-medium uppercase transition-all duration-200',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        fullWidth && 'w-full',
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}
