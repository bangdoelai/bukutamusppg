import Image from 'next/image'

interface HeaderLogosProps {
  className?: string
}

export function HeaderLogos({ className = '' }: HeaderLogosProps) {
  return (
    <div className={`flex items-center gap-3 sm:gap-4 ${className}`}>
      <div className="flex items-center gap-2.5 sm:gap-3.5">
        <Image
          src="/logo-bgn.png"
          alt="Logo Badan Gizi Nasional"
          width={64}
          height={64}
          priority
          className="h-12 w-auto sm:h-14 lg:h-16 object-contain transition-transform hover:scale-105"
        />
        <Image
          src="/logo-fbj.png"
          alt="Logo Yayasan Fahreza Berkah Jaya"
          width={64}
          height={64}
          priority
          className="h-12 w-auto sm:h-14 lg:h-16 object-contain transition-transform hover:scale-105"
        />
      </div>
      <div className="h-9 w-px bg-border/80 hidden sm:block" />
      <div>
        <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-primary sm:text-xs">
          SPPG Bontang Selatan
        </p>
        <p className="text-xs font-medium text-muted-foreground">
          Berbas Tengah
        </p>
      </div>
    </div>
  )
}
