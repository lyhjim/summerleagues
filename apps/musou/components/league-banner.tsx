import Image from "next/image"

export function LeagueBanner() {
  return (
    <div className="relative w-full overflow-hidden">
      <Image
        src="/images/summer-2026-poster.png"
        alt="League of Riichi Champions"
        width={1080}
        height={1920}
        className="w-full h-auto object-cover"
        priority
      />
    </div>
  )
}
