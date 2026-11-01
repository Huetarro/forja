import { lazy, useEffect, useState } from 'react'
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import { requestPersistentStorage } from '@/db/db'
import { useSettings } from '@/db/settings'
import { InstallScreen } from '@/features/instalar/InstallScreen'
import { Welcome } from '@/features/bienvenida/Welcome'
import { installScreenSkipped, isStandalone, skipInstallScreen } from '@/lib/standalone'
import { useApplyTheme } from '@/lib/theme'
import { Layout } from './Layout'
import { UpdatePrompt } from './UpdatePrompt'

const HomePage = lazy(() => import('@/features/inicio/HomePage'))
const CalendarPage = lazy(() => import('@/features/calendario/CalendarPage'))
const StatsPage = lazy(() => import('@/features/estadisticas/StatsPage'))
const RunningPage = lazy(() => import('@/features/running/RunningPage'))
const SettingsPage = lazy(() => import('@/features/ajustes/SettingsPage'))

export function App() {
  const settings = useSettings()
  const [showInstall, setShowInstall] = useState(() => !isStandalone() && !installScreenSkipped())
  useApplyTheme(settings?.theme)

  useEffect(() => {
    void requestPersistentStorage()
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
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="calendario" element={<CalendarPage />} />
            <Route path="estadisticas" element={<StatsPage />} />
            <Route path="running" element={<RunningPage />} />
            <Route path="ajustes" element={<SettingsPage />} />
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
    </>
  )
}
