import { createSignal, For, Show } from "solid-js"
import { Button, Input, Progress, Badge } from "@gd/ui"
import { useTransContext } from "@gd/i18n"

interface Backup {
  id: number
  name: string
  description?: string
  createdAt: Date
  path: string
  size: number
}

interface Props {
  backups: Backup[]
  isCreating: boolean
  createProgress: number
  onCreateBackup: (name: string, description?: string) => void
  onRestoreBackup: (backupId: number) => void
  onDeleteBackup: (backupId: number) => void
  onOpenBackupFolder: (backupId: number) => void
}

const InstanceBackup = (props: Props) => {
  const [t] = useTransContext()
  const [showCreateForm, setShowCreateForm] = createSignal(false)
  const [newBackupName, setNewBackupName] = createSignal("")
  const [newBackupDesc, setNewBackupDesc] = createSignal("")
  const [restoreConfirm, setRestoreConfirm] = createSignal<number | null>(null)

  const handleCreateBackup = () => {
    if (newBackupName().trim()) {
      props.onCreateBackup(newBackupName().trim(), newBackupDesc().trim() || undefined)
      setNewBackupName("")
      setNewBackupDesc("")
      setShowCreateForm(false)
    }
  }

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  return (
    <div class="flex flex-col gap-4">
      {/* Header */}
      <div class="flex items-center justify-between">
        <div>
          <h3 class="text-lg font-semibold">Instance Backups</h3>
          <p class="text-darkSlate-400 text-sm">
            Create and restore backups of your instance
          </p>
        </div>
        <Button
          type="primary"
          size="small"
          onClick={() => setShowCreateForm(!showCreateForm())}
          disabled={props.isCreating}
        >
          <div class="i-hugeicons:database-sync h-4 w-4" />
          <span>Create Backup</span>
        </Button>
      </div>

      {/* Create backup form */}
      <Show when={showCreateForm()}>
        <div class="bg-darkSlate-700 rounded-xl p-4">
          <div class="text-sm font-medium mb-3">Create New Backup</div>
          <div class="flex flex-col gap-3">
            <Input
              placeholder="Backup name..."
              value={newBackupName()}
              onInput={(e) => setNewBackupName(e.currentTarget.value)}
            />
            <Input
              placeholder="Description (optional)..."
              value={newBackupDesc()}
              onInput={(e) => setNewBackupDesc(e.currentTarget.value)}
            />
            <div class="flex gap-2">
              <Button
                type="secondary"
                size="small"
                onClick={() => setShowCreateForm(false)}
              >
                Cancel
              </Button>
              <Button
                type="primary"
                size="small"
                onClick={handleCreateBackup}
                disabled={!newBackupName().trim()}
              >
                Create Backup
              </Button>
            </div>
          </div>
        </div>
      </Show>

      {/* Creation progress */}
      <Show when={props.isCreating}>
        <div class="bg-darkSlate-700 rounded-xl p-4">
          <div class="flex items-center gap-3 mb-3">
            <div class="i-hugeicons:loading-03 h-5 w-5 animate-spin text-primary-400" />
            <span class="text-sm font-medium">Creating backup...</span>
          </div>
          <Progress value={props.createProgress} max={100} />
          <div class="text-darkSlate-400 text-xs mt-2">
            {props.createProgress}% complete
          </div>
        </div>
      </Show>

      {/* Backups list */}
      <div class="flex flex-col gap-2">
        <For each={props.backups}>
          {(backup) => (
            <div class="bg-darkSlate-700 rounded-xl p-4">
              <div class="flex items-start justify-between gap-4">
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2">
                    <div class="i-hugeicons:archive-01 h-5 w-5 text-primary-400" />
                    <span class="font-medium truncate">{backup.name}</span>
                  </div>
                  <Show when={backup.description}>
                    <div class="text-darkSlate-400 text-sm mt-1 truncate">
                      {backup.description}
                    </div>
                  </Show>
                  <div class="flex items-center gap-4 mt-2 text-xs text-darkSlate-400">
                    <span>{formatDate(backup.createdAt)}</span>
                    <span>{formatSize(backup.size)}</span>
                  </div>
                </div>

                {/* Actions */}
                <div class="flex gap-2">
                  <Show when={restoreConfirm() === backup.id}>
                    <div class="flex items-center gap-2">
                      <span class="text-xs text-yellow-400">Are you sure?</span>
                      <Button
                        type="danger"
                        size="small"
                        onClick={() => {
                          props.onRestoreBackup(backup.id)
                          setRestoreConfirm(null)
                        }}
                      >
                        Yes, Restore
                      </Button>
                      <Button
                        type="secondary"
                        size="small"
                        onClick={() => setRestoreConfirm(null)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </Show>
                  <Show when={restoreConfirm() !== backup.id}>
                    <Button
                      type="secondary"
                      size="small"
                      onClick={() => props.onOpenBackupFolder(backup.id)}
                    >
                      <div class="i-hugeicons:folder-open h-4 w-4" />
                    </Button>
                    <Button
                      type="primary"
                      size="small"
                      onClick={() => setRestoreConfirm(backup.id)}
                    >
                      <div class="i-hugeicons:restore-update h-4 w-4" />
                      <span>Restore</span>
                    </Button>
                    <Button
                      type="danger"
                      size="small"
                      onClick={() => props.onDeleteBackup(backup.id)}
                    >
                      <div class="i-hugeicons:delete-02 h-4 w-4" />
                    </Button>
                  </Show>
                </div>
              </div>
            </div>
          )}
        </For>

        <Show when={props.backups.length === 0}>
          <div class="bg-darkSlate-700/50 rounded-xl p-8 text-center">
            <div class="i-hugeicons:archive-02 h-12 w-12 mx-auto mb-3 text-darkSlate-500" />
            <div class="text-darkSlate-400">
              No backups yet. Create one to protect your instance data.
            </div>
          </div>
        </Show>
      </div>

      {/* Warning */}
      <div class="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-3">
        <div class="flex items-start gap-2">
          <div class="i-hugeicons:alert-02 h-5 w-5 text-yellow-400 flex-shrink-0 mt-0.5" />
          <div class="text-sm text-yellow-200">
            <strong>Warning:</strong> Restoring a backup will replace your current instance data. 
            Make sure to create a backup first if you want to preserve your current state.
          </div>
        </div>
      </div>
    </div>
  )
}

export default InstanceBackup
