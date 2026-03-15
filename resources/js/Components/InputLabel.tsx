import { ReactNode, LabelHTMLAttributes } from 'react'

interface InputLabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  children?: ReactNode
  value?: string
}

export default function InputLabel({
  htmlFor,
  className = '',
  children,
  value,
  ...props
}: InputLabelProps) {
  return (
    <label
      {...props}
      htmlFor={htmlFor}
      className={`block text-sm font-medium text-gray-700 ${className}`}
    >
      {value || children}
    </label>
  )
}
