import { createSignal, Show, onMount } from "solid-js"
import { Button, Badge } from "@gd/ui"
import { useTransContext } from "@gd/i18n"

interface Props {
  isOnline: boolean
  onRetry?: () => void
  onWorkOffline?: () => void
}

const OfflineIndicator = (props: Props) => {
  const [t] = useTransContext()
  const [showDetails, setShowDetails] = createSignal(false)
  const [wasOffline, setWasOffline] = createSignal(false)

  onMount(() => {
    window.addEventListener("online", () => {
      setWasOffline(true)
      setTimeout(() => setWasOffline(false), 3000)
    })
    window.addEventListener("offline", () => {
      setWasOffline(false)
    })
  })

  return (
    <>
      {/* Back online notification */}
      <Show when={wasOffline() && props.isOnline}>
        <div class="fixed top-4 right-4 z-50 bg-green-500/90 backdrop-blur-sm text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 animate-slide-down">
          <div class="i-hugeicons:wifi-connection h-5 w-5" />
          <span class="font-medium">Back Online!</span>
        </div>
      </Show>

      {/* Offline banner */}
      <Show when={!props.isOnline}>
        <div class="bg-yellow-500/10 border-b border-yellow-500/30">
          <div class="px-4 py-3">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="i-hugeicons:wifi-disconnect h-5 w-5 text-yellow-400 animate-pulse" />
                <div>
                  <span class="font-medium text-yellow-200">You're Offline</span>
                  <span class="text-darkSlate-400 text-sm ml-2">
                    Some features may not be available
                  </span>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <Button
                  type="secondary"
                  size="small"
                  onClick={() => setShowDetails(!showDetails())}
                >
                  <div class="i-hugeicons:information-circle h-4 w-4" />
                  <span>Details</span>
                </Button>
                <Show when={props.onRetry}>
                  <Button
                    type="primary"
                    size="small"
                    onClick={props.onRetry}
                  >
                    <div class="i-hugeicons:refresh h-4 w-4" />
                    <span>Retry</span>
                  </Button>
                </Show>
              </div>
            </div>

            {/* Expanded details */}
            <Show when={showDetails()}>
              <div class="mt-4 pt-4 border-t border-yellow-500/20">
                <div class="text-sm text-yellow-100 mb-3">
                  The following features are limited while offline:
                </div>
                <div class="grid grid-cols-2 gap-3">
                  <div class="flex items-center gap-2">
                    <Badge type="success" size="sm">Available</Badge>
                    <span class="text-sm text-darkSlate-300">Play installed instances</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <Badge type="success" size="sm">Available</Badge>
                    <span class="text-sm text-darkSlate-300">Manage local mods</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <Badge type="warning" size="sm">Limited</Badge>
                    <span class="text-sm text-darkSlate-300">Download new content</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <Badge type="error" size="sm">Unavailable</Badge>
                    <span class="text-sm text-darkSlate-300">Microsoft login</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <Badge type="warning" size="sm">Limited</Badge>
                    <span class="text-sm text-darkSlate-300">Modpack updates</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <Badge type="error" size="sm">Unavailable</Badge>
                    <span class="text-sm text-darkSlate-300">Multiplayer servers</span>
                  </div>
                </div>

                <Show when={props.onWorkOffline}>
                  <div class="mt-4">
                    <Button
                      type="primary"
                      onClick={props.onWorkOffline}
                    >
                      <div class="i-hugeicons:offline h-4 w-4" />
                      <span>Continue in Offline Mode</span>
                    </Button>
                  </div>
                </Show>
              </div>
            </Show>
          </div>
        </div>
      </Show>
    </>
  )
}

export default OfflineIndicator

// CSS for animation
const style = document.createElement("style")
style.textContent = `
  @keyframes slide-down {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  .animate-slide-down {
    animation: slide-down 0.3s ease-out;
  }
`
document.head.appendChild(style)
