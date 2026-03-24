import { Show, For, createSignal } from "solid-js"
import { Button, Input } from "@gd/ui"
import { useParams } from "@solidjs/router"
import { rspc } from "@/utils/rspcClient"
import { useModal } from "@/managers/ModalsManager"
import { Trans } from "@gd/i18n"

interface World {
  id: string
  name: string
  lastPlayed: string | null
  gameMode: string
  difficulty: string
  size: number
  isBackup: boolean
}

const WorldsTab = () => {
  const params = useParams()
  const instanceId = () => parseInt(params.id, 10)
  const modalsContext = useModal()
  
  const [searchQuery, setSearchQuery] = createSignal("")
  const [selectedWorld, setSelectedWorld] = createSignal<World | null>(null)
  
  // Sample worlds (would be loaded from instance folder in real implementation)
  const [worlds, setWorlds] = createSignal<World[]>([
    { id: "1", name: "New World", lastPlayed: "2024-03-20", gameMode: "Survival", difficulty: "Normal", size: 45000000, isBackup: false },
    { id: "2", name: "Creative World", lastPlayed: "2024-03-15", gameMode: "Creative", difficulty: "Peaceful", size: 12000000, isBackup: false },
  ])
  
  const instance = rspc.createQuery(() => ({
    queryKey: ["instance.getInstanceDetails", instanceId()],
    enabled: !isNaN(instanceId())
  }))

  const handleOpenWorldManager = () => {
    modalsContext?.openModal(
      { name: "worldManager" },
      { instanceId: instanceId() }
    )
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const handleBackupWorld = (world: World) => {
    console.log("Backing up world:", world.name)
  }

  const handleDeleteWorld = (worldId: string) => {
    setWorlds(worlds => worlds.filter(w => w.id !== worldId))
  }

  return (
    <div class="flex h-full flex-col gap-4 p-4">
      {/* Header */}
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-xl font-bold text-white">
            <Trans key="worlds:_trn_title">Worlds</Trans>
          </h2>
          <p class="text-sm text-gray-400">
            <Trans key="worlds:_trn_description">Manage your Minecraft worlds</Trans>
          </p>
        </div>
        <div class="flex gap-2">
          <Button
            type="secondary"
            onClick={handleOpenWorldManager}
          >
            <div class="i-hugeicons:folder-open mr-2" />
            <Trans key="worlds:_trn_open_folder">Open Folder</Trans>
          </Button>
          <Button
            type="primary"
          >
            <div class="i-hugeicons:import-01 mr-2" />
            <Trans key="worlds:_trn_import">Import World</Trans>
          </Button>
        </div>
      </div>

      {/* Search */}
      <div class="w-full max-w-md">
        <Input
          placeholder="Search worlds..."
          value={searchQuery()}
          onInput={(e) => setSearchQuery(e.currentTarget.value)}
          class="w-full"
        />
      </div>

      {/* Worlds List */}
      <div class="mt-4">
        <h3 class="mb-3 text-lg font-semibold text-white">
          <Trans key="worlds:_trn_all_worlds">All Worlds</Trans>
        </h3>
        
        <Show
          when={worlds().length > 0}
          fallback={
            <div class="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-600 py-12">
              <div class="i-hugeicons:world h-16 w-16 text-gray-500" />
              <p class="mt-4 text-gray-400">
                <Trans key="worlds:_trn_no_worlds">No worlds found</Trans>
              </p>
              <p class="mt-1 text-sm text-gray-500">
                <Trans key="worlds:_trn_play_create">Play the game to create your first world</Trans>
              </p>
            </div>
          }
        >
          <div class="space-y-2">
            <For each={worlds()}>
              {(world) => (
                <div class="flex items-center justify-between rounded-lg bg-darkSlate-700 p-4">
                  <div class="flex items-center gap-4">
                    <div class="flex h-12 w-12 items-center justify-center rounded-lg bg-darkSlate-800">
                      <div class="i-hugeicons:world text-2xl text-green-400" />
                    </div>
                    <div>
                      <h4 class="font-semibold text-white">{world.name}</h4>
                      <p class="text-sm text-gray-400">
                        {world.gameMode} • {world.difficulty} • {formatBytes(world.size)}
                      </p>
                    </div>
                  </div>
                  <div class="flex items-center gap-4">
                    <div class="text-right">
                      <p class="text-sm text-gray-400">
                        {world.lastPlayed ? `Last played: ${world.lastPlayed}` : "Never played"}
                      </p>
                      <Show when={world.isBackup}>
                        <span class="text-xs text-purple-400">(Backup)</span>
                      </Show>
                    </div>
                    <div class="flex gap-2">
                      <Button
                        type="secondary"
                        size="small"
                        onClick={() => handleBackupWorld(world)}
                      >
                        <div class="i-hugeicons:archive-01" />
                      </Button>
                      <Button
                        type="secondary"
                        size="small"
                      >
                        <div class="i-hugeicons:export-01" />
                      </Button>
                      <Button
                        type="secondary"
                        size="small"
                        variant="red"
                        onClick={() => handleDeleteWorld(world.id)}
                      >
                        <div class="i-hugeicons:delete-02" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </For>
          </div>
        </Show>
      </div>

      {/* Quick Actions */}
      <div class="mt-6">
        <h3 class="mb-3 text-lg font-semibold text-white">
          <Trans key="worlds:_trn_quick_actions">Quick Actions</Trans>
        </h3>
        <div class="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <button class="flex flex-col items-center gap-2 rounded-lg bg-darkSlate-700 p-4 transition-all hover:bg-darkSlate-600">
            <div class="i-hugeicons:import-01 text-2xl text-purple-400" />
            <span class="text-sm text-white">
              <Trans key="worlds:_trn_import">Import World</Trans>
            </span>
          </button>
          <button class="flex flex-col items-center gap-2 rounded-lg bg-darkSlate-700 p-4 transition-all hover:bg-darkSlate-600">
            <div class="i-hugeicons:export-01 text-2xl text-blue-400" />
            <span class="text-sm text-white">
              <Trans key="worlds:_trn_export">Export World</Trans>
            </span>
          </button>
          <button class="flex flex-col items-center gap-2 rounded-lg bg-darkSlate-700 p-4 transition-all hover:bg-darkSlate-600">
            <div class="i-hugeicons:archive-01 text-2xl text-green-400" />
            <span class="text-sm text-white">
              <Trans key="worlds:_trn_backup">Backup All</Trans>
            </span>
          </button>
          <button class="flex flex-col items-center gap-2 rounded-lg bg-darkSlate-700 p-4 transition-all hover:bg-darkSlate-600">
            <div class="i-hugeicons:refresh-01 text-2xl text-orange-400" />
            <span class="text-sm text-white">
              <Trans key="worlds:_trn_refresh">Refresh</Trans>
            </span>
          </button>
        </div>
      </div>

      {/* Info Box */}
      <div class="mt-4 rounded-lg bg-green-900/20 border border-green-500/30 p-4">
        <div class="flex items-start gap-3">
          <div class="i-hugeicons:information-circle text-xl text-green-400" />
          <div>
            <h4 class="font-semibold text-green-200">
              <Trans key="worlds:_trn_info_title">World Management</Trans>
            </h4>
            <p class="mt-1 text-sm text-green-300/70">
              <Trans key="worlds:_trn_info_desc">Your worlds are stored locally. Create backups regularly to prevent data loss. You can import worlds from other launchers or downloaded world files.</Trans>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default WorldsTab
