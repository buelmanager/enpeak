'use client'

interface BentoCardProps {
  title: string
  subtitle: string
  description: string
  gradient: string
  icon: React.ReactNode
  link: string
  className?: string
}

export default function BentoCard({
  title,
  subtitle,
  description,
  gradient,
  icon,
  link,
  className = '',
}: BentoCardProps) {
  return (
    <a
      href={link}
      className={`group relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-br ${gradient} text-white transition-all duration-300 hover:scale-[1.02] hover:shadow-xl block ${className}`}
    >
      <div className="relative z-10">
        <div className="mb-4 inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm">
          {icon}
        </div>
        <h3 className="text-xl sm:text-2xl font-bold mb-1">{title}</h3>
        <p className="text-xs text-white/50 mb-3">{subtitle}</p>
        <p className="text-sm sm:text-base text-white/90 leading-relaxed">{description}</p>
      </div>
      <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-colors duration-300" />
    </a>
  )
}
