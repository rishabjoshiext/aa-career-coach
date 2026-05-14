import { useEffect } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { AppShell } from './components/layout/AppShell.jsx'
import { useAppState } from './hooks/appState.jsx'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    document.querySelectorAll('[data-scroll-top]').forEach((el) => el.scrollTo({ top: 0 }))
  }, [pathname])
  return null
}
import { Frame1 } from './pages/Frame1.jsx'
import { Frame2 } from './pages/Frame2.jsx'
import { Frame3 } from './pages/Frame3.jsx'
import { Frame4 } from './pages/Frame4.jsx'
import { Frame5 } from './pages/Frame5.jsx'
import { Frame6 } from './pages/Frame6.jsx'
import { Frame7 } from './pages/Frame7.jsx'
import { Frame8 } from './pages/Frame8.jsx'

function RoutedApp() {
  const { sessionEpoch } = useAppState()
  return (
    <AppShell>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Navigate to="/1" replace />} />
        <Route path="/1" element={<Frame1 key={sessionEpoch} />} />
        <Route path="/2" element={<Frame2 />} />
        <Route path="/3" element={<Frame3 />} />
        <Route path="/4" element={<Frame4 />} />
        <Route path="/5" element={<Frame5 />} />
        <Route path="/6" element={<Frame6 />} />
        <Route path="/7" element={<Frame7 />} />
        <Route path="/8" element={<Frame8 />} />
        <Route path="*" element={<Navigate to="/1" replace />} />
      </Routes>
    </AppShell>
  )
}

export default function App() {
  return <RoutedApp />
}
