import { ModalProps } from "../../"
import ModalLayout from "../../ModalLayout"
import { Trans } from "@gd/i18n"
import { createSignal, For, Show, onMount, createEffect } from "solid-js"
import { Button, Spinner, Input } from "@gd/ui"
import { rspc } from "@/utils/rspcClient"
import { format } from "date-fns"

interface ServerBrowserProps extends ModalProps {
  instanceId?: number
}

interface ServerInfo {
  address: string
  port: number
  name: string
  online: boolean
  playerCount: number
  maxPlayers: number
  ping: number
  motd: string
  version: string
  icon?: string
}

const ServerBrowser = (props: ServerBrowserProps) => {
  const [serverAddress, setServerAddress] = createSignal("")
  const [serverPort, setServerPort] = createSignal(25565)
  const [isPinging, setIsPinging] = createSignal(false)
  const [isAdding, setIsAdding] = createSignal(false)
  const [isJoining, setIsJoining] = createSignal(false)
  const [selectedServer, setSelectedServer] = createSignal<number | null>(null)
  const [currentServer, setCurrentServer] = createSignal<ServerInfo | null>(null)
  const [error, setError] = createSignal<string | null>(null)
  const [success, setSuccess] = createSignal<string | null>(null)
  const [searchQuery, setSearchQuery] = createSignal("")

  // Query for favorite servers
  const serversQuery = rspc.createQuery(() => ({
    queryKey: ["server.getFavorites"]
  }))

  // Mutations
  const addServerMutation = rspc.createMutation(() => ({
    mutationKey: ["server.addFavorite"]
  }))

  const removeServerMutation = rspc.createMutation(() => ({
    mutationKey: ["server.removeFavorite"]
  }))

  const pingServerMutation = rspc.createMutation(() => ({
    mutationKey: ["server.ping"]
  }))

  const joinServerMutation = rspc.createMutation(() => ({
    mutationKey: ["server.join"]
  }))

  const handlePingServer = async () => {
    if (!serverAddress().trim()) {
      setError("Please enter a server address")
      return
    }

    setIsPinging(true)
    setError(null)
    setCurrentServer(null)

    try {
      const result = await pingServerMutation.mutateAsync({
        address: serverAddress(),
        port: serverPort()
      })
      setCurrentServer(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to ping server")
    } finally {
      setIsPinging(false)
    }
  }

  const handleAddToFavorites = async () => {
    const server = currentServer()
    if (!server) {
      setError("Please ping a server first")
      return
    }

    setIsAdding(true)
    setError(null)

    try {
      await addServerMutation.mutateAsync({
        name: server.name || server.address,
        address: server.address,
        port: server.port,
        icon: server.icon
      })
      setSuccess("Server added to favorites!")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add server")
    } finally {
      setIsAdding(false)
    }
  }

  const handleJoinServer = async () => {
    const serverId = selectedServer()
    if (!serverId) {
      setError("Please select a server to join")
      return
    }

    setIsJoining(true)
    setError(null)

    try {
      await joinServerMutation.mutateAsync({
        serverId,
        instanceId: props.instanceId
      })
      setSuccess("Launching game...")
      setTimeout(() => props.closeModal?.(), 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to join server")
    } finally {
      setIsJoining(false)
    }
  }

  const handleRemoveServer = async () => {
    const serverId = selectedServer()
    if (!serverId) {
      setError("Please select a server to remove")
      return
    }

    try {
      await removeServerMutation.mutateAsync({ serverId })
      setSuccess("Server removed from favorites")
      setSelectedServer(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove server")
    }
  }

  const filteredServers = () => {
    const servers = serversQuery.data || []
    const query = searchQuery().toLowerCase()
    if (!query) return servers
    return servers.filter((s: any) => 
      s.name.toLowerCase().includes(query) || 
      s.address.toLowerCase().includes(query)
    )
  }

  const getPingColor = (ping: number) => {
    if (ping < 100) return "text-green-400"
    if (ping < 200) return "text-yellow-400"
    return "text-red-400"
  }

  return (
    <ModalLayout
      title="Server Browser"
      height="h-[700px] max-h-[90vh]"
      width="w-[800px] max-w-[95vw]"
    >
      <div class="flex flex-col gap-6 p-6 h-full overflow-hidden">
        {/* Quick Connect Section */}
        <div class="rounded-xl bg-darkSlate-700/50 border border-darkSlate-600 p-4">
          <h3 class="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <div class="i-hugeicons:connection h-5 w-5 text-blue-400" />
            Quick Connect
          </h3>
          <div class="flex gap-3">
            <div class="flex-1">
              <input
                type="text"
                placeholder="Server address (e.g., play.example.com)"
                value={serverAddress()}
                onInput={(e) => setServerAddress(e.currentTarget.value)}
                class="w-full rounded-lg border border-darkSlate-600 bg-darkSlate-800 px-4 py-2 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <input
              type="number"
              placeholder="Port"
              value={serverPort()}
              onInput={(e) => setServerPort(parseInt(e.currentTarget.value) || 25565)}
              class="w-24 rounded-lg border border-darkSlate-600 bg-darkSlate-800 px-4 py-2 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
            />
            <Button
              type="primary"
              onClick={handlePingServer}
              loading={isPinging()}
              disabled={!serverAddress().trim() || isPinging()}
            >
              <div class="i-hugeicons:satellite h-4 w-4" />
              Ping
            </Button>
          </div>

          {/* Server Preview */}
          <Show when={currentServer()}>
            <div class="mt-4 p-4 rounded-lg bg-darkSlate-800/50 border border-darkSlate-600">
              <div class="flex items-start gap-4">
                <Show when={currentServer()?.icon} fallback={
                  <div class="flex h-16 w-16 items-center justify-center rounded-lg bg-darkSlate-700">
                    <div class="i-hugeicons:server h-8 w-8 text-gray-500" />
                  </div>
                }>
                  <img src={currentServer()!.icon!} alt="Server icon" class="h-16 w-16 rounded-lg" />
                </Show>
                <div class="flex-1">
                  <div class="flex items-center gap-2 mb-1">
                    <span class="font-semibold text-white">{currentServer()?.name || currentServer()?.address}</span>
                    <Show when={currentServer()?.online}>
                      <span class="text-xs text-green-400 bg-green-500/20 px-2 py-0.5 rounded">Online</span>
                    </Show>
                    <Show when={!currentServer()?.online}>
                      <span class="text-xs text-red-400 bg-red-500/20 px-2 py-0.5 rounded">Offline</span>
                    </Show>
                  </div>
                  <div class="text-sm text-gray-400 mb-1">
                    {currentServer()?.address}:{currentServer()?.port}
                  </div>
                  <div class="flex items-center gap-4 text-sm">
                    <span class={getPingColor(currentServer()?.ping || 0)}>
                      {currentServer()?.ping}ms
                    </span>
                    <span class="text-gray-400">
                      👥 {currentServer()?.playerCount}/{currentServer()?.maxPlayers}
                    </span>
                    <span class="text-gray-500 text-xs">
                      {currentServer()?.version}
                    </span>
                  </div>
                  <Show when={currentServer()?.motd}>
                    <p class="text-xs text-gray-500 mt-2 line-clamp-2">{currentServer()?.motd}</p>
                  </Show>
                </div>
                <Button
                  type="secondary"
                  size="small"
                  onClick={handleAddToFavorites}
                  disabled={isAdding()}
                >
                  <div class="i-hugeicons:favourite h-4 w-4" />
                  Add to Favorites
                </Button>
              </div>
            </div>
          </Show>
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

        {/* Favorite Servers */}
        <div class="flex-1 flex flex-col min-h-0">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-white flex items-center gap-2">
              <div class="i-hugeicons:favourite-star h-5 w-5 text-yellow-400" />
              Favorite Servers
            </h3>
            <input
              type="text"
              placeholder="Search servers..."
              value={searchQuery()}
              onInput={(e) => setSearchQuery(e.currentTarget.value)}
              class="w-48 rounded-lg border border-darkSlate-600 bg-darkSlate-800 px-3 py-1.5 text-sm text-white placeholder-gray-500 focus:border-yellow-500 focus:outline-none"
            />
          </div>
          
          <Show when={serversQuery.isLoading}>
            <div class="flex items-center justify-center py-8">
              <Spinner class="h-8 w-8" />
            </div>
          </Show>

          <Show when={!serversQuery.isLoading && filteredServers().length === 0}>
            <div class="flex flex-col items-center justify-center py-8 text-gray-500">
              <div class="i-hugeicons:server h-12 w-12 mb-4" />
              <p>No favorite servers yet</p>
              <p class="text-sm">Ping a server and add it to favorites</p>
            </div>
          </Show>

          <Show when={!serversQuery.isLoading && filteredServers().length > 0}>
            <div class="flex-1 overflow-y-auto rounded-lg border border-darkSlate-600 bg-darkSlate-800/50">
              <div class="divide-y divide-darkSlate-600">
                <For each={filteredServers()}>
                  {(server: any) => (
                    <div
                      class={`flex items-center gap-4 p-4 cursor-pointer hover:bg-darkSlate-700/50 transition-colors ${
                        selectedServer() === server.id ? "bg-yellow-500/10 border-l-4 border-l-yellow-500" : ""
                      }`}
                      onClick={() => setSelectedServer(server.id)}
                    >
                      <Show when={server.icon} fallback={
                        <div class="flex h-12 w-12 items-center justify-center rounded-lg bg-darkSlate-700">
                          <div class="i-hugeicons:server h-6 w-6 text-gray-500" />
                        </div>
                      }>
                        <img src={server.icon} alt="Server icon" class="h-12 w-12 rounded-lg" />
                      </Show>
                      <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-2">
                          <span class="font-medium text-white truncate">{server.name}</span>
                          <Show when={server.online}>
                            <span class="w-2 h-2 rounded-full bg-green-400" />
                          </Show>
                          <Show when={!server.online}>
                            <span class="w-2 h-2 rounded-full bg-red-400" />
                          </Show>
                        </div>
                        <div class="text-xs text-gray-400">
                          {server.address}:{server.port}
                        </div>
                        <div class="flex items-center gap-3 mt-1 text-xs">
                          <Show when={server.lastPing}>
                            <span class={getPingColor(server.lastPing)}>{server.lastPing}ms</span>
                          </Show>
                          <Show when={server.playerCount !== null}>
                            <span class="text-gray-400">👥 {server.playerCount}/{server.maxPlayers}</span>
                          </Show>
                          <Show when={server.version}>
                            <span class="text-gray-500">{server.version}</span>
                          </Show>
                        </div>
                      </div>
                      <Show when={server.online && server.playerCount !== null}>
                        <div class="text-right">
                          <div class="text-lg font-bold text-white">{server.playerCount}</div>
                          <div class="text-xs text-gray-500">players</div>
                        </div>
                      </Show>
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
            onClick={handleRemoveServer}
            disabled={!selectedServer()}
          >
            <div class="i-hugeicons:delete-02 h-4 w-4" />
            Remove
          </Button>
          <Button
            type="secondary"
            onClick={async () => {
              // Refresh all server statuses
              for (const server of serversQuery.data || []) {
                try {
                  await pingServerMutation.mutateAsync({
                    address: server.address,
                    port: server.port
                  })
                } catch {}
              }
            }}
          >
            <div class="i-hugeicons:refresh h-4 w-4" />
            Refresh All
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
            onClick={handleJoinServer}
            disabled={!selectedServer() || isJoining()}
            loading={isJoining()}
          >
            <div class="i-hugeicons:play h-4 w-4" />
            Join Server
          </Button>
        </div>
      </div>
    </ModalLayout>
  )
}

export default ServerBrowser
