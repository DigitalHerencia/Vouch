import { MarqueeLogo } from "../nav/logo-lockup"
import Image from "next/image"
import { Marquee, MarqueeItem, MarqueeSeparator } from "../ui/marquee"
import { CheckCircle2, LockKeyhole, type LucideIcon, ShieldCheck } from "lucide-react"
import React from "react"

const authProcessLogos: readonly ProcessPanelGridItem[] = [
  {
    name: "Vouch",
    logo: <MarqueeLogo />,
  },
  {
    name: "Powered by Stripe",
    logo: (
      <Image
        src="/Powered by Stripe - black.svg"
        alt="Powered by Stripe"
        width={208}
        height={48}
        className="h-12 w-52 scale-150 object-contain"
      />
    ),
  },
  {
    name: "Stripe",
    logo: (
      <Image
        src="/Stripe wordmark - Blurple.svg"
        alt="Stripe"
        width={160}
        height={48}
        className="h-12 w-40 scale-150 object-contain"
      />
    ),
  },
]

function ProcessPanelMarqueeTrack({
  logos,
  direction,
  className,
  itemClassName,
  separatorIcons,
  logoOnly = true,
}: {
  logos: readonly ProcessPanelGridItem[]
  direction: "left" | "right"
  className?: string | undefined
  itemClassName?: string | undefined
  separatorIcons?: readonly LucideIcon[] | undefined
  logoOnly?: boolean | undefined
}) {
  const icons = separatorIcons ?? [LockKeyhole, ShieldCheck, CheckCircle2]

  return (
    <Marquee
      direction={direction}
      speed="slow"
      pauseOnHover={true}
      repeat={3}
      className={[
        "relative z-0 border-x-0 border-y-3 border-neutral-400 bg-black select-none",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {logos.map((item, index) => {
        const SeparatorIcon = icons[index % icons.length] ?? LockKeyhole

        return (
          <React.Fragment key={`${direction}-${item.name}`}>
            <MarqueeItem
              className={[
                "h-24 min-w-35 bg-white px-6 shadow-[4px_4px_0px_oklch(54.6%_0.245_262.881)]",
                logoOnly ? "gap-0" : "",
                itemClassName,
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {logoOnly ? (
                item.logo
              ) : (
                <>
                  <span className="flex h-12 min-w-36 items-center justify-center">
                    {item.logo}
                  </span>
                  <span className="font-(family-name:--font-display) text-sm leading-none font-black tracking-wide text-black uppercase">
                    {item.name}
                  </span>
                  {item.detail ? (
                    <span className="font-mono text-xs leading-none font-black text-blue-600 uppercase">
                      {item.detail}
                    </span>
                  ) : null}
                </>
              )}
            </MarqueeItem>
            <MarqueeSeparator className="flex size-12 shrink-0 items-center justify-center border-3 border-neutral-400 bg-blue-600 text-white shadow-[4px_4px_0px_oklch(54.6%_0.245_262.881)]">
              <SeparatorIcon className="size-7" strokeWidth={2.4} />
            </MarqueeSeparator>
          </React.Fragment>
        )
      })}
    </Marquee>
  )
}

export function AuthProcessPanelGrid() {
  const reversedLogos = [...authProcessLogos].reverse()

  return (
    <div className="flex h-full w-full flex-col justify-center overflow-hidden py-10">
      <ProcessPanelMarqueeTrack
        logos={authProcessLogos}
        direction="right"
        className="-ml-10 w-[120%]"
        itemClassName="h-20 min-w-96 items-center justify-center px-10"
        logoOnly
      />
      <ProcessPanelMarqueeTrack
        logos={reversedLogos}
        direction="left"
        className="-ml-16 w-[132%]"
        itemClassName="h-32 min-w-120 items-center justify-center px-12"
        logoOnly
      />
      <ProcessPanelMarqueeTrack
        logos={authProcessLogos}
        direction="right"
        className="-ml-10 w-[120%]"
        itemClassName="h-20 min-w-96 items-center justify-center px-10"
        logoOnly
      />
    </div>
  )
}
