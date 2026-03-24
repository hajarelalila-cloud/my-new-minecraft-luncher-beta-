import { createSignal, For, Show } from "solid-js"
import { Button, Input, Badge } from "@gd/ui"
import { useTransContext } from "@gd/i18n"

interface Server {
  id: number
  name: string
  address: string
  port: number
  icon?: string
  description?: string
  lastPlayed?: Date
  players?: {
    online: number
    max: number
  }
  status?: "online" | "offline" | "unknown"
  version?: string
}

interface Props {
  servers: Server[]
  activeInstanceId: number
  onAddServer: (server: { name: string; address: string; port: number }) => void
  onRemoveServer: (serverId: number) => void
  onRefreshServer: (serverId: number) => void
  onJoinServer: (serverId: number, instanceId: number) => void
  onEditServer: (serverId: number, data: Partial<Server>) => void
}

const ServerBrowser = (props: Props) => {
  const [t] = useTransContext()
  const [showAddForm, setShowAddForm] = createSignal(false)
  const [newServerName, setNewServerName] = createSignal("")
  const [newServerAddress, setNewServerAddress] = createSignal("")
  const [newServerPort, setNewServerPort] = createSignal("25565")
  const [refreshingServers, setRefreshingServers] = createSignal<number[]>([])
  const [selectedServer, setSelectedServer] = createSignal<number | null>(null)

  const handleAddServer = () => {
    if (newServerName().trim() && newServerAddress().trim()) {
      props.onAddServer({
        name: newServerName().trim(),
        address: newServerAddress().trim(),
        port: parseInt(newServerPort()) || 25565,
      })
      setNewServerName("")
      setNewServerAddress("")
      setNewServerPort("25565")
      setShowAddForm(false)
    }
  }

  const formatLastPlayed = (date?: Date) => {
    if (!date) return "Never"
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    
    if (days === 0) return "Today"
    if (days === 1) return "Yesterday"
    if (days < 7) return `${days} days ago`
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
    }).format(date)
  }

  const handleRefresh = (serverId: number) => {
    setRefreshingServers([...refreshingServers(), serverId])
    props.onRefreshServer(serverId)
    setTimeout(() => {
      setRefreshingServers(refreshingServers().filter(id => id !== serverId))
    }, 2000)
  }

  return (
    <div class="flex flex-col gap-4">
      {/* Header */}
      <div class="flex items-center justify-between">
        <div>
          <h3 class="text-lg font-semibold">Server Browser</h3>
          <p class="text-darkSlate-400 text-sm">
            Quick join your favorite servers
          </p>
        </div>
        <Button
          type="primary"
          size="small"
          onClick={() => setShowAddForm(!showAddForm())}
        >
          <div class="i-hugeicons:add-circle h-4 w-4" />
          <span>Add Server</span>
        </Button>
      </div>

      {/* Add server form */}
      <Show when={showAddForm()}>
        <div class="bg-darkSlate-700 rounded-xl p-4">
          <div class="text-sm font-medium mb-3">Add New Server</div>
          <div class="grid grid-cols-2 gap-3">
            <Input
              placeholder="Server name..."
              value={newServerName()}
              onInput={(e) => setNewServerName(e.currentTarget.value)}
            />
            <Input
              placeholder="Server address..."
              value={newServerAddress()}
              onInput={(e) => setNewServerAddress(e.currentTarget.value)}
            />
            <Input
              placeholder="Port..."
              value={newServerPort()}
              onInput={(e) => setNewServerPort(e.currentTarget.value)}
              type="number"
            />
            <div class="col-span-2 flex gap-2 justify-end">
              <Button
                type="secondary"
                size="small"
                onClick={() => setShowAddForm(false)}
              >
                Cancel
              </Button>
              <Button
                type="primary"
                size="small"
                onClick={handleAddServer}
                disabled={!newServerName().trim() || !newServerAddress().trim()}
              >
                Add Server
              </Button>
            </div>
          </div>
        </div>
      </Show>

      {/* Servers list */}
      <div class="grid grid-cols-1 gap-3">
        <For each={props.servers}>
          {(server) => (
            <div
              class={`bg-darkSlate-700 rounded-xl p-4 transition-all duration-200 cursor-pointer ${
                selectedServer() === server.id ? "ring-2 ring-primary-500" : "hover:bg-darkSlate-600"
              }`}
              onClick={() => setSelectedServer(server.id)}
            >
              <div class="flex items-start gap-4">
                {/* Server icon */}
                <div class="flex-shrink-0">
                  <Show when={server.icon} fallback={
                    <div class="h-12 w-12 rounded-lg bg-darkSlate-600 flex items-center justify-center">
                      <div class="i-hugeicons:server h-6 w-6 text-darkSlate-400" />
                    </div>
                  }>
                    <img
                      src={server.icon}
                      class="h-12 w-12 rounded-lg object-cover"
                      alt={server.name}
                    />
                  </Show>
                </div>

                {/* Server info */}
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2">
                    <span class="font-semibold truncate">{server.name}</span>
                    <Show when={server.status === "online"}>
                      <Badge type="success" size="sm">Online</Badge>
                    </Show>
                    <Show when={server.status === "offline"}>
                      <Badge type="error" size="sm">Offline</Badge>
                    </Show>
                  </div>
                  <div class="text-darkSlate-400 text-sm truncate">
                    {server.address}:{server.port}
                  </div>
                  <Show when={server.description}>
                    <div class="text-darkSlate-500 text-xs truncate mt-1">
                      {server.description}
                    </div>
                  </Show>
                </div>

                {/* Server stats */}
                <div class="flex flex-col items-end gap-1">
                  <Show when={server.players}>
                    <div class="flex items-center gap-1 text-sm">
                      <div class="i-hugeicons:people h-4 w-4 text-darkSlate-400" />
                      <span class="text-darkSlate-300">
                        {server.players!.online}/{server.players!.max}
                      </span>
                    </div>
                  </Show>
                  <Show when={server.version}>
                    <div class="text-xs text-darkSlate-400">
                      {server.version}
                    </div>
                  </Show>
                  <div class="text-xs text-darkSlate-500">
                    Last played: {formatLastPlayed(server.lastPlayed)}
                  </div>
                </div>

                {/* Actions */}
                <div class="flex gap-2">
                  <Button
                    type="secondary"
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleRefresh(server.id)
                    }}
                    disabled={refreshingServers().includes(server.id)}
                  >
                    <div class={`i-hugeicons:refresh h-4 w-4 ${refreshingServers().includes(server.id) ? "animate-spin" : ""}`} />
                  </Button>
                  <Button
                    type="primary"
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation()
                      props.onJoinServer(server.id, props.activeInstanceId)
                    }}
                    disabled={server.status === "offline"}
                  >
                    <div class="i-hugeicons:play h-4 w-4" />
                    <span>Join</span>
                  </Button>
                  <Button
                    type="danger"
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation()
                      props.onRemoveServer(server.id)
                    }}
                  >
                    <div class="i-hugeicons:delete-02 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </For>

        <Show when={props.servers.length === 0}>
          <div class="bg-darkSlate-700/50 rounded-xl p-8 text-center">
            <div class="i-hugeicons:server-01 h-12 w-12 mx-auto mb-3 text-darkSlate-500" />
            <div class="text-darkSlate-400">
              No servers added yet. Add your favorite servers for quick access.
            </div>
          </div>
        </Show>
      </div>

      {/* Direct connect */}
      <div class="bg-darkSlate-700/50 rounded-xl p-4">
        <div class="text-sm font-medium mb-2">Direct Connect</div>
        <div class="flex gap-2">
          <Input
            placeholder="Server address (e.g., mc.example.com:25565)"
            class="flex-1"
          />
          <Button type="primary">
            <div class="i-hugeicons:link-connect h-4 w-4" />
            <span>Connect</span>
          </Button>
        </div>
      </div>
    </div>
  )
}

export default ServerBrowser
