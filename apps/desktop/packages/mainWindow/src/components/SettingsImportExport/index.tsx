import { createSignal, Show } from "solid-js"
import { Button, Input, Progress } from "@gd/ui"
import { useTransContext } from "@gd/i18n"

interface SettingsBackup {
  id: number
  name: string
  description?: string
  createdAt: Date
  size: number
}

interface Props {
  backups: SettingsBackup[]
  isExporting: boolean
  isImporting: boolean
  exportProgress: number
  importProgress: number
  onExport: (name: string, description?: string) => void
  onImport: (filePath: string) => void
  onRestore: (backupId: number) => void
  onDelete: (backupId: number) => void
  onSelectFile: () => Promise<string | null>
}

const SettingsImportExport = (props: Props) => {
  const [t] = useTransContext()
  const [showExportForm, setShowExportForm] = createSignal(false)
  const [exportName, setExportName] = createSignal("")
  const [exportDesc, setExportDesc] = createSignal("")

  const handleExport = () => {
    if (exportName().trim()) {
      props.onExport(exportName().trim(), exportDesc().trim() || undefined)
      setExportName("")
      setExportDesc("")
      setShowExportForm(false)
    }
  }

  const handleImportClick = async () => {
    const filePath = await props.onSelectFile()
    if (filePath) {
      props.onImport(filePath)
    }
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

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div class="flex flex-col gap-4">
      {/* Header */}
      <div class="flex items-center justify-between">
        <div>
          <h3 class="text-lg font-semibold">Settings Backup</h3>
          <p class="text-darkSlate-400 text-sm">
            Export and import your launcher settings
          </p>
        </div>
      </div>

      {/* Quick actions */}
      <div class="flex gap-2">
        <Button
          type="primary"
          size="small"
          onClick={() => setShowExportForm(!showExportForm())}
          disabled={props.isExporting}
        >
          <div class="i-hugeicons:export h-4 w-4" />
          <span>Export Settings</span>
        </Button>
        <Button
          type="secondary"
          size="small"
          onClick={handleImportClick}
          disabled={props.isImporting}
        >
          <div class="i-hugeicons:import h-4 w-4" />
          <span>Import Settings</span>
        </Button>
      </div>

      {/* Export form */}
      <Show when={showExportForm()}>
        <div class="bg-darkSlate-700 rounded-xl p-4">
          <div class="text-sm font-medium mb-3">Export Settings</div>
          <div class="flex flex-col gap-3">
            <Input
              placeholder="Backup name..."
              value={exportName()}
              onInput={(e) => setExportName(e.currentTarget.value)}
            />
            <Input
              placeholder="Description (optional)..."
              value={exportDesc()}
              onInput={(e) => setExportDesc(e.currentTarget.value)}
            />
            <div class="text-darkSlate-400 text-xs">
              This will export all launcher settings including:
              <ul class="list-disc list-inside mt-1">
                <li>Java profiles and settings</li>
                <li>Theme and appearance preferences</li>
                <li>Custom commands</li>
                <li>Instance settings</li>
              </ul>
            </div>
            <div class="flex gap-2">
              <Button
                type="secondary"
                size="small"
                onClick={() => setShowExportForm(false)}
              >
                Cancel
              </Button>
              <Button
                type="primary"
                size="small"
                onClick={handleExport}
                disabled={!exportName().trim()}
              >
                Export
              </Button>
            </div>
          </div>
        </div>
      </Show>

      {/* Export progress */}
      <Show when={props.isExporting}>
        <div class="bg-darkSlate-700 rounded-xl p-4">
          <div class="flex items-center gap-3 mb-3">
            <div class="i-hugeicons:loading-03 h-5 w-5 animate-spin text-primary-400" />
            <span class="text-sm font-medium">Exporting settings...</span>
          </div>
          <Progress value={props.exportProgress} max={100} />
          <div class="text-darkSlate-400 text-xs mt-2">
            {props.exportProgress}% complete
          </div>
        </div>
      </Show>

      {/* Import progress */}
      <Show when={props.isImporting}>
        <div class="bg-darkSlate-700 rounded-xl p-4">
          <div class="flex items-center gap-3 mb-3">
            <div class="i-hugeicons:loading-03 h-5 w-5 animate-spin text-primary-400" />
            <span class="text-sm font-medium">Importing settings...</span>
          </div>
          <Progress value={props.importProgress} max={100} />
          <div class="text-darkSlate-400 text-xs mt-2">
            {props.importProgress}% complete
          </div>
        </div>
      </Show>

      {/* Backups list */}
      <Show when={props.backups.length > 0}>
        <div class="text-sm font-medium mt-4">Previous Backups</div>
        <div class="flex flex-col gap-2">
          <For each={props.backups}>
            {(backup) => (
              <div class="bg-darkSlate-700 rounded-xl p-4">
                <div class="flex items-center justify-between gap-4">
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2">
                      <div class="i-hugeicons:settings-backup h-4 w-4 text-primary-400" />
                      <span class="font-medium truncate">{backup.name}</span>
                    </div>
                    <Show when={backup.description}>
                      <div class="text-darkSlate-400 text-sm truncate">
                        {backup.description}
                      </div>
                    </Show>
                    <div class="flex items-center gap-4 mt-1 text-xs text-darkSlate-400">
                      <span>{formatDate(backup.createdAt)}</span>
                      <span>{formatSize(backup.size)}</span>
                    </div>
                  </div>
                  <div class="flex gap-2">
                    <Button
                      type="primary"
                      size="small"
                      onClick={() => props.onRestore(backup.id)}
                    >
                      <div class="i-hugeicons:restore-update h-4 w-4" />
                      <span>Restore</span>
                    </Button>
                    <Button
                      type="danger"
                      size="small"
                      onClick={() => props.onDelete(backup.id)}
                    >
                      <div class="i-hugeicons:delete-02 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </For>
        </div>
      </Show>

      {/* Info */}
      <div class="bg-blue-500/10 border border-blue-500/30 rounded-xl p-3">
        <div class="flex items-start gap-2">
          <div class="i-hugeicons:information-circle h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div class="text-sm text-blue-200">
            <strong>Note:</strong> Settings backups are stored locally. Account credentials are never exported for security reasons.
          </div>
        </div>
      </div>
    </div>
  )
}

export default SettingsImportExport
