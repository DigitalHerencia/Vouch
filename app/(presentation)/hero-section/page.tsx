import {
  HeroCentered,
  HeroSplit,
  HeroWithStats,
  HeroMinimal,
  HeroWithVideo,
} from "@/components/blocks/hero-section"

export default function HeroSection() {
  return (
    <main className="min-h-screen p-2 text-neutral-100 md:p-8">
      <section className="grid min-h-[calc(100vh-3rem)] grid-rows-5 gap-2 md:min-h-[calc(100vh-4rem)] md:gap-4">
        <HeroCentered
          badge="New"
          title="Welcome to Our Site"
          titleHighlight="Experience"
          description="Discover the best products and services tailored just for you."
          primaryAction={{ label: "Get Started", href: "#" }}
          secondaryAction={{ label: "Learn More", href: "#" }}
        />
        <HeroSplit
          title="Innovative Solutions"
          description="Our cutting-edge technology is designed to meet your needs and exceed your expectations."
          imageSrc="/logo-light.png"
          imageAlt="Innovative Solutions"
          primaryAction={{ label: "Explore Now", href: "#" }}
        />
        <HeroWithStats
          title="Trusted by Thousands"
          description="Join our community of satisfied customers who have benefited from our services."
          stats={[
            { label: "Users", value: "10K+" },
            { label: "Projects", value: "500+" },
            { label: "Awards", value: "50+" },
          ]}
        />
        <HeroMinimal
          title="Simplicity at Its Best"
          description="Experience the power of simplicity with our user-friendly interface and seamless design."
          primaryAction={{ label: "Try It Now", href: "#" }}
        />
        <HeroWithVideo
          title="See It in Action"
          description="Watch our video to see how our product can transform your workflow and boost productivity."
          videoThumbnail="/logo-dark.png"
          primaryAction={{ label: "Watch Video", href: "#" }}
        />
      </section>
    </main>
  )
}
