import { createEffect, createSignal, untrack } from "solid-js"
import { useLocation, useRoutes } from "@solidjs/router"
import { routes } from "./route"
import initThemes from "./utils/theme"
import { rspc } from "@/utils/rspcClient"
import { useModal } from "./managers/ModalsManager"
import { useKeyDownEvent } from "@solid-primitives/keyboard"
import { checkForUpdates } from "./utils/updater"
import { windowCloseWarningAcquireLock } from "./managers/ModalsManager/modals/WindowCloseWarning"

interface Props {
  createInvalidateQuery: () => void
}

const App = (props: Props) => {
  const [runItOnce, setRunItOnce] = createSignal(true)
  const [welcomeShown, setWelcomeShown] = createSignal(false)
  const Route = useRoutes(routes)
  const modalsContext = useModal()
  const currentRoute = useLocation()

  props.createInvalidateQuery()

  window.onShowWindowCloseModal(() => {
    if (windowCloseWarningAcquireLock) {
      modalsContext?.openModal({
        name: "windowCloseWarning"
      })
    }
  })

  initThemes()

  checkForUpdates()

  // First launch detection using semantic query
  const isFirstLaunch = rspc.createQuery(() => ({
    queryKey: ["settings.isFirstLaunch"]
  }))

  const completeFirstLaunch = rspc.createMutation(() => ({
    mutationKey: ["settings.completeFirstLaunch"]
  }))

  // Get settings to check if welcome should be shown
  const settingsQuery = rspc.createQuery(() => ({
    queryKey: ["settings.getSettings"]
  }))

  // Show NokiatisWelcome popup every time the launcher starts
  createEffect(() => {
    if (!welcomeShown() && !isFirstLaunch.isLoading) {
      setWelcomeShown(true)
      untrack(() => {
        modalsContext?.openModal({ name: "nokiatisWelcome" })
      })
    }
  })

  // Skip the onboarding for first launch - go directly to library
  // Login will be prompted when clicking Play
  createEffect(() => {
    if (
      isFirstLaunch.data === true &&
      runItOnce()
    ) {
      untrack(() => {
        completeFirstLaunch.mutate(undefined)
      })
      setRunItOnce(false)
    }
  })

  // Beta prompt for stable channel users
  const [betaPromptChecked, setBetaPromptChecked] = createSignal(false)
  const shouldShowBetaPrompt = rspc.createQuery(() => ({
    queryKey: ["settings.shouldShowBetaPrompt"]
  }))

  createEffect(() => {
    // Only show if not first run, not already checked, and API says we should
    // Note: shouldShowBetaPrompt already checks first launch status internally
    if (!betaPromptChecked() && shouldShowBetaPrompt.data === true) {
      setBetaPromptChecked(true)
      untrack(() => {
        modalsContext?.openModal({ name: "betaPrompt" })
      })
    }
  })

  const event = useKeyDownEvent()

  createEffect(() => {
    // close modal clicking Escape
    const e = event()
    if (e) {
      if (e.key === "Escape") {
        untrack(() => {
          modalsContext?.closeModal()
        })
      }
    }
  })

  return (
    <div class="relative w-screen">
      <div class="z-10 flex h-auto w-screen">
        <main class="max-w-screen relative grow">
          <Route />
        </main>
      </div>
    </div>
  )
}

export default App
