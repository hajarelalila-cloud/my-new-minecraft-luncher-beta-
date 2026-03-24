import { ModalProps } from "../../"
import ModalLayout from "../../ModalLayout"
import { Trans } from "@gd/i18n"
import { createSignal, For, Show, onMount } from "solid-js"
import { Button, Spinner } from "@gd/ui"
import { rspc } from "@/utils/rspcClient"
import { format } from "date-fns"

interface InstanceBackupProps extends ModalProps {
  instanceId: number
  instanceName: string
  instancePath: string
}

const InstanceBackup = (props: InstanceBackupProps) => {
  const [backupName, setBackupName] = createSignal("")
  const [backupDescription, setBackupDescription] = createSignal("")
  const [isCreating, setIsCreating] = createSignal(false)
  const [isRestoring, setIsRestoring] = createSignal(false)
  const [isDeleting, setIsDeleting] = createSignal(false)
  const [selectedBackup, setSelectedBackup] = createSignal<number | null>(null)
  const [error, setError] = createSignal<string | null>(null)
  const [success, setSuccess] = createSignal<string | null>(null)

  // Query for existing backups
  const backupsQuery = rspc.createQuery(() => ({
    queryKey: ["instance.getBackups", props.instanceId]
  }))

  // Mutations
  const createBackupMutation = rspc.createMutation(() => ({
    mutationKey: ["instance.createBackup"]
  }))

  const restoreBackupMutation = rspc.createMutation(() => ({
    mutationKey: ["instance.restoreBackup"]
  }))

  const deleteBackupMutation = rspc.createMutation(() => ({
    mutationKey: ["instance.deleteBackup"]
  }))

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 B"
    const k = 1024
    const sizes = ["B", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const handleCreateBackup = async () => {
    if (!backupName().trim()) {
      setError("Please enter a backup name")
      return
    }

    setIsCreating(true)
    setError(null)
    setSuccess(null)

    try {
      await createBackupMutation.mutateAsync({
        instanceId: props.instanceId,
        name: backupName(),
        description: backupDescription() || undefined
      })
      setSuccess("Backup created successfully!")
      setBackupName("")
      setBackupDescription("")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create backup")
    } finally {
      setIsCreating(false)
    }
  }

  const handleRestoreBackup = async () => {
    const backupId = selectedBackup()
    if (!backupId) {
      setError("Please select a backup to restore")
      return
    }

    setIsRestoring(true)
    setError(null)
    setSuccess(null)

    try {
      await restoreBackupMutation.mutateAsync({
        instanceId: props.instanceId,
        backupId
      })
      setSuccess("Backup restored successfully!")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to restore backup")
    } finally {
      setIsRestoring(false)
    }
  }

  const handleDeleteBackup = async () => {
    const backupId = selectedBackup()
    if (!backupId) {
      setError("Please select a backup to delete")
      return
    }

    setIsDeleting(true)
    setError(null)
    setSuccess(null)

    try {
      await deleteBackupMutation.mutateAsync({
        instanceId: props.instanceId,
        backupId
      })
      setSuccess("Backup deleted successfully!")
      setSelectedBackup(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete backup")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <ModalLayout
      title={`Backups - ${props.instanceName}`}
      height="h-[600px] max-h-[90vh]"
      width="w-[600px] max-w-[95vw]"
    >
      <div class="flex flex-col gap-6 p-6 h-full overflow-hidden">
        {/* Create Backup Section */}
        <div class="rounded-xl bg-darkSlate-700/50 border border-darkSlate-600 p-4">
          <h3 class="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <div class="i-hugeicons:cloud-upload h-5 w-5 text-purple-400" />
            Create New Backup
          </h3>
          <div class="flex flex-col gap-3">
            <input
              type="text"
              placeholder="Backup name..."
              value={backupName()}
              onInput={(e) => setBackupName(e.currentTarget.value)}
              class="w-full rounded-lg border border-darkSlate-600 bg-darkSlate-800 px-4 py-2 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
            />
            <textarea
              placeholder="Description (optional)..."
              value={backupDescription()}
              onInput={(e) => setBackupDescription(e.currentTarget.value)}
              class="w-full rounded-lg border border-darkSlate-600 bg-darkSlate-800 px-4 py-2 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none resize-none h-20"
            />
            <Button
              type="primary"
              onClick={handleCreateBackup}
              loading={isCreating()}
              disabled={!backupName().trim() || isCreating()}
            >
              <div class="i-hugeicons:plus-sign h-4 w-4" />
              Create Backup
            </Button>
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

        {/* Existing Backups */}
        <div class="flex-1 flex flex-col min-h-0">
          <h3 class="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <div class="i-hugeicons:folder-history h-5 w-5 text-blue-400" />
            Existing Backups
          </h3>
          
          <Show when={backupsQuery.isLoading}>
            <div class="flex items-center justify-center py-8">
              <Spinner class="h-8 w-8" />
            </div>
          </Show>

          <Show when={!backupsQuery.isLoading && backupsQuery.data?.length === 0}>
            <div class="flex flex-col items-center justify-center py-8 text-gray-500">
              <div class="i-hugeicons:folder-open h-12 w-12 mb-4" />
              <p>No backups yet</p>
              <p class="text-sm">Create your first backup above</p>
            </div>
          </Show>

          <Show when={!backupsQuery.isLoading && backupsQuery.data && backupsQuery.data.length > 0}>
            <div class="flex-1 overflow-y-auto rounded-lg border border-darkSlate-600 bg-darkSlate-800/50">
              <div class="divide-y divide-darkSlate-600">
                <For each={backupsQuery.data}>
                  {(backup) => (
                    <div
                      class={`flex items-center gap-4 p-4 cursor-pointer hover:bg-darkSlate-700/50 transition-colors ${
                        selectedBackup() === backup.id ? "bg-purple-500/10 border-l-4 border-l-purple-500" : ""
                      }`}
                      onClick={() => setSelectedBackup(backup.id)}
                    >
                      <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/20">
                        <div class="i-hugeicons:archive h-5 w-5 text-purple-400" />
                      </div>
                      <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-2">
                          <span class="font-medium text-white truncate">{backup.name}</span>
                        </div>
                        <div class="flex items-center gap-3 text-xs text-gray-400">
                          <span>{format(new Date(backup.createdAt), "MMM d, yyyy h:mm a")}</span>
                          <span>•</span>
                          <span>{formatBytes(backup.size)}</span>
                        </div>
                        <Show when={backup.description}>
                          <p class="text-xs text-gray-500 mt-1 truncate">{backup.description}</p>
                        </Show>
                      </div>
                      <div class="i-hugeicons:checkmark-circle-02 h-5 w-5 text-purple-400" 
                           classList={{ "opacity-0": selectedBackup() !== backup.id, "opacity-100": selectedBackup() === backup.id }} 
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
            onClick={handleDeleteBackup}
            disabled={!selectedBackup() || isDeleting()}
            loading={isDeleting()}
          >
            <div class="i-hugeicons:delete-02 h-4 w-4" />
            Delete
          </Button>
          <div class="flex-1" />
          <Button
            type="secondary"
            onClick={() => props.closeModal?.()}
          >
            Close
          </Button>
          <Button
            type="primary"
            onClick={handleRestoreBackup}
            disabled={!selectedBackup() || isRestoring()}
            loading={isRestoring()}
          >
            <div class="i-hugeicons:history-restore h-4 w-4" />
            Restore Backup
          </Button>
        </div>
      </div>
    </ModalLayout>
  )
}

export default InstanceBackup
