
import { motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'
import { TrendingUpIcon, TrendingDownIcon } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  trend?: {
    value: number
    isPositive: boolean
  }
  colorClass: string
  delay?: number
}

export function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  colorClass,
  delay = 0,
}: StatCardProps) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 20,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.4,
        delay,
      }}
      className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
        </div>
        <div className={`p-3 rounded-xl ${colorClass}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>

      {trend && (
        <div className="mt-4 flex items-center text-sm">
          {trend.isPositive ? (
            <TrendingUpIcon className="w-4 h-4 text-emerald-500 mr-1" />
          ) : (
            <TrendingDownIcon className="w-4 h-4 text-rose-500 mr-1" />
          )}
          <span
            className={
              trend.isPositive
                ? 'text-emerald-600 font-medium'
                : 'text-rose-600 font-medium'
            }
          >
            {trend.isPositive ? '+' : ''}{trend.value}%
          </span>
          <span className="text-slate-400 ml-1.5">vs last month</span>
        </div>
      )}
    </motion.div>
  )
}
