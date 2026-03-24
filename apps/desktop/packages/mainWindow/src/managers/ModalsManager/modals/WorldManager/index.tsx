import { ModalProps } from "../../"
import ModalLayout from "../../ModalLayout"
import { Trans } from "@gd/i18n"
import { createSignal, For, Show } from "solid-js"
import { Button, Spinner } from "@gd/ui"
import { rspc } from "@/utils/rspcClient"
import { format } from "date-fns"

interface WorldManagerProps extends ModalProps {
  instanceId: number
  instanceName: string
  instancePath: string
}

const WorldManager = (props: WorldManagerProps) => {
  const [selectedWorld, setSelectedWorld] = createSignal<number | null>(null)
  const [isBackingUp, setIsBackingUp] = createSignal(false)
  const [isDeleting, setIsDeleting] = createSignal(false)
  const [isExporting, setIsExporting] = createSignal(false)
  const [error, setError] = createSignal<string | null>(null)
  const [success, setSuccess] = createSignal<string | null>(null)

  // Query for worlds
  const worldsQuery = rspc.createQuery(() => ({
    queryKey: ["instance.getWorlds", props.instanceId]
  }))

  // Mutations
  const backupWorldMutation = rspc.createMutation(() => ({
    mutationKey: ["instance.backupWorld"]
  }))

  const deleteWorldMutation = rspc.createMutation(() => ({
    mutationKey: ["instance.deleteWorld"]
  }))

  const exportWorldMutation = rspc.createMutation(() => ({
    mutationKey: ["instance.exportWorld"]
  }))

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 B"
    const k = 1024
    const sizes = ["B", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const handleBackupWorld = async () => {
    const worldId = selectedWorld()
    if (!worldId) {
      setError("Please select a world to backup")
      return
    }

    setIsBackingUp(true)
    setError(null)

    try {
      await backupWorldMutation.mutateAsync({
        instanceId: props.instanceId,
        worldId
      })
      setSuccess("World backed up successfully!")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to backup world")
    } finally {
      setIsBackingUp(false)
    }
  }

  const handleDeleteWorld = async () => {
    const worldId = selectedWorld()
    if (!worldId) {
      setError("Please select a world to delete")
      return
    }

    setIsDeleting(true)
    setError(null)

    try {
      await deleteWorldMutation.mutateAsync({
        instanceId: props.instanceId,
        worldId
      })
      setSuccess("World deleted successfully!")
      setSelectedWorld(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete world")
    } finally {
      setIsDeleting(false)
    }
  }

  const handleExportWorld = async () => {
    const worldId = selectedWorld()
    if (!worldId) {
      setError("Please select a world to export")
      return
    }

    setIsExporting(true)
    setError(null)

    try {
      await exportWorldMutation.mutateAsync({
        instanceId: props.instanceId,
        worldId
      })
      setSuccess("World exported successfully!")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to export world")
    } finally {
      setIsExporting(false)
    }
  }

  const getGameModeIcon = (gameMode: string | null) => {
    switch (gameMode?.toLowerCase()) {
      case "survival": return "i-hugeicons:sword"
      case "creative": return "i-hugeicons:paint-brush-01"
      case "adventure": return "i-hugeicons:map"
      case "spectator": return "i-hugeicons:eye"
      default: return "i-hugeicons:globe"
    }
  }

  return (
    <ModalLayout
      title={`World Manager - ${props.instanceName}`}
      height="h-[600px] max-h-[90vh]"
      width="w-[700px] max-w-[95vw]"
    >
      <div class="flex flex-col gap-6 p-6 h-full overflow-hidden">
        {/* Info Banner */}
        <div class="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-4">
          <div class="flex gap-3">
            <div class="i-hugeicons:information-circle text-emerald-400 h-5 w-5 flex-shrink-0 mt-0.5" />
            <p class="text-sm text-emerald-200">
              Manage your world saves here. You can backup, export, or delete worlds. 
              Backups are stored in the instance folder.
            </p>
          </div>
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

        {/* Worlds List */}
        <div class="flex-1 flex flex-col min-h-0">
          <h3 class="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <div class="i-hugeicons:globe h-5 w-5 text-emerald-400" />
            World Saves
          </h3>
          
          <Show when={worldsQuery.isLoading}>
            <div class="flex items-center justify-center py-8">
              <Spinner class="h-8 w-8" />
            </div>
          </Show>

          <Show when={!worldsQuery.isLoading && worldsQuery.data?.length === 0}>
            <div class="flex flex-col items-center justify-center py-8 text-gray-500">
              <div class="i-hugeicons:map h-12 w-12 mb-4" />
              <p>No worlds found</p>
              <p class="text-sm">Play the game to create a world</p>
            </div>
          </Show>

          <Show when={!worldsQuery.isLoading && worldsQuery.data && worldsQuery.data.length > 0}>
            <div class="flex-1 overflow-y-auto rounded-lg border border-darkSlate-600 bg-darkSlate-800/50">
              <div class="divide-y divide-darkSlate-600">
                <For each={worldsQuery.data}>
                  {(world: any) => (
                    <div
                      class={`flex items-center gap-4 p-4 cursor-pointer hover:bg-darkSlate-700/50 transition-colors ${
                        selectedWorld() === world.id ? "bg-emerald-500/10 border-l-4 border-l-emerald-500" : ""
                      }`}
                      onClick={() => setSelectedWorld(world.id)}
                    >
                      {/* World Thumbnail */}
                      <Show when={world.thumbnail} fallback={
                        <div class="flex h-16 w-16 items-center justify-center rounded-lg bg-darkSlate-700">
                          <div class={`${getGameModeIcon(world.gameMode)} h-8 w-8 text-emerald-400`} />
                        </div>
                      }>
                        <img src={world.thumbnail} alt={world.name} class="h-16 w-16 rounded-lg object-cover" />
                      </Show>
                      
                      <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-2">
                          <span class="font-medium text-white truncate">{world.name}</span>
                          <Show when={world.isBackup}>
                            <span class="text-xs text-yellow-400 bg-yellow-500/20 px-2 py-0.5 rounded">Backup</span>
                          </Show>
                        </div>
                        <div class="flex items-center gap-3 text-xs text-gray-400 mt-1">
                          <Show when={world.gameMode}>
                            <span class="capitalize">{world.gameMode}</span>
                            <span>•</span>
                          </Show>
                          <Show when={world.difficulty}>
                            <span class="capitalize">{world.difficulty}</span>
                            <span>•</span>
                          </Show>
                          <Show when={world.size}>
                            <span>{formatBytes(world.size)}</span>
                          </Show>
                        </div>
                        <div class="flex items-center gap-3 text-xs text-gray-500 mt-1">
                          <Show when={world.lastPlayed}>
                            <span>Last played: {format(new Date(world.lastPlayed), "MMM d, yyyy")}</span>
                          </Show>
                        </div>
                      </div>
                      
                      <div class="i-hugeicons:checkmark-circle-02 h-5 w-5 text-emerald-400" 
                           classList={{ "opacity-0": selectedWorld() !== world.id, "opacity-100": selectedWorld() === world.id }} 
                      />
                    </div>
                  )}
                </For>
              </div>
            </div>
          </Show>
        </div>

        {/* Action Buttons */}
        <div class="flex gap-3 pt-4 border-t border-darkSlate-600">
          <Button
            type="secondary"
            onClick={handleDeleteWorld}
            disabled={!selectedWorld() || isDeleting()}
            loading={isDeleting()}
          >
            <div class="i-hugeicons:delete-02 h-4 w-4" />
            Delete
          </Button>
          <Button
            type="secondary"
            onClick={handleBackupWorld}
            disabled={!selectedWorld() || isBackingUp()}
            loading={isBackingUp()}
          >
            <div class="i-hugeicons:archive h-4 w-4" />
            Backup
          </Button>
          <Button
            type="secondary"
            onClick={handleExportWorld}
            disabled={!selectedWorld() || isExporting()}
            loading={isExporting()}
          >
            <div class="i-hugeicons:export h-4 w-4" />
            Export
          </Button>
          <div class="flex-1" />
          <Button
            type="secondary"
            onClick={() => props.closeModal?.()}
          >
            Close
          </Button>
        </div>
      </div>
    </ModalLayout>
  )
}

export default WorldManager
