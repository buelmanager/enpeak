'use client'

interface GradientBlobProps {
  className?: string
  color1?: string
  color2?: string
}

export default function GradientBlob({
  className = '',
  color1 = '#6366f1',
  color2 = '#f43f5e',
}: GradientBlobProps) {
  return (
    <div
      className={`absolute rounded-full blur-3xl opacity-20 pointer-events-none ${className}`}
      style={{
        background: `radial-gradient(circle, ${color1}, ${color2})`,
      }}
    />
  )
}
