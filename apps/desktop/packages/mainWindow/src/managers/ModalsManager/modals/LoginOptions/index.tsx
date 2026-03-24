import { ModalProps } from "../../"
import ModalLayout from "../../ModalLayout"
import { Trans } from "@gd/i18n"
import { createSignal, Show } from "solid-js"
import { Button, Input } from "@gd/ui"
import { useGDNavigate } from "@/managers/NavigationManager"
import { rspc, queryClient } from "@/utils/rspcClient"

interface LoginOptionsProps extends ModalProps {
  data?: {
    instanceId?: number
    onAccountCreated?: () => void
  }
}

const LoginOptions = (props: LoginOptionsProps) => {
  const [selectedOption, setSelectedOption] = createSignal<"microsoft" | "offline" | null>(null)
  const [username, setUsername] = createSignal("")
  const [error, setError] = createSignal("")
  const navigator = useGDNavigate()

  // RSPC mutation for creating offline account
  const createOfflineAccount = rspc.createMutation(() => ({
    mutationKey: ["account.createOfflineAccount"],
    onSuccess: () => {
      // Invalidate and refetch accounts
      queryClient.invalidateQueries({ queryKey: ["account.getAccounts"] })
      queryClient.invalidateQueries({ queryKey: ["account.getActiveUuid"] })
      props.data?.onAccountCreated?.()
      props.closeModal?.()
    },
    onError: (err) => {
      setError(`Failed to create account: ${err.message}`)
    }
  }))

  const handleMicrosoftLogin = () => {
    // Navigate to login with Microsoft
    navigator.navigate("/?addMicrosoftAccount=true")
    props.closeModal?.()
  }

  const handleOfflineLogin = async () => {
    const name = username().trim()
    
    if (!name) {
      setError("Please enter a username")
      return
    }
    
    if (name.length < 3 || name.length > 16) {
      setError("Username must be 3-16 characters")
      return
    }
    
    if (!/^[a-zA-Z0-9_]+$/.test(name)) {
      setError("Username can only contain letters, numbers, and underscores")
      return
    }

    setError("")

    // Create offline account using RSPC
    createOfflineAccount.mutate(name)
  }

  const isLoading = () => createOfflineAccount.isPending

  return (
    <ModalLayout
      title={selectedOption() === "offline" ? "Offline Login" : "Login to Play"}
      noHeader={false}
      height="h-auto"
      width="w-[420px] max-w-[90vw]"
    >
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          
          .animate-fadeIn {
            animation: fadeIn 0.3s ease-out forwards;
          }
        `}
      </style>

      <div class="p-6">
        <Show when={!selectedOption()}>
          <div class="mb-6 text-center">
            <div class="text-lightSlate-400 text-sm mb-4">
              Choose how you want to play
            </div>
          </div>

          {/* Microsoft Login Option */}
          <button
            class="w-full mb-3 flex items-center gap-4 rounded-xl border border-darkSlate-600 bg-darkSlate-700 p-4 transition-all duration-200 hover:border-primary-500 hover:bg-darkSlate-600"
            onClick={handleMicrosoftLogin}
          >
            <div class="flex h-12 w-12 items-center justify-center rounded-lg bg-[#00a4ef]">
              <svg width="24" height="24" viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M0 0H11V11H0V0Z" fill="#F25022"/>
                <path d="M12 0H23V11H12V0Z" fill="#7FBA00"/>
                <path d="M0 12H11V23H0V12Z" fill="#00A4EF"/>
                <path d="M12 12H23V23H12V12Z" fill="#FFB900"/>
              </svg>
            </div>
            <div class="flex-1 text-left">
              <div class="text-lightSlate-50 font-semibold text-base">Microsoft Account</div>
              <div class="text-lightSlate-400 text-xs">Premium • Online multiplayer • Skin support</div>
            </div>
            <div class="i-hugeicons:arrow-right-01 text-lightSlate-400 text-xl" />
          </button>

          {/* Offline/Cracked Login Option */}
          <button
            class="w-full flex items-center gap-4 rounded-xl border border-darkSlate-600 bg-darkSlate-700 p-4 transition-all duration-200 hover:border-green-500 hover:bg-darkSlate-600"
            onClick={() => setSelectedOption("offline")}
          >
            <div class="flex h-12 w-12 items-center justify-center rounded-lg bg-green-600">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 5C13.66 5 15 6.34 15 8C15 9.66 13.66 11 12 11C10.34 11 9 9.66 9 8C9 6.34 10.34 5 12 5ZM12 19.2C9.5 19.2 7.29 17.92 6 15.98C6.03 13.99 10 12.9 12 12.9C14 12.9 17.97 13.99 18 15.98C16.71 17.92 14.5 19.2 12 19.2Z" fill="white"/>
              </svg>
            </div>
            <div class="flex-1 text-left">
              <div class="text-lightSlate-50 font-semibold text-base">Offline / Cracked</div>
              <div class="text-lightSlate-400 text-xs">Free • No online features • Just a username</div>
            </div>
            <div class="i-hugeicons:arrow-right-01 text-lightSlate-400 text-xl" />
          </button>

          {/* Info */}
          <div class="mt-5 rounded-lg bg-darkSlate-800 p-3 border border-darkSlate-600">
            <div class="flex items-start gap-2">
              <div class="i-hugeicons:information-circle text-blue-400 text-lg mt-0.5" />
              <div class="text-lightSlate-400 text-xs leading-relaxed">
                <strong class="text-lightSlate-300">Offline mode</strong> lets you play without a Microsoft account. 
                You can still play singleplayer and on cracked servers.
              </div>
            </div>
          </div>
        </Show>

        <Show when={selectedOption() === "offline"}>
          <div class="animate-fadeIn">
            {/* Back button */}
            <button
              class="mb-4 flex items-center gap-2 text-lightSlate-400 text-sm hover:text-lightSlate-200 transition-colors"
              onClick={() => {
                setSelectedOption(null)
                setUsername("")
                setError("")
              }}
            >
              <div class="i-hugeicons:arrow-left-01" />
              Back to options
            </button>

            {/* Username input */}
            <div class="mb-4">
              <label class="block text-lightSlate-300 text-sm font-medium mb-2">
                Enter your username
              </label>
              <Input
                placeholder="Steve"
                value={username()}
                onInput={(e) => {
                  setUsername(e.target.value)
                  setError("")
                }}
                class="w-full"
              />
              <p class="mt-2 text-lightSlate-500 text-xs">
                3-16 characters, letters, numbers, and underscores only
              </p>
            </div>

            {/* Error message */}
            <Show when={error()}>
              <div class="mb-4 rounded-lg bg-red-500/10 border border-red-500/30 p-3">
                <div class="text-red-400 text-sm">{error()}</div>
              </div>
            </Show>

            {/* Play button */}
            <Button
              class="w-full"
              size="large"
              loading={isLoading()}
              onClick={handleOfflineLogin}
            >
              <div class="flex items-center justify-center gap-2">
                <div class="i-hugeicons:play" />
                <span>Play Offline</span>
              </div>
            </Button>
          </div>
        </Show>
      </div>
    </ModalLayout>
  )
}

export default LoginOptions
