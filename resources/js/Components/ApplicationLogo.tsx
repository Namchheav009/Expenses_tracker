import { HTMLAttributes } from 'react'

interface ApplicationLogoProps extends HTMLAttributes<HTMLDivElement> {}

export default function ApplicationLogo(props: ApplicationLogoProps) {
  return (
    <div {...props} className={`text-xl font-bold text-slate-900 ${props.className || ''}`}>
      Expense Tracker
    </div>
  )
}
