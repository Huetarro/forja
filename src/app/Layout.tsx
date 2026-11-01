import { Suspense, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { motion, useReducedMotion } from 'motion/react'
import { TabBar } from './TabBar'

export function Layout() {
  const location = useLocation()
  const reduce = useReducedMotion()
  // Cada pantalla nueva empieza arriba
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname])
  return (
    <div className="pt-safe min-h-dvh">
      <main className="px-safe mx-auto max-w-xl pb-[calc(84px+env(safe-area-inset-bottom))]">
        <motion.div
          key={location.pathname}
          initial={reduce ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22, ease: [0.32, 0.72, 0, 1] }}
        >
          <Suspense fallback={<div className="h-[60vh]" aria-busy="true" />}>
            <Outlet />
          </Suspense>
        </motion.div>
      </main>
      <TabBar />
    </div>
  )
}
