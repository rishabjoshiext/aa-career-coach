import { TopNav } from './TopNav.jsx'
import { AcceleratedPathDrawer } from '../modals/AcceleratedPathDrawer.jsx'
import { useAppState } from '../../hooks/appState.jsx'

export function AppShell({ children }) {
  const { pathDrawerOpen, closePathDrawer } = useAppState()

  return (
    <div className="h-full min-h-dvh w-full overflow-hidden bg-[#FAF9F4] text-[#0C0C0C] [font-family:Outfit,system-ui,sans-serif]">
      <TopNav />
      <main className="fixed inset-x-0 bottom-0 top-[52px] overflow-hidden">
        {children}
      </main>
      <AcceleratedPathDrawer open={pathDrawerOpen} onClose={closePathDrawer} />
    </div>
  )
}
