import { InputHTMLAttributes } from 'react'

interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {}

export default function Checkbox({ className = '', ...props }: CheckboxProps) {
  return (
    <input
      {...props}
      type="checkbox"
      className={`rounded dark:bg-gray-800 border-gray-300 dark:border-gray-500 text-indigo-600 shadow-sm focus:ring-indigo-500 dark:focus:ring-indigo-600 dark:checked:bg-indigo-600 ${className}`}
    />
  )
}
