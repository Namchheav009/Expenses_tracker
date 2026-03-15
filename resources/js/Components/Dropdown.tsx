import { ReactNode, createContext, useContext, useState } from 'react'

interface DropdownContextType {
  open: boolean
  setOpen: (open: boolean) => void
}

const DropdownContext = createContext<DropdownContextType | undefined>(undefined)

interface DropdownProps {
  children: ReactNode
}

export default function Dropdown({ children }: DropdownProps) {
  const [open, setOpen] = useState(false)
  return (
    <DropdownContext.Provider value={{ open, setOpen }}>
      <div className="relative">{children}</div>
    </DropdownContext.Provider>
  )
}

interface DropdownTriggerProps {
  children: ReactNode
  onClick?: () => void
}

Dropdown.Trigger = function DropdownTrigger(props: DropdownTriggerProps) {
  const context = useContext(DropdownContext)
  if (!context) throw new Error('DropdownTrigger must be used within Dropdown')
  const { open, setOpen } = context
  return (
    <button
      onClick={() => {
        setOpen(!open)
        props.onClick?.()
      }}
      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-500 hover:text-gray-700 focus:outline-none transition ease-in-out duration-150"
    >
      {props.children}
    </button>
  )
}

interface DropdownContentProps {
  children: ReactNode
  align?: 'left' | 'right'
}

Dropdown.Content = function DropdownContent({
  children,
  align = 'right',
}: DropdownContentProps) {
  const context = useContext(DropdownContext)
  if (!context) throw new Error('DropdownContent must be used within Dropdown')
  const { open } = context
  if (!open) return null
  return (
    <div
      className={`absolute z-50 mt-2 w-48 rounded-md shadow-lg py-1 bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 ${
        align === 'left' ? 'left-0' : 'right-0'
      }`}
    >
      {children}
    </div>
  )
}

interface DropdownLinkProps {
  href?: string
  method?: 'get' | 'post' | 'put' | 'patch' | 'delete'
  as?: string
  children: ReactNode
  className?: string
  onClick?: () => void
}

Dropdown.Link = function DropdownLink({
  href = '#',
  method = 'get',
  as,
  children,
  className = '',
  onClick,
}: DropdownLinkProps) {
  const context = useContext(DropdownContext)
  if (!context) throw new Error('DropdownLink must be used within Dropdown')
  const { setOpen } = context

  const handleClick = () => {
    setOpen(false)
    onClick?.()
    if (href && method !== 'get') {
      // Handle form submission if needed
    }
  }

  return (
    <a
      href={href}
      className={`block w-full px-4 py-2 text-left text-sm leading-5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none transition ease-in-out duration-150 ${className}`}
      onClick={handleClick}
    >
      {children}
    </a>
  )
}

