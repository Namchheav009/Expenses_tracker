import { HTMLAttributes } from 'react'

interface ApplicationLogoProps extends HTMLAttributes<HTMLDivElement> {}

export default function ApplicationLogo(props: ApplicationLogoProps) {
  return (
    <div {...props} className={`flex items-center gap-2 text-xl font-bold text-slate-900 ${props.className || ''}`}>
      <img
        src="/images/logo.svg"
        alt="Expense Tracker Logo"
        className="h-8 w-8 object-contain"
        onError={(event) => {
          const target = event.currentTarget as HTMLImageElement
          target.style.display = 'none'
        }}
      />
      <span>Expense Tracker</span>
    </div>
  )
}
