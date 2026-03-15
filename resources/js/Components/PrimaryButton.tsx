import { ReactNode } from 'react'

interface PrimaryButtonProps {
  children: ReactNode
  className?: string
  disabled?: boolean
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
}

export default function PrimaryButton({
  children,
  className = '',
  disabled = false,
  onClick,
  type = 'button',
}: PrimaryButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex items-center px-4 py-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-gray-500 rounded-md font-semibold text-xs text-gray-700 dark:text-gray-300 uppercase tracking-widest shadow-sm hover:bg-gray-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800 disabled:opacity-50 transition ease-in-out duration-150 ${className}`}
    >
      {children}
    </button>
  )
}
