import { Show, For, createSignal } from "solid-js"
import { Button, Input } from "@gd/ui"
import { useParams } from "@solidjs/router"
import { rspc } from "@/utils/rspcClient"
import { useModal } from "@/managers/ModalsManager"
import { Trans } from "@gd/i18n"

interface Server {
  id: string
  name: string
  address: string
  port: number
  online: boolean
  players: number
  maxPlayers: number
  icon: string | null
}

const ServersTab = () => {
  const params = useParams()
  const instanceId = () => parseInt(params.id, 10)
  const modalsContext = useModal()
  
  const [searchQuery, setSearchQuery] = createSignal("")
  const [selectedServer, setSelectedServer] = createSignal<Server | null>(null)
  
  // Favorite servers (would be loaded from database in real implementation)
  const [favoriteServers, setFavoriteServers] = createSignal<Server[]>([
    { id: "1", name: "Hypixel", address: "mc.hypixel.net", port: 25565, online: true, players: 45000, maxPlayers: 100000, icon: null },
    { id: "2", name: "Mineplex", address: "us.mineplex.com", port: 25565, online: true, players: 2000, maxPlayers: 5000, icon: null },
  ])
  
  const instance = rspc.createQuery(() => ({
    queryKey: ["instance.getInstanceDetails", instanceId()],
    enabled: !isNaN(instanceId())
  }))

  const handleOpenServerBrowser = () => {
    modalsContext?.openModal(
      { name: "serverBrowser" },
      { instanceId: instanceId() }
    )
  }

  const handleConnect = (server: Server) => {
    // In real implementation, this would launch the game with server connection
    console.log("Connecting to:", server.address, server.port)
  }

  const handleRemoveServer = (serverId: string) => {
    setFavoriteServers(servers => servers.filter(s => s.id !== serverId))
  }

  return (
    <div class="flex h-full flex-col gap-4 p-4">
      {/* Header */}
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-xl font-bold text-white">
            <Trans key="servers:_trn_title">Servers</Trans>
          </h2>
          <p class="text-sm text-gray-400">
            <Trans key="servers:_trn_description">Manage your favorite servers</Trans>
          </p>
        </div>
        <div class="flex gap-2">
          <Button
            type="secondary"
            onClick={handleOpenServerBrowser}
          >
            <div class="i-hugeicons:globe-02 mr-2" />
            <Trans key="servers:_trn_browser">Server Browser</Trans>
          </Button>
          <Button
            type="primary"
          >
            <div class="i-hugeicons:add-01 mr-2" />
            <Trans key="servers:_trn_add">Add Server</Trans>
          </Button>
        </div>
      </div>

      {/* Search */}
      <div class="w-full max-w-md">
        <Input
          placeholder="Search servers..."
          value={searchQuery()}
          onInput={(e) => setSearchQuery(e.currentTarget.value)}
          class="w-full"
        />
      </div>

      {/* Favorite Servers */}
      <div class="mt-4">
        <h3 class="mb-3 text-lg font-semibold text-white">
          <Trans key="servers:_trn_favorites">Favorite Servers</Trans>
        </h3>
        
        <Show
          when={favoriteServers().length > 0}
          fallback={
            <div class="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-600 py-12">
              <div class="i-hugeicons:server h-16 w-16 text-gray-500" />
              <p class="mt-4 text-gray-400">
                <Trans key="servers:_trn_no_favorites">No favorite servers yet</Trans>
              </p>
              <Button
                type="secondary"
                class="mt-4"
                onClick={handleOpenServerBrowser}
              >
                <div class="i-hugeicons:globe-02 mr-2" />
                <Trans key="servers:_trn_find_servers">Find Servers</Trans>
              </Button>
            </div>
          }
        >
          <div class="space-y-2">
            <For each={favoriteServers()}>
              {(server) => (
                <div class="flex items-center justify-between rounded-lg bg-darkSlate-700 p-4">
                  <div class="flex items-center gap-4">
                    <div class="flex h-12 w-12 items-center justify-center rounded-lg bg-darkSlate-800">
                      <div class="i-hugeicons:server text-2xl text-gray-400" />
                    </div>
                    <div>
                      <h4 class="font-semibold text-white">{server.name}</h4>
                      <p class="text-sm text-gray-400">{server.address}:{server.port}</p>
                    </div>
                  </div>
                  <div class="flex items-center gap-4">
                    <div class="text-right">
                      <div class="flex items-center gap-2">
                        <div
                          class="h-2 w-2 rounded-full"
                          classList={{
                            "bg-green-500": server.online,
                            "bg-red-500": !server.online
                          }}
                        />
                        <span class="text-sm text-gray-400">
                          {server.online ? "Online" : "Offline"}
                        </span>
                      </div>
                      <p class="text-xs text-gray-500">
                        {server.players} / {server.maxPlayers} players
                      </p>
                    </div>
                    <Button
                      type="primary"
                      size="small"
                      onClick={() => handleConnect(server)}
                    >
                      <Trans key="servers:_trn_connect">Connect</Trans>
                    </Button>
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
          <Trans key="servers:_trn_quick_actions">Quick Actions</Trans>
        </h3>
        <div class="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <button
            class="flex flex-col items-center gap-2 rounded-lg bg-darkSlate-700 p-4 transition-all hover:bg-darkSlate-600"
            onClick={handleOpenServerBrowser}
          >
            <div class="i-hugeicons:globe-02 text-2xl text-purple-400" />
            <span class="text-sm text-white">
              <Trans key="servers:_trn_browse">Browse Servers</Trans>
            </span>
          </button>
          <button class="flex flex-col items-center gap-2 rounded-lg bg-darkSlate-700 p-4 transition-all hover:bg-darkSlate-600">
            <div class="i-hugeicons:import-01 text-2xl text-blue-400" />
            <span class="text-sm text-white">
              <Trans key="servers:_trn_import">Import Server</Trans>
            </span>
          </button>
          <button class="flex flex-col items-center gap-2 rounded-lg bg-darkSlate-700 p-4 transition-all hover:bg-darkSlate-600">
            <div class="i-hugeicons:history text-2xl text-green-400" />
            <span class="text-sm text-white">
              <Trans key="servers:_trn_recent">Recent Servers</Trans>
            </span>
          </button>
          <button class="flex flex-col items-center gap-2 rounded-lg bg-darkSlate-700 p-4 transition-all hover:bg-darkSlate-600">
            <div class="i-hugeicons:direct-send text-2xl text-orange-400" />
            <span class="text-sm text-white">
              <Trans key="servers:_trn_direct">Direct Connect</Trans>
            </span>
          </button>
        </div>
      </div>

      {/* Info Box */}
      <div class="mt-4 rounded-lg bg-blue-900/20 border border-blue-500/30 p-4">
        <div class="flex items-start gap-3">
          <div class="i-hugeicons:information-circle text-xl text-blue-400" />
          <div>
            <h4 class="font-semibold text-blue-200">
              <Trans key="servers:_trn_info_title">Server Management</Trans>
            </h4>
            <p class="mt-1 text-sm text-blue-300/70">
              <Trans key="servers:_trn_info_desc">Add your favorite servers for quick access. You can also browse public servers or connect directly using an IP address.</Trans>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ServersTab
