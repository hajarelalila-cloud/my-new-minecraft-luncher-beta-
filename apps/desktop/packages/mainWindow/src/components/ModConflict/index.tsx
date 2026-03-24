import { createSignal, For, Show } from "solid-js"
import { Button, Badge } from "@gd/ui"
import { useTransContext } from "@gd/i18n"

interface Conflict {
  mod1: {
    name: string
    id: string
    version?: string
  }
  mod2: {
    name: string
    id: string
    version?: string
  }
  severity: "critical" | "warning" | "info"
  reason: string
  suggestion?: string
}

interface Props {
  conflicts: Conflict[]
  onDisableMod: (modId: string) => void
  onIgnoreConflict: (conflictIndex: number) => void
  onViewModDetails: (modId: string) => void
}

const ModConflict = (props: Props) => {
  const [t] = useTransContext()
  const [expandedConflicts, setExpandedConflicts] = createSignal<number[]>([])
  const [ignoredConflicts, setIgnoredConflicts] = createSignal<number[]>([])

  const toggleExpand = (index: number) => {
    const expanded = expandedConflicts()
    if (expanded.includes(index)) {
      setExpandedConflicts(expanded.filter(i => i !== index))
    } else {
      setExpandedConflicts([...expanded, index])
    }
  }

  const handleIgnore = (index: number) => {
    setIgnoredConflicts([...ignoredConflicts(), index])
    props.onIgnoreConflict(index)
  }

  const getSeverityColor = (severity: Conflict["severity"]) => {
    switch (severity) {
      case "critical":
        return { bg: "bg-red-500/20", border: "border-red-500/50", icon: "text-red-400", badge: "error" }
      case "warning":
        return { bg: "bg-yellow-500/20", border: "border-yellow-500/50", icon: "text-yellow-400", badge: "warning" }
      case "info":
        return { bg: "bg-blue-500/20", border: "border-blue-500/50", icon: "text-blue-400", badge: "info" }
    }
  }

  const visibleConflicts = () => {
    return props.conflicts.filter((_, index) => !ignoredConflicts().includes(index))
  }

  return (
    <div class="flex flex-col gap-4">
      {/* Header */}
      <div class="flex items-center justify-between">
        <div>
          <h3 class="text-lg font-semibold">Mod Conflict Detection</h3>
          <p class="text-darkSlate-400 text-sm">
            Detect and resolve mod compatibility issues
          </p>
        </div>
        <Show when={ignoredConflicts().length > 0}>
          <Button
            type="secondary"
            size="small"
            onClick={() => setIgnoredConflicts([])}
          >
            <div class="i-hugeicons:refresh h-4 w-4" />
            <span>Reset Ignored</span>
          </Button>
        </Show>
      </div>

      {/* Summary */}
      <Show when={props.conflicts.length > 0}>
        <div class="flex gap-4">
          <div class="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-2">
            <span class="text-red-400 font-semibold">
              {props.conflicts.filter(c => c.severity === "critical").length}
            </span>
            <span class="text-darkSlate-400 text-sm ml-1">Critical</span>
          </div>
          <div class="bg-yellow-500/10 border border-yellow-500/30 rounded-lg px-4 py-2">
            <span class="text-yellow-400 font-semibold">
              {props.conflicts.filter(c => c.severity === "warning").length}
            </span>
            <span class="text-darkSlate-400 text-sm ml-1">Warnings</span>
          </div>
          <div class="bg-blue-500/10 border border-blue-500/30 rounded-lg px-4 py-2">
            <span class="text-blue-400 font-semibold">
              {props.conflicts.filter(c => c.severity === "info").length}
            </span>
            <span class="text-darkSlate-400 text-sm ml-1">Info</span>
          </div>
        </div>
      </Show>

      {/* Conflicts list */}
      <div class="flex flex-col gap-2">
        <For each={visibleConflicts()}>
          {(conflict, index) => {
            const colors = getSeverityColor(conflict.severity)
            
            return (
              <div class={`${colors.bg} border ${colors.border} rounded-xl overflow-hidden`}>
                {/* Conflict header */}
                <div
                  class="flex items-center gap-3 p-4 cursor-pointer"
                  onClick={() => toggleExpand(index())}
                >
                  <div class={`i-hugeicons:alert-02 h-5 w-5 ${colors.icon}`} />
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2">
                      <span class="font-medium truncate">{conflict.mod1.name}</span>
                      <div class="i-hugeicons:arrow-right-01 h-4 w-4 text-darkSlate-500" />
                      <span class="font-medium truncate">{conflict.mod2.name}</span>
                    </div>
                    <div class="text-darkSlate-400 text-sm truncate mt-0.5">
                      {conflict.reason}
                    </div>
                  </div>
                  <Badge type={colors.badge as "error" | "warning" | "info"} size="sm">
                    {conflict.severity}
                  </Badge>
                  <div
                    class={`i-hugeicons:arrow-down-01 h-4 w-4 transition-transform duration-200 ${
                      expandedConflicts().includes(index()) ? "rotate-180" : ""
                    }`}
                  />
                </div>

                {/* Expanded content */}
                <Show when={expandedConflicts().includes(index())}>
                  <div class="border-t border-darkSlate-600/50 p-4 bg-darkSlate-800/50">
                    <div class="grid grid-cols-2 gap-4 mb-4">
                      {/* Mod 1 */}
                      <div class="bg-darkSlate-700 rounded-lg p-3">
                        <div class="flex items-center gap-2 mb-2">
                          <div class="i-hugeicons:cube h-4 w-4 text-darkSlate-400" />
                          <span class="font-medium">{conflict.mod1.name}</span>
                        </div>
                        <Show when={conflict.mod1.version}>
                          <div class="text-xs text-darkSlate-400">v{conflict.mod1.version}</div>
                        </Show>
                        <Button
                          type="secondary"
                          size="small"
                          class="mt-2"
                          onClick={() => props.onViewModDetails(conflict.mod1.id)}
                        >
                          View Details
                        </Button>
                      </div>

                      {/* Mod 2 */}
                      <div class="bg-darkSlate-700 rounded-lg p-3">
                        <div class="flex items-center gap-2 mb-2">
                          <div class="i-hugeicons:cube h-4 w-4 text-darkSlate-400" />
                          <span class="font-medium">{conflict.mod2.name}</span>
                        </div>
                        <Show when={conflict.mod2.version}>
                          <div class="text-xs text-darkSlate-400">v{conflict.mod2.version}</div>
                        </Show>
                        <Button
                          type="secondary"
                          size="small"
                          class="mt-2"
                          onClick={() => props.onViewModDetails(conflict.mod2.id)}
                        >
                          View Details
                        </Button>
                      </div>
                    </div>

                    {/* Suggestion */}
                    <Show when={conflict.suggestion}>
                      <div class="bg-darkSlate-700/50 rounded-lg p-3 mb-4">
                        <div class="flex items-center gap-2 mb-1">
                          <div class="i-hugeicons:light-bulb h-4 w-4 text-yellow-400" />
                          <span class="text-sm font-medium">Suggestion</span>
                        </div>
                        <p class="text-sm text-darkSlate-300">{conflict.suggestion}</p>
                      </div>
                    </Show>

                    {/* Actions */}
                    <div class="flex gap-2">
                      <Button
                        type="danger"
                        size="small"
                        onClick={() => props.onDisableMod(conflict.mod1.id)}
                      >
                        Disable {conflict.mod1.name}
                      </Button>
                      <Button
                        type="danger"
                        size="small"
                        onClick={() => props.onDisableMod(conflict.mod2.id)}
                      >
                        Disable {conflict.mod2.name}
                      </Button>
                      <Button
                        type="secondary"
                        size="small"
                        onClick={() => handleIgnore(index())}
                      >
                        Ignore Warning
                      </Button>
                    </div>
                  </div>
                </Show>
              </div>
            )
          }}
        </For>

        <Show when={visibleConflicts().length === 0}>
          <div class="bg-green-500/10 border border-green-500/30 rounded-xl p-8 text-center">
            <div class="i-hugeicons:checkmark-circle-02 h-12 w-12 mx-auto mb-3 text-green-400" />
            <div class="text-green-300 font-medium">No Mod Conflicts Detected</div>
            <div class="text-darkSlate-400 text-sm mt-1">
              Your mod configuration appears to be compatible
            </div>
          </div>
        </Show>
      </div>
    </div>
  )
}

export default ModConflict
