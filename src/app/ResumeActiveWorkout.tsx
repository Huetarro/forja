import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { db } from '@/db/db'

/** Al abrir la app, si hay un entreno en curso se vuelve a él exactamente donde estaba. */
export function ResumeActiveWorkout() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  useEffect(() => {
    if (pathname !== '/') return
    void db.workouts
      .where('status')
      .equals('en_curso')
      .first()
      .then((w) => {
        if (w) navigate('/entreno')
      })
    // solo al arrancar
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
  return null
}
