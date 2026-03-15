import { ReactNode, AnchorHTMLAttributes } from 'react'

interface ResponsiveNavLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  active?: boolean
  method?: string
  as?: string
  children: ReactNode
}

export default function ResponsiveNavLink({
  href,
  active = false,
  className = '',
  method,
  as,
  children,
  ...props
}: ResponsiveNavLinkProps) {
  return (
    <a
      {...props}
      href={href}
      className={`block w-full pl-3 pr-4 py-2 border-l-4 text-base font-medium leading-5 transition duration-150 ease-in-out ${
        active
          ? 'border-indigo-400 bg-indigo-50 text-indigo-700 focus:outline-none focus:bg-indigo-100 focus:border-indigo-700'
          : 'border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:text-gray-800 focus:bg-gray-50 focus:border-gray-300'
      } ${className}`}
    >
      {children}
    </a>
  )
}
