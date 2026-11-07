import { lazy, Suspense, useEffect, useState } from 'react'
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import { requestPersistentStorage } from '@/db/db'
import { purgeOldSnapshot } from '@/db/snapshot'
import { useAnatomyIconsUpdate, useAutoLoadPlanV2 } from './useAutoLoadPlanV2'
import { useTapOutsideHidesKeyboard } from '@/lib/keyboard'
import { useSettings } from '@/db/settings'
import { InstallScreen } from '@/features/instalar/InstallScreen'
import { Welcome } from '@/features/bienvenida/Welcome'
import { installScreenSkipped, isStandalone, skipInstallScreen } from '@/lib/standalone'
import { useApplyTheme } from '@/lib/theme'
import { Layout } from './Layout'
import { ResumeActiveWorkout } from './ResumeActiveWorkout'
import { UpdatePrompt } from './UpdatePrompt'
import { Overlays } from '@/components/ui/Overlays'

const HomePage = lazy(() => import('@/features/inicio/HomePage'))
const CalendarPage = lazy(() => import('@/features/calendario/CalendarPage'))
const StatsPage = lazy(() => import('@/features/estadisticas/StatsPage'))
const RunningPage = lazy(() => import('@/features/running/RunningPage'))
const SettingsPage = lazy(() => import('@/features/ajustes/SettingsPage'))
const WeekPlanPage = lazy(() => import('@/features/ajustes/WeekPlanPage'))
const ExercisesPage = lazy(() => import('@/features/ejercicios/ExercisesPage'))
const ExerciseDetailPage = lazy(() => import('@/features/ejercicios/ExerciseDetailPage'))
const RoutineDetailPage = lazy(() => import('@/features/rutinas/RoutineDetailPage'))
const RoutineEditorPage = lazy(() => import('@/features/rutinas/RoutineEditorPage'))
const ArchivedPage = lazy(() => import('@/features/rutinas/ArchivedPage'))
const ActiveWorkoutPage = lazy(() => import('@/features/entreno/ActiveWorkoutPage'))
const SummaryPage = lazy(() => import('@/features/entreno/SummaryPage'))
const HistoryPage = lazy(() => import('@/features/historial/HistoryPage'))
const WorkoutDetailPage = lazy(() => import('@/features/historial/WorkoutDetailPage'))

export function App() {
  const settings = useSettings()
  const [showInstall, setShowInstall] = useState(() => !isStandalone() && !installScreenSkipped())
  useApplyTheme(settings?.theme)
  useTapOutsideHidesKeyboard()
  useAutoLoadPlanV2(settings)
  useAnatomyIconsUpdate(settings)

  useEffect(() => {
    void requestPersistentStorage()
    void purgeOldSnapshot()
  }, [])

  let content: React.ReactNode
  if (showInstall) {
    content = (
      <InstallScreen
        onContinue={() => {
          skipInstallScreen()
          setShowInstall(false)
        }}
      />
    )
  } else if (!settings) {
    content = null
  } else if (!settings.onboarded) {
    content = <Welcome />
  } else {
    content = (
      <HashRouter>
        <ResumeActiveWorkout />
        <Routes>
          <Route
            path="entreno"
            element={
              <Suspense fallback={null}>
                <ActiveWorkoutPage />
              </Suspense>
            }
          />
          <Route element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="calendario" element={<CalendarPage />} />
            <Route path="estadisticas" element={<StatsPage />} />
            <Route path="running" element={<RunningPage />} />
            <Route path="running/:id" element={<RunningPage />} />
            <Route path="ajustes" element={<SettingsPage />} />
            <Route path="ajustes/plan" element={<WeekPlanPage />} />
            <Route path="ejercicios" element={<ExercisesPage />} />
            <Route path="ejercicios/:id" element={<ExerciseDetailPage />} />
            <Route path="rutinas/:id" element={<RoutineDetailPage />} />
            <Route path="rutinas/:id/editar" element={<RoutineEditorPage />} />
            <Route path="archivados" element={<ArchivedPage />} />
            <Route path="historial" element={<HistoryPage />} />
            <Route path="historial/:id" element={<WorkoutDetailPage />} />
            <Route path="historial/:id/resumen" element={<SummaryPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </HashRouter>
    )
  }

  return (
    <>
      <UpdatePrompt />
      {content}
      <Overlays />
    </>
  )
}
