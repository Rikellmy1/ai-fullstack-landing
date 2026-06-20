import { SplineScene } from "@/components/ui/spline"
import { Card } from "@/components/ui/card"
import { Spotlight } from "@/components/ui/spotlight"

export function SplineSceneBasic() {
  return (
    <Card className="relative min-h-[620px] w-full overflow-hidden rounded-[8px] border-pink-300/25 bg-black/[0.96] md:h-[560px] md:min-h-0">
      <Spotlight
        className="-left-24 -top-48 md:-top-28 md:left-40"
        fill="#ff7f9b"
      />

      <div className="flex min-h-[620px] flex-col md:h-full md:min-h-0 md:flex-row">
        <div className="relative z-10 flex flex-1 flex-col justify-center p-7 sm:p-10 md:p-12">
          <p className="mb-5 text-xs font-black uppercase text-pink-300">
            Interfaces imersivas
          </p>
          <h2 className="max-w-xl bg-gradient-to-b from-neutral-50 to-neutral-400 bg-clip-text font-black text-4xl leading-[0.95] text-transparent md:text-5xl">
            Experiências 3D que respondem ao usuário.
          </h2>
          <p className="mt-6 max-w-lg text-base leading-7 text-neutral-300">
            Cenas interativas podem transformar uma apresentação comum em uma
            experiência de produto memorável, sem perder clareza, velocidade ou
            adaptação para telas menores.
          </p>
        </div>

        <div className="relative min-h-[340px] flex-1 md:min-h-0">
          <SplineScene
            scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
            className="h-full w-full"
          />
        </div>
      </div>
    </Card>
  )
}
