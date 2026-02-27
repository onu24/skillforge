'use client'

import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { motion } from 'framer-motion'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: 'bg-[#00BCD4] text-white hover:bg-[#0097A7]',
        destructive: 'bg-[#F44336] text-white hover:bg-[#D32F2F]',
        outline: 'border-2 border-[#00BCD4] bg-transparent text-[#00BCD4] hover:bg-[#00BCD4] hover:text-white',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-[#2A3F5F]/10 hover:text-accent-foreground dark:hover:bg-[#2A3F5F]/20',
        link: 'text-[#00BCD4] underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-4 py-2 has-[>svg]:px-3',
        sm: 'h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5',
        lg: 'h-12 rounded-md px-8 text-base has-[>svg]:px-6',
        icon: 'size-10 rounded-full hover:bg-[#2A3F5F]/20',
        'icon-sm': 'size-8 rounded-full hover:bg-[#2A3F5F]/20',
        'icon-lg': 'size-12 rounded-full hover:bg-[#2A3F5F]/20',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const isIcon = size?.toString().startsWith('icon')
  const isInteractive = !asChild && !props.disabled
  const Comp = (asChild ? Slot : motion.button) as any

  const motionProps = !asChild ? {
    transition: { duration: 0.2, ease: "easeOut" },
    whileHover: isInteractive ? {
      y: isIcon ? 0 : -2,
      scale: isIcon ? 1.1 : 1.02,
      boxShadow: isIcon || variant === 'ghost' || variant === 'link'
        ? "none"
        : variant === 'destructive'
          ? "0 8px 16px rgba(244, 67, 54, 0.3)"
          : "0 8px 16px rgba(0, 188, 212, 0.3)"
    } : undefined,
    whileTap: isInteractive ? { scale: 0.95, y: 0 } : undefined,
  } : {}

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...motionProps}
      {...props}
    />
  )
}

export { Button, buttonVariants }
