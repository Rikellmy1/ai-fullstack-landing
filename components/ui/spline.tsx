import { Suspense, lazy } from "react"

const Spline = lazy(() => import("@splinetool/react-spline"))

interface SplineSceneProps {
  scene: string
  className?: string
}

export function SplineScene({ scene, className }: SplineSceneProps) {
  return (
    <Suspense
      fallback={
        <div className="flex h-full w-full items-center justify-center">
          <span className="loader" aria-label="Carregando cena 3D" role="status" />
        </div>
      }
    >
      <Spline scene={scene} className={className} />
    </Suspense>
  )
}
