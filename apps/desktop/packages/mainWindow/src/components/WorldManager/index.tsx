import { createSignal, For, Show } from "solid-js"
import { Button, Input } from "@gd/ui"
import { useTransContext } from "@gd/i18n"

interface World {
  id: number
  name: string
  path: string
  lastPlayed?: Date
  gameMode?: string
  difficulty?: string
  size?: number
  icon?: string
}

interface Screenshot {
  id: number
  filename: string
  path: string
  width?: number
  height?: number
  size: number
  createdAt: Date
}

interface Props {
  worlds: World[]
  screenshots: Screenshot[]
  instanceId: number
  onOpenWorld: (worldId: number) => void
  onDeleteWorld: (worldId: number) => void
  onOpenScreenshot: (screenshotId: number) => void
  onDeleteScreenshot: (screenshotId: number) => void
  onOpenFolder: (type: "worlds" | "screenshots") => void
}

const WorldManager = (props: Props) => {
  const [t] = useTransContext()
  const [activeTab, setActiveTab] = createSignal<"worlds" | "screenshots">("worlds")
  const [selectedWorld, setSelectedWorld] = createSignal<number | null>(null)
  const [selectedScreenshot, setSelectedScreenshot] = createSignal<number | null>(null)
  const [searchQuery, setSearchQuery] = createSignal("")

  const formatDate = (date?: Date) => {
    if (!date) return "Never"
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  const formatSize = (bytes?: number) => {
    if (!bytes) return "Unknown"
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
  }

  const filteredWorlds = () => {
    const query = searchQuery().toLowerCase()
    if (!query) return props.worlds
    return props.worlds.filter(w => w.name.toLowerCase().includes(query))
  }

  const filteredScreenshots = () => {
    const query = searchQuery().toLowerCase()
    if (!query) return props.screenshots
    return props.screenshots.filter(s => s.filename.toLowerCase().includes(query))
  }

  return (
    <div class="flex flex-col gap-4">
      {/* Header */}
      <div class="flex items-center justify-between">
        <div>
          <h3 class="text-lg font-semibold">World & Screenshot Manager</h3>
          <p class="text-darkSlate-400 text-sm">
            Browse and manage your worlds and screenshots
          </p>
        </div>
        <Button
          type="secondary"
          size="small"
          onClick={() => props.onOpenFolder(activeTab())}
        >
          <div class="i-hugeicons:folder-open h-4 w-4" />
          <span>Open Folder</span>
        </Button>
      </div>

      {/* Tabs */}
      <div class="flex border-b border-darkSlate-600">
        <button
          class={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab() === "worlds"
              ? "border-primary-500 text-primary-400"
              : "border-transparent text-darkSlate-400 hover:text-darkSlate-200"
          }`}
          onClick={() => setActiveTab("worlds")}
        >
          <div class="i-hugeicons:globe h-4 w-4" />
          <span>Worlds</span>
          <span class="text-xs bg-darkSlate-700 px-2 py-0.5 rounded-full">
            {props.worlds.length}
          </span>
        </button>
        <button
          class={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab() === "screenshots"
              ? "border-primary-500 text-primary-400"
              : "border-transparent text-darkSlate-400 hover:text-darkSlate-200"
          }`}
          onClick={() => setActiveTab("screenshots")}
        >
          <div class="i-hugeicons:camera-01 h-4 w-4" />
          <span>Screenshots</span>
          <span class="text-xs bg-darkSlate-700 px-2 py-0.5 rounded-full">
            {props.screenshots.length}
          </span>
        </button>
      </div>

      {/* Search */}
      <div class="relative">
        <div class="i-hugeicons:search-01 absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-darkSlate-400" />
        <Input
          placeholder={activeTab() === "worlds" ? "Search worlds..." : "Search screenshots..."}
          class="w-full pl-9"
          value={searchQuery()}
          onInput={(e) => setSearchQuery(e.currentTarget.value)}
        />
      </div>

      {/* Content */}
      <Show when={activeTab() === "worlds"}>
        <div class="grid grid-cols-1 gap-2 max-h-96 overflow-y-auto">
          <For each={filteredWorlds()}>
            {(world) => (
              <div
                class={`bg-darkSlate-700 rounded-xl p-4 cursor-pointer transition-all duration-200 ${
                  selectedWorld() === world.id ? "ring-2 ring-primary-500" : "hover:bg-darkSlate-600"
                }`}
                onClick={() => setSelectedWorld(world.id)}
              >
                <div class="flex items-center gap-4">
                  {/* World icon */}
                  <div class="flex-shrink-0">
                    <Show when={world.icon} fallback={
                      <div class="h-12 w-12 rounded-lg bg-darkSlate-600 flex items-center justify-center">
                        <div class="i-hugeicons:globe h-6 w-6 text-darkSlate-400" />
                      </div>
                    }>
                      <img
                        src={world.icon}
                        class="h-12 w-12 rounded-lg object-cover"
                        alt={world.name}
                      />
                    </Show>
                  </div>

                  {/* World info */}
                  <div class="flex-1 min-w-0">
                    <div class="font-medium truncate">{world.name}</div>
                    <div class="flex items-center gap-3 text-xs text-darkSlate-400 mt-1">
                      <Show when={world.gameMode}>
                        <span class="capitalize">{world.gameMode}</span>
                      </Show>
                      <Show when={world.difficulty}>
                        <span class="capitalize">{world.difficulty}</span>
                      </Show>
                      <Show when={world.size}>
                        <span>{formatSize(world.size)}</span>
                      </Show>
                    </div>
                    <div class="text-xs text-darkSlate-500 mt-1">
                      Last played: {formatDate(world.lastPlayed)}
                    </div>
                  </div>

                  {/* Actions */}
                  <div class="flex gap-2">
                    <Button
                      type="primary"
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation()
                        props.onOpenWorld(world.id)
                      }}
                    >
                      <div class="i-hugeicons:play h-4 w-4" />
                    </Button>
                    <Button
                      type="danger"
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation()
                        props.onDeleteWorld(world.id)
                      }}
                    >
                      <div class="i-hugeicons:delete-02 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </For>

          <Show when={filteredWorlds().length === 0}>
            <div class="bg-darkSlate-700/50 rounded-xl p-8 text-center">
              <div class="i-hugeicons:globe h-12 w-12 mx-auto mb-3 text-darkSlate-500" />
              <div class="text-darkSlate-400">
                {searchQuery() ? "No worlds match your search" : "No worlds found in this instance"}
              </div>
            </div>
          </Show>
        </div>
      </Show>

      <Show when={activeTab() === "screenshots"}>
        <div class="grid grid-cols-3 gap-2 max-h-96 overflow-y-auto">
          <For each={filteredScreenshots()}>
            {(screenshot) => (
              <div
                class={`bg-darkSlate-700 rounded-xl overflow-hidden cursor-pointer transition-all duration-200 ${
                  selectedScreenshot() === screenshot.id ? "ring-2 ring-primary-500" : "hover:ring-1 hover:ring-darkSlate-500"
                }`}
                onClick={() => setSelectedScreenshot(screenshot.id)}
              >
                {/* Screenshot preview */}
                <div class="aspect-video bg-darkSlate-800 flex items-center justify-center">
                  <img
                    src={`file://${screenshot.path}`}
                    class="w-full h-full object-cover"
                    alt={screenshot.filename}
                    onError={(e) => {
                      e.currentTarget.style.display = "none"
                    }}
                  />
                </div>
                
                {/* Info */}
                <div class="p-2">
                  <div class="text-xs font-medium truncate">{screenshot.filename}</div>
                  <div class="flex items-center justify-between text-xs text-darkSlate-400 mt-1">
                    <span>{screenshot.width}x{screenshot.height}</span>
                    <span>{formatSize(screenshot.size)}</span>
                  </div>
                </div>
              </div>
            )}
          </For>

          <Show when={filteredScreenshots().length === 0}>
            <div class="col-span-3 bg-darkSlate-700/50 rounded-xl p-8 text-center">
              <div class="i-hugeicons:camera-01 h-12 w-12 mx-auto mb-3 text-darkSlate-500" />
              <div class="text-darkSlate-400">
                {searchQuery() ? "No screenshots match your search" : "No screenshots found in this instance"}
              </div>
            </div>
          </Show>
        </div>
      </Show>
    </div>
  )
}

export default WorldManager
