import { useEffect, useRef, useState } from 'react'
import { createInitialState } from './initialState'
import { clearSave, loadState, saveState } from './save'
import { resumeFrom, summarizeAbsence } from './summary'
import { advanceTo } from './tick'
import type { AwaySummary } from './summary'
import type { GameState } from './types'

const TICK_MS = 250
const AUTOSAVE_MS = 5000

/**
 * The state and the pending absence report are held together because they are
 * produced together: the report is the difference between the state that went
 * into a catch-up and the state that came out.
 */
interface Session {
  state: GameState
  summary: AwaySummary | null
}

/**
 * The only React seam onto the engine: owns the tick interval, autosaves, and
 * saves on `visibilitychange`/`pagehide`. Player moves come in as pure
 * functions of the state (`actions.ts`) through `apply`.
 */
export function useGameLoop() {
  const [session, setSession] = useState<Session>(() =>
    resumeFrom(loadState(createInitialState), Date.now()),
  )
  /** The state as it stood when the tab went away, or `null` while visible. */
  const departure = useRef<GameState | null>(null)

  const apply = (change: (state: GameState) => GameState) => {
    setSession((prev) => {
      const state = change(prev.state)
      return state === prev.state ? prev : { ...prev, state }
    })
  }

  useEffect(() => {
    const saveCurrentState = () => {
      setSession((prev) => {
        saveState(prev.state)
        return prev
      })
    }

    const tickInterval = setInterval(() => {
      apply((state) => advanceTo(state, Date.now()))
    }, TICK_MS)

    const autosaveInterval = setInterval(saveCurrentState, AUTOSAVE_MS)

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        setSession((prev) => {
          saveState(prev.state)
          departure.current = prev.state
          return prev
        })
        return
      }

      const left = departure.current
      if (!left) return
      departure.current = null

      setSession((prev) => {
        const state = advanceTo(prev.state, Date.now())
        // Measured from where the tab left off: a throttled background tick
        // has already folded part of the absence into the live state.
        const summary = summarizeAbsence(left, state)
        return { state, summary: summary ?? prev.summary }
      })
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('pagehide', saveCurrentState)

    return () => {
      clearInterval(tickInterval)
      clearInterval(autosaveInterval)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('pagehide', saveCurrentState)
      saveCurrentState()
    }
  }, [])

  const dismissSummary = () => {
    setSession((prev) => (prev.summary ? { ...prev, summary: null } : prev))
  }

  const resetGame = () => {
    clearSave()
    departure.current = null
    setSession({ state: createInitialState(), summary: null })
  }

  const importGame = (next: GameState) => {
    const resumed = resumeFrom(next, Date.now())
    saveState(resumed.state)
    departure.current = null
    setSession(resumed)
  }

  return {
    state: session.state,
    summary: session.summary,
    apply,
    dismissSummary,
    resetGame,
    importGame,
  }
}
