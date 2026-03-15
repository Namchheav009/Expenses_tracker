import { InputHTMLAttributes } from 'react'
import React from 'react'

interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  isFocused?: boolean
}

export default function TextInput({
  className = '',
  isFocused = false,
  ...props
}: TextInputProps) {
  const inputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    if (isFocused && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isFocused])

  return (
    <input
      {...props}
      ref={inputRef}
      className={`border-gray-300 dark:border-gray-500 dark:bg-gray-800 dark:text-gray-300 focus:border-indigo-500 dark:focus:border-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-600 rounded-md shadow-sm ${className}`}
    />
  )
}
