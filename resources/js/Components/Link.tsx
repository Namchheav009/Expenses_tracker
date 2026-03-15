import { AnchorHTMLAttributes, ReactNode } from 'react'
import { Link as InertiaLink } from '@inertiajs/react'

interface LinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string
  method?: 'get' | 'post' | 'put' | 'patch' | 'delete'
  as?: string
  children: ReactNode
  className?: string
}

export default function Link({
  href,
  method = 'get',
  as,
  className,
  children,
  ...props
}: LinkProps) {
  if (method !== 'get') {
    return (
      <a
        {...props}
        href={href}
        className={className}
        onClick={(e) => {
          e.preventDefault()
          // Handle form submission for post/put/patch/delete
        }}
      >
        {children}
      </a>
    )
  }

  return (
    <a {...props} href={href} className={className}>
      {children}
    </a>
  )
}
