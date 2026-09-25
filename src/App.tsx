import { useState } from 'react'
import { Container, MantineProvider } from '@mantine/core'
import { useGameLoop } from './game/useGameLoop'
import { AboutView } from './ui/AboutView'
import { AppHeader } from './ui/AppHeader'
import { ExpeditionView } from './ui/ExpeditionView'
import { LostView } from './ui/LostView'
import { NavDrawer } from './ui/NavDrawer'
import { ReportsView } from './ui/ReportsView'
import { ReturnSummary } from './ui/ReturnSummary'
import { SaveView } from './ui/SaveView'
import { SettingsView } from './ui/SettingsView'
import { TownView } from './ui/TownView'
import { viewTitle, type View } from './ui/navigation'
import { applyPwaUpdate } from './pwaUpdate'
import { usePwaUpdate } from './usePwaUpdate'
import { theme } from './theme'

function App() {
  const { state, summary, apply, dismissSummary, resetGame, importGame } =
    useGameLoop()
  const [view, setView] = useState<View>('town')
  const [menuOpened, setMenuOpened] = useState(false)
  const updateReady = usePwaUpdate()

  const openView = (next: View) => {
    setView(next)
    setMenuOpened(false)
  }

  // The report is read on its own, not over a live screen that is already
  // moving on from the numbers in it.
  const resuming = summary !== null

  return (
    <MantineProvider theme={theme} defaultColorScheme="dark">
      <div className="app-shell">
        <ReturnSummary summary={summary} onDismiss={dismissSummary} />

        {!resuming && (
          <>
            <AppHeader
              title={viewTitle(view)}
              menuOpened={menuOpened}
              onToggleMenu={() => setMenuOpened((opened) => !opened)}
              menuAttention={updateReady}
            />

            <NavDrawer
              opened={menuOpened}
              view={view}
              onSelect={openView}
              onClose={() => setMenuOpened(false)}
              updateReady={updateReady}
              onUpdate={() => {
                setMenuOpened(false)
                void applyPwaUpdate()
              }}
            />

            <Container
              component="main"
              className="app-main"
              size="sm"
              py="lg"
              flex={1}
              w="100%"
            >
              {state.lost && (view === 'town' || view === 'expedition') && (
                <LostView
                  state={state}
                  lost={state.lost}
                  onRestart={resetGame}
                />
              )}
              {!state.lost && view === 'town' && (
                <TownView
                  state={state}
                  apply={apply}
                  onOpenExpedition={() => openView('expedition')}
                />
              )}
              {!state.lost && view === 'expedition' && (
                <ExpeditionView
                  state={state}
                  apply={apply}
                  onOpenReports={() => openView('reports')}
                />
              )}
              {view === 'reports' && <ReportsView state={state} />}
              {view === 'settings' && <SettingsView />}
              {view === 'save' && (
                <SaveView
                  state={state}
                  onImport={importGame}
                  onReset={resetGame}
                />
              )}
              {view === 'about' && <AboutView />}
            </Container>

            <div className="app-safe-bottom" />
          </>
        )}
      </div>
    </MantineProvider>
  )
}

export default App
