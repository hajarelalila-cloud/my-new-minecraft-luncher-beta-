import { createSignal, For, Show } from "solid-js"
import { Button, Input } from "@gd/ui"
import { useTransContext } from "@gd/i18n"

// Predefined tag colors
const TAG_COLORS = [
  { name: "Blue", value: "#3b82f6" },
  { name: "Green", value: "#22c55e" },
  { name: "Red", value: "#ef4444" },
  { name: "Yellow", value: "#eab308" },
  { name: "Purple", value: "#a855f7" },
  { name: "Pink", value: "#ec4899" },
  { name: "Orange", value: "#f97316" },
  { name: "Cyan", value: "#06b6d4" },
  { name: "White", value: "#ffffff" },
  { name: "Gray", value: "#6b7280" },
]

interface Tag {
  id: number
  name: string
  color: string
}

interface Props {
  tags: Tag[]
  selectedTags: number[]
  onTagSelect: (tagId: number) => void
  onTagCreate: (name: string, color: string) => void
  onTagDelete: (tagId: number) => void
  instanceTags?: number[]
  onInstanceTagAdd?: (tagId: number) => void
  onInstanceTagRemove?: (tagId: number) => void
}

const InstanceTags = (props: Props) => {
  const [t] = useTransContext()
  const [newTagName, setNewTagName] = createSignal("")
  const [selectedColor, setSelectedColor] = createSignal("#3b82f6")
  const [showCreateForm, setShowCreateForm] = createSignal(false)

  const handleCreateTag = () => {
    if (newTagName().trim()) {
      props.onTagCreate(newTagName().trim(), selectedColor())
      setNewTagName("")
      setShowCreateForm(false)
    }
  }

  return (
    <div class="flex flex-col gap-3">
      {/* Selected tags display */}
      <div class="flex flex-wrap gap-2">
        <For each={props.tags.filter(t => props.selectedTags.includes(t.id))}>
          {(tag) => (
            <div
              class="flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium transition-all duration-200 hover:scale-105"
              style={{
                "background-color": `${tag.color}20`,
                "border": `1px solid ${tag.color}`,
                color: tag.color,
              }}
            >
              <span>{tag.name}</span>
              <button
                class="hover:bg-white/20 rounded-full p-0.5 transition-colors"
                onClick={() => props.onTagSelect(tag.id)}
              >
                <div class="i-hugeicons:cancel-01 h-3 w-3" />
              </button>
            </div>
          )}
        </For>
      </div>

      {/* Tag selector */}
      <div class="flex items-center gap-2">
        <div class="relative">
          <select
            class="bg-darkSlate-700 border border-darkSlate-600 rounded-lg px-3 py-2 text-sm appearance-none pr-8 cursor-pointer hover:border-darkSlate-500 transition-colors"
            onChange={(e) => {
              const value = e.currentTarget.value
              if (value) {
                props.onTagSelect(parseInt(value))
              }
            }}
          >
            <option value="">Add Tag...</option>
            <For each={props.tags}>
              {(tag) => (
                <option value={tag.id}>{tag.name}</option>
              )}
            </For>
          </select>
          <div class="i-hugeicons:arrow-down-01 absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none text-darkSlate-400" />
        </div>

        <Button
          type="secondary"
          size="small"
          onClick={() => setShowCreateForm(!showCreateForm())}
        >
          <div class="i-hugeicons:add-circle h-4 w-4" />
          <span>New Tag</span>
        </Button>
      </div>

      {/* Create new tag form */}
      <Show when={showCreateForm()}>
        <div class="bg-darkSlate-700 flex flex-col gap-3 rounded-xl p-4">
          <div class="text-sm font-semibold">Create New Tag</div>
          
          <Input
            placeholder="Tag name..."
            value={newTagName()}
            onInput={(e) => setNewTagName(e.currentTarget.value)}
          />

          <div class="flex flex-wrap gap-2">
            <For each={TAG_COLORS}>
              {(color) => (
                <button
                  class="h-6 w-6 rounded-full transition-transform hover:scale-110"
                  style={{
                    "background-color": color.value,
                    "box-shadow": selectedColor() === color.value 
                      ? `0 0 0 2px ${color.value}40, 0 0 0 4px ${color.value}` 
                      : "none",
                  }}
                  onClick={() => setSelectedColor(color.value)}
                />
              )}
            </For>
          </div>

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
              onClick={handleCreateTag}
              disabled={!newTagName().trim()}
            >
              Create Tag
            </Button>
          </div>
        </div>
      </Show>
    </div>
  )
}

export default InstanceTags

// Tag badge component for displaying on instance cards
export const TagBadge = (props: { name: string; color: string; size?: "sm" | "md" }) => {
  const size = () => props.size || "md"
  
  return (
    <div
      class={`flex items-center gap-1 rounded-full font-medium transition-all duration-200 ${
        size() === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm"
      }`}
      style={{
        "background-color": `${props.color}20`,
        "border": `1px solid ${props.color}40`,
        color: props.color,
      }}
    >
      <div
        class={`rounded-full ${size() === "sm" ? "h-1.5 w-1.5" : "h-2 w-2"}`}
        style={{ "background-color": props.color }}
      />
      <span>{props.name}</span>
    </div>
  )
}

// Tag filter component for the library
export const TagFilter = (props: {
  tags: Tag[]
  selectedTag: number | null
  onTagSelect: (tagId: number | null) => void
}) => {
  const [t] = useTransContext()

  return (
    <div class="flex flex-wrap items-center gap-2">
      <button
        class={`rounded-full px-3 py-1 text-sm font-medium transition-all duration-200 ${
          props.selectedTag === null
            ? "bg-primary-500 text-white"
            : "bg-darkSlate-700 text-darkSlate-300 hover:bg-darkSlate-600"
        }`}
        onClick={() => props.onTagSelect(null)}
      >
        All
      </button>
      <For each={props.tags}>
        {(tag) => (
          <button
            class="rounded-full px-3 py-1 text-sm font-medium transition-all duration-200"
            style={{
              "background-color": props.selectedTag === tag.id 
                ? `${tag.color}40` 
                : "transparent",
              "border": `1px solid ${props.selectedTag === tag.id ? tag.color : "transparent"}`,
              color: props.selectedTag === tag.id ? tag.color : "#9ca3af",
            }}
            onClick={() => props.onTagSelect(tag.id)}
          >
            {tag.name}
          </button>
        )}
      </For>
    </div>
  )
}
