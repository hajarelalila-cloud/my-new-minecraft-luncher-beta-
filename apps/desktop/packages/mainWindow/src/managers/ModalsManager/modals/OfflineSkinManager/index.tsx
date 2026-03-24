import { ModalProps } from "../../"
import ModalLayout from "../../ModalLayout"
import { Trans } from "@gd/i18n"
import { createSignal, onMount, Show } from "solid-js"
import { Button } from "@gd/ui"
import { rspc } from "@/utils/rspcClient"

interface OfflineSkinManagerProps extends ModalProps {
  username: string
}

const OfflineSkinManager = (props: OfflineSkinManagerProps) => {
  const [skinPreview, setSkinPreview] = createSignal<string | null>(null)
  const [skinFile, setSkinFile] = createSignal<File | null>(null)
  const [isUploading, setIsUploading] = createSignal(false)
  const [isDeleting, setIsDeleting] = createSignal(false)
  const [error, setError] = createSignal<string | null>(null)
  const [success, setSuccess] = createSignal<string | null>(null)

  // Query for existing skin
  const existingSkin = rspc.createQuery(() => ({
    queryKey: ["account.getOfflineSkin", props.username]
  }))

  // Mutations
  const setSkinMutation = rspc.createMutation(() => ({
    mutationKey: ["account.setOfflineSkin"]
  }))

  const deleteSkinMutation = rspc.createMutation(() => ({
    mutationKey: ["account.deleteOfflineSkin"]
  }))

  // Load existing skin preview
  onMount(() => {
    if (existingSkin.data) {
      const blob = new Blob([new Uint8Array(existingSkin.data)], { type: "image/png" })
      const url = URL.createObjectURL(blob)
      setSkinPreview(url)
    }
  })

  const handleFileSelect = async (event: Event) => {
    const target = event.target as HTMLInputElement
    const file = target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.includes("png")) {
      setError("Please select a PNG file")
      return
    }

    // Validate file size (max 1MB)
    if (file.size > 1024 * 1024) {
      setError("Skin file must be less than 1MB")
      return
    }

    setSkinFile(file)
    setError(null)
    setSuccess(null)

    // Create preview
    const url = URL.createObjectURL(file)
    setSkinPreview(url)
  }

  const handleUpload = async () => {
    const file = skinFile()
    if (!file) {
      setError("Please select a skin file first")
      return
    }

    setIsUploading(true)
    setError(null)
    setSuccess(null)

    try {
      // Read file as ArrayBuffer
      const buffer = await file.arrayBuffer()
      const skinData = Array.from(new Uint8Array(buffer))

      await setSkinMutation.mutateAsync({
        username: props.username,
        skinData
      })

      setSuccess("Skin uploaded successfully!")
      setSkinFile(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload skin")
    } finally {
      setIsUploading(false)
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    setError(null)
    setSuccess(null)

    try {
      await deleteSkinMutation.mutateAsync(props.username)
      setSkinPreview(null)
      setSkinFile(null)
      setSuccess("Skin removed successfully!")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete skin")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <ModalLayout
      title="Offline Skin Manager"
      height="h-auto"
      width="w-[450px] max-w-[90vw]"
    >
      <div class="flex flex-col gap-6 p-6">
        {/* Header */}
        <div class="flex items-center gap-3">
          <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-violet-600">
            <div class="i-hugeicons:user h-6 w-6 text-white" />
          </div>
          <div>
            <h2 class="text-lg font-semibold text-white">Skin Manager</h2>
            <p class="text-sm text-gray-400">For offline account: {props.username}</p>
          </div>
        </div>

        {/* Info Box */}
        <div class="rounded-lg bg-purple-500/10 border border-purple-500/20 p-4">
          <div class="flex gap-3">
            <div class="i-hugeicons:information-circle text-purple-400 h-5 w-5 flex-shrink-0 mt-0.5" />
            <p class="text-sm text-purple-200">
              Upload a custom skin for your offline account. This skin will be visible to other Nokiatis Launcher users when they see you in-game.
            </p>
          </div>
        </div>

        {/* Current Skin Preview */}
        <div class="flex flex-col items-center gap-4">
          <div class="text-sm font-medium text-gray-300">Current Skin</div>
          <div class="relative flex h-32 w-32 items-center justify-center rounded-xl bg-darkSlate-700 border border-darkSlate-600 overflow-hidden">
            <Show when={skinPreview()} fallback={
              <div class="flex flex-col items-center gap-2 text-gray-500">
                <div class="i-hugeicons:user-square h-12 w-12" />
                <span class="text-xs">No skin set</span>
              </div>
            }>
              <img
                src={skinPreview()!}
                alt="Skin preview"
                class="h-full w-full object-contain"
              />
            </Show>
          </div>
        </div>

        {/* File Upload */}
        <div class="flex flex-col gap-2">
          <label class="text-sm font-medium text-gray-300">Upload New Skin</label>
          <div class="flex gap-2">
            <input
              type="file"
              accept="image/png"
              onChange={handleFileSelect}
              class="hidden"
              id="skin-file-input"
            />
            <label
              for="skin-file-input"
              class="flex-1 cursor-pointer rounded-lg border border-darkSlate-600 bg-darkSlate-700 px-4 py-3 text-center text-sm text-gray-300 hover:bg-darkSlate-600 transition-colors"
            >
              <Show when={skinFile()} fallback="Choose PNG file...">
                {skinFile()!.name}
              </Show>
            </label>
          </div>
          <p class="text-xs text-gray-500">Must be a 64x64 or 64x32 PNG image</p>
        </div>

        {/* Error/Success Messages */}
        <Show when={error()}>
          <div class="flex items-center gap-2 rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">
            <div class="i-hugeicons:cancel-circle h-4 w-4" />
            {error()}
          </div>
        </Show>

        <Show when={success()}>
          <div class="flex items-center gap-2 rounded-lg bg-green-500/10 border border-green-500/20 p-3 text-sm text-green-400">
            <div class="i-hugeicons:checkmark-circle h-4 w-4" />
            {success()}
          </div>
        </Show>

        {/* Action Buttons */}
        <div class="flex gap-3">
          <Button
            type="secondary"
            fullWidth
            onClick={handleDelete}
            disabled={!skinPreview() || isDeleting() || isUploading()}
            loading={isDeleting()}
          >
            <div class="i-hugeicons:delete-02 h-4 w-4" />
            Remove Skin
          </Button>
          <Button
            type="primary"
            fullWidth
            onClick={handleUpload}
            disabled={!skinFile() || isUploading() || isDeleting()}
            loading={isUploading()}
          >
            <div class="i-hugeicons:upload-01 h-4 w-4" />
            Upload Skin
          </Button>
        </div>

        {/* Close Button */}
        <Button
          type="secondary"
          fullWidth
          onClick={() => props.closeModal?.()}
        >
          Close
        </Button>

        {/* Footer */}
        <div class="text-center text-xs text-gray-500">
          <p>Skins are stored locally and shared with other Nokiatis Launcher users</p>
        </div>
      </div>
    </ModalLayout>
  )
}

export default OfflineSkinManager
