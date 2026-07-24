import Image from "next/image"

export function LeagueBanner() {
  return (
    <div className="relative w-full overflow-hidden px-4 md:px-8 py-6 md:py-8">
      <div className="relative w-full max-w-7xl mx-auto">
        {/* Decorative border and glow effects */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#D4AF37]/20 via-transparent to-[#00D4FF]/20 rounded-lg blur-xl"></div>
        <div className="relative border-2 border-[#D4AF37]/30 rounded-lg overflow-hidden shadow-2xl shadow-[#00D4FF]/20">
          <Image
            src="/images/summer-2026-poster.png"
            alt="League of Riichi Champions"
            width={1080}
            height={1920}
            className="w-full h-auto object-cover"
            priority
          />
        </div>
      </div>
    </div>
  )
}
