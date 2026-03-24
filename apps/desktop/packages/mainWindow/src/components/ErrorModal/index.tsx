import { createSignal, Show } from "solid-js"
import { Button, Badge } from "@gd/ui"
import { useTransContext } from "@gd/i18n"
import ModalLayout from "@/managers/ModalsManager/ModalLayout"
import { ModalProps } from "@/managers/ModalsManager"

interface ErrorInfo {
  title: string
  message: string
  code?: string
  category: "network" | "java" | "minecraft" | "account" | "filesystem" | "unknown"
  severity: "error" | "warning" | "info"
  suggestions?: string[]
  actions?: {
    label: string
    action: () => void
    type?: "primary" | "secondary" | "danger"
  }[]
  details?: string
  canRetry?: boolean
  onRetry?: () => void
}

interface Props extends ModalProps {
  error: ErrorInfo
}

const getErrorIcon = (category: ErrorInfo["category"]) => {
  switch (category) {
    case "network":
      return "i-hugeicons:wifi-disconnect"
    case "java":
      return "i-hugeicons:java"
    case "minecraft":
      return "i-hugeicons:cube"
    case "account":
      return "i-hugeicons:user-profile"
    case "filesystem":
      return "i-hugeicons:folder-error"
    default:
      return "i-hugeicons:alert-02"
  }
}

const getSeverityColor = (severity: ErrorInfo["severity"]) => {
  switch (severity) {
    case "error":
      return { bg: "bg-red-500/20", border: "border-red-500/50", icon: "text-red-400" }
    case "warning":
      return { bg: "bg-yellow-500/20", border: "border-yellow-500/50", icon: "text-yellow-400" }
    case "info":
      return { bg: "bg-blue-500/20", border: "border-blue-500/50", icon: "text-blue-400" }
  }
}

const ErrorModal = (props: Props) => {
  const [t] = useTransContext()
  const [showDetails, setShowDetails] = createSignal(false)

  const colors = () => getSeverityColor(props.error.severity)

  return (
    <ModalLayout
      title={props.error.title}
      noPadding
      width="w-[500px] max-w-[90vw]"
    >
      <style>
        {`
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
            20%, 40%, 60%, 80% { transform: translateX(4px); }
          }
          .shake-animation {
            animation: shake 0.5s ease-in-out;
          }
        `}
      </style>

      <div class="flex flex-col">
        {/* Error header */}
        <div class={`${colors().bg} border-b ${colors().border} p-6`}>
          <div class="flex items-start gap-4">
            <div class={`${getErrorIcon(props.error.category)} h-10 w-10 ${colors().icon} flex-shrink-0`} />
            <div class="flex-1">
              <h2 class="text-lg font-bold mb-1">{props.error.title}</h2>
              <p class="text-darkSlate-300">{props.error.message}</p>
              <Show when={props.error.code}>
                <code class="text-xs bg-darkSlate-800 px-2 py-0.5 rounded mt-2 inline-block">
                  Error Code: {props.error.code}
                </code>
              </Show>
            </div>
          </div>
        </div>

        {/* Suggestions */}
        <Show when={props.error.suggestions && props.error.suggestions!.length > 0}>
          <div class="p-4 border-b border-darkSlate-600">
            <div class="text-sm font-semibold mb-2 flex items-center gap-2">
              <div class="i-hugeicons:light-bulb h-4 w-4 text-yellow-400" />
              Suggested Solutions
            </div>
            <ul class="space-y-2">
              <For each={props.error.suggestions}>
                {(suggestion) => (
                  <li class="flex items-start gap-2 text-sm text-darkSlate-300">
                    <div class="i-hugeicons:checkmark-circle-02 h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <span>{suggestion}</span>
                  </li>
                )}
              </For>
            </ul>
          </div>
        </Show>

        {/* Technical details */}
        <Show when={props.error.details}>
          <div class="p-4 border-b border-darkSlate-600">
            <button
              class="flex items-center gap-2 text-sm font-medium hover:text-primary-400 transition-colors"
              onClick={() => setShowDetails(!showDetails())}
            >
              <div class={`i-hugeicons:arrow-right-01 h-4 w-4 transition-transform ${showDetails() ? "rotate-90" : ""}`} />
              Technical Details
            </button>
            <Show when={showDetails()}>
              <pre class="mt-3 p-3 bg-darkSlate-800 rounded-lg text-xs overflow-x-auto max-h-48 text-darkSlate-300">
                {props.error.details}
              </pre>
            </Show>
          </div>
        </Show>

        {/* Actions */}
        <div class="p-4 flex flex-col gap-2">
          {/* Custom actions */}
          <Show when={props.error.actions && props.error.actions!.length > 0}>
            <div class="flex flex-wrap gap-2">
              <For each={props.error.actions}>
                {(action) => (
                  <Button
                    type={action.type || "secondary"}
                    size="small"
                    onClick={() => {
                      action.action()
                      props.closeModal?.()
                    }}
                  >
                    {action.label}
                  </Button>
                )}
              </For>
            </div>
          </Show>

          {/* Default actions */}
          <div class="flex justify-between items-center">
            <div class="flex gap-2">
              <Show when={props.error.canRetry}>
                <Button
                  type="primary"
                  size="small"
                  onClick={() => {
                    props.error.onRetry?.()
                    props.closeModal?.()
                  }}
                >
                  <div class="i-hugeicons:refresh h-4 w-4" />
                  <span>Try Again</span>
                </Button>
              </Show>
            </div>
            <Button
              type="secondary"
              size="small"
              onClick={() => props.closeModal?.()}
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    </ModalLayout>
  )
}

// Error factory functions
export const createNetworkError = (message: string, onRetry?: () => void): ErrorInfo => ({
  title: "Connection Error",
  message,
  category: "network",
  severity: "error",
  suggestions: [
    "Check your internet connection",
    "Try disabling VPN or proxy",
    "Restart your router",
    "Check if the server is online",
  ],
  canRetry: true,
  onRetry,
})

export const createJavaError = (message: string, code?: string): ErrorInfo => ({
  title: "Java Error",
  message,
  code,
  category: "java",
  severity: "error",
  suggestions: [
    "Make sure Java is installed correctly",
    "Try allocating more memory",
    "Update your Java version",
    "Check for conflicting Java installations",
  ],
  actions: [
    {
      label: "Open Java Settings",
      action: () => {}, // Navigate to Java settings
    },
  ],
})

export const createAccountError = (message: string): ErrorInfo => ({
  title: "Account Error",
  message,
  category: "account",
  severity: "error",
  suggestions: [
    "Try logging out and back in",
    "Check your Microsoft account status",
    "Use an offline account if playing singleplayer",
  ],
  actions: [
    {
      label: "Manage Accounts",
      action: () => {}, // Navigate to accounts
    },
    {
      label: "Use Offline Mode",
      action: () => {}, // Switch to offline
      type: "secondary",
    },
  ],
})

export const createFilesystemError = (message: string, path?: string): ErrorInfo => ({
  title: "File Error",
  message,
  category: "filesystem",
  severity: "error",
  suggestions: [
    "Check if you have write permissions",
    "Make sure the folder exists",
    "Disable antivirus temporarily",
    "Run as administrator",
  ],
  details: path ? `Path: ${path}` : undefined,
})

export default ErrorModal
