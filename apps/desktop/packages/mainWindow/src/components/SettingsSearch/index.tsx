import { createSignal, For, Show, createMemo } from "solid-js"
import { Input, Badge } from "@gd/ui"
import { useTransContext } from "@gd/i18n"
import { useGDNavigate } from "@/managers/NavigationManager"

interface SettingsItem {
  id: string
  title: string
  description?: string
  keywords: string[]
  category: string
  path: string
  icon?: string
}

interface Props {
  onNavigate?: (path: string) => void
}

const SETTINGS_ITEMS: SettingsItem[] = [
  // General
  {
    id: "release-channel",
    title: "Release Channel",
    description: "Choose between stable, beta, or alpha releases",
    keywords: ["release", "channel", "stable", "beta", "alpha", "version"],
    category: "General",
    path: "/settings",
    icon: "i-hugeicons:git-branch",
  },
  {
    id: "concurrent-downloads",
    title: "Concurrent Downloads",
    description: "Number of simultaneous downloads",
    keywords: ["download", "concurrent", "speed", "parallel"],
    category: "General",
    path: "/settings",
    icon: "i-hugeicons:download-01",
  },
  {
    id: "game-resolution",
    title: "Game Resolution",
    description: "Set the Minecraft window resolution",
    keywords: ["resolution", "screen", "window", "size", "width", "height"],
    category: "General",
    path: "/settings",
    icon: "i-hugeicons:monitor",
  },
  {
    id: "discord-integration",
    title: "Discord Integration",
    description: "Show your Minecraft activity on Discord",
    keywords: ["discord", "rpc", "rich", "presence", "status"],
    category: "General",
    path: "/settings",
    icon: "i-hugeicons:discord",
  },
  {
    id: "potato-mode",
    title: "Potato Mode",
    description: "Reduce animations for better performance on older PCs",
    keywords: ["potato", "performance", "animations", "motion", "slow", "old"],
    category: "General",
    path: "/settings",
    icon: "i-hugeicons:lightning",
  },
  // Accounts
  {
    id: "accounts",
    title: "Accounts",
    description: "Manage your Minecraft accounts",
    keywords: ["account", "login", "microsoft", "offline", "premium"],
    category: "Accounts",
    path: "/settings/accounts",
    icon: "i-hugeicons:user-profile",
  },
  {
    id: "add-account",
    title: "Add Account",
    description: "Add a new Minecraft or offline account",
    keywords: ["add", "new", "account", "login", "sign in"],
    category: "Accounts",
    path: "/settings/accounts",
    icon: "i-hugeicons:user-add-01",
  },
  // Appearance
  {
    id: "theme",
    title: "Theme",
    description: "Change the launcher appearance and colors",
    keywords: ["theme", "appearance", "colors", "dark", "light", "aether", "frost", "inferno"],
    category: "Appearance",
    path: "/settings/appearance",
    icon: "i-hugeicons:paint-brush-01",
  },
  {
    id: "language",
    title: "Language",
    description: "Select the launcher language",
    keywords: ["language", "locale", "translation", "english", "spanish", "japanese"],
    category: "Language",
    path: "/settings/language",
    icon: "i-hugeicons:translate",
  },
  // Java
  {
    id: "java-settings",
    title: "Java Settings",
    description: "Manage Java installations and memory settings",
    keywords: ["java", "jdk", "jvm", "memory", "ram", "heap"],
    category: "Java",
    path: "/settings/java",
    icon: "i-hugeicons:java",
  },
  {
    id: "java-memory",
    title: "Java Memory",
    description: "Allocate memory for Minecraft",
    keywords: ["memory", "ram", "xmx", "xms", "heap", "allocate"],
    category: "Java",
    path: "/settings/java",
    icon: "i-hugeicons:ram",
  },
  {
    id: "java-arguments",
    title: "Java Arguments",
    description: "Custom JVM arguments for launching Minecraft",
    keywords: ["java", "arguments", "jvm", "flags", "custom", "args"],
    category: "Java",
    path: "/settings/java",
    icon: "i-hugeicons:code",
  },
  // Custom Commands
  {
    id: "custom-commands",
    title: "Custom Commands",
    description: "Run custom scripts before or after launching Minecraft",
    keywords: ["command", "script", "hook", "pre-launch", "post-exit", "wrapper"],
    category: "Custom Commands",
    path: "/settings/custom-commands",
    icon: "i-hugeicons:terminal",
  },
  // Privacy
  {
    id: "privacy",
    title: "Privacy Settings",
    description: "Manage data collection and privacy options",
    keywords: ["privacy", "data", "tracking", "analytics", "consent"],
    category: "Privacy",
    path: "/settings/privacy",
    icon: "i-hugeicons:shield-01",
  },
  // Instance specific
  {
    id: "instance-settings",
    title: "Instance Settings",
    description: "Configure individual instance settings",
    keywords: ["instance", "settings", "memory", "java", "resolution"],
    category: "Instances",
    path: "/library",
    icon: "i-hugeicons:settings-02",
  },
  {
    id: "mod-profiles",
    title: "Mod Profiles",
    description: "Save and switch between mod configurations",
    keywords: ["mod", "profile", "loadout", "configuration", "preset"],
    category: "Instances",
    path: "/library",
    icon: "i-hugeicons:folder-favourite",
  },
  {
    id: "instance-backup",
    title: "Instance Backup",
    description: "Create and restore instance backups",
    keywords: ["backup", "restore", "snapshot", "save", "instance"],
    category: "Instances",
    path: "/library",
    icon: "i-hugeicons:database-sync",
  },
]

const SettingsSearch = (props: Props) => {
  const [t] = useTransContext()
  const [searchQuery, setSearchQuery] = createSignal("")
  const [selectedIndex, setSelectedIndex] = createSignal(0)
  const navigate = useGDNavigate()

  const filteredItems = createMemo(() => {
    const query = searchQuery().toLowerCase().trim()
    if (!query) return []

    return SETTINGS_ITEMS.filter(item => {
      const titleMatch = item.title.toLowerCase().includes(query)
      const descMatch = item.description?.toLowerCase().includes(query)
      const keywordMatch = item.keywords.some(k => k.includes(query))
      const categoryMatch = item.category.toLowerCase().includes(query)
      
      return titleMatch || descMatch || keywordMatch || categoryMatch
    })
  })

  const categories = createMemo(() => {
    const cats = new Map<string, SettingsItem[]>()
    filteredItems().forEach(item => {
      if (!cats.has(item.category)) {
        cats.set(item.category, [])
      }
      cats.get(item.category)!.push(item)
    })
    return cats
  })

  const handleSelect = (item: SettingsItem) => {
    navigate.navigate(item.path)
    if (props.onNavigate) {
      props.onNavigate(item.path)
    }
  }

  return (
    <div class="relative w-full">
      {/* Search input */}
      <div class="relative">
        <div class="i-hugeicons:search-01 absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-darkSlate-400" />
        <Input
          placeholder="Search settings..."
          class="w-full pl-10"
          value={searchQuery()}
          onInput={(e) => {
            setSearchQuery(e.currentTarget.value)
            setSelectedIndex(0)
          }}
        />
        <Show when={searchQuery()}>
          <button
            class="absolute right-3 top-1/2 -translate-y-1/2 text-darkSlate-400 hover:text-darkSlate-200 transition-colors"
            onClick={() => setSearchQuery("")}
          >
            <div class="i-hugeicons:cancel-01 h-4 w-4" />
          </button>
        </Show>
      </div>

      {/* Search results dropdown */}
      <Show when={searchQuery() && filteredItems().length > 0}>
        <div class="absolute top-full left-0 right-0 mt-2 bg-darkSlate-700 rounded-xl shadow-xl overflow-hidden z-50 max-h-96 overflow-y-auto">
          <For each={Array.from(categories().entries())}>
            {([category, items]) => (
              <div>
                <div class="px-4 py-2 bg-darkSlate-800 text-xs font-semibold uppercase text-darkSlate-400">
                  {category}
                </div>
                <For each={items}>
                  {(item, index) => (
                    <button
                      class={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                        selectedIndex() === index() 
                          ? "bg-primary-500/20" 
                          : "hover:bg-darkSlate-600"
                      }`}
                      onClick={() => handleSelect(item)}
                      onMouseEnter={() => setSelectedIndex(index())}
                    >
                      <div class={`${item.icon} h-5 w-5 text-darkSlate-400 flex-shrink-0`} />
                      <div class="flex-1 min-w-0">
                        <div class="font-medium truncate">{item.title}</div>
                        <Show when={item.description}>
                          <div class="text-xs text-darkSlate-400 truncate">
                            {item.description}
                          </div>
                        </Show>
                      </div>
                      <div class="i-hugeicons:arrow-right-01 h-4 w-4 text-darkSlate-500 flex-shrink-0" />
                    </button>
                  )}
                </For>
              </div>
            )}
          </For>
        </div>
      </Show>

      {/* No results */}
      <Show when={searchQuery() && filteredItems().length === 0}>
        <div class="absolute top-full left-0 right-0 mt-2 bg-darkSlate-700 rounded-xl shadow-xl overflow-hidden z-50 p-8 text-center">
          <div class="i-hugeicons:search-01 h-12 w-12 mx-auto mb-3 text-darkSlate-500" />
          <div class="text-darkSlate-400">
            No settings found for "{searchQuery()}"
          </div>
          <div class="text-darkSlate-500 text-sm mt-1">
            Try searching with different keywords
          </div>
        </div>
      </Show>

      {/* Quick tips */}
      <Show when={!searchQuery()}>
        <div class="text-darkSlate-500 text-xs mt-2 flex items-center gap-2">
          <div class="i-hugeicons:light-bulb h-3 w-3" />
          <span>Try: theme, java, memory, accounts, backup</span>
        </div>
      </Show>
    </div>
  )
}

export default SettingsSearch
