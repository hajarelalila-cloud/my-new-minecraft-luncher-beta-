import { createSignal, For, Show } from "solid-js"
import { Button, Input, Badge } from "@gd/ui"
import { useTransContext } from "@gd/i18n"

interface Mod {
  id: string
  name: string
  enabled: boolean
  filename: string
}

interface Profile {
  id: number
  name: string
  description?: string
  mods: Mod[]
  createdAt: Date
  updatedAt: Date
}

interface Props {
  profiles: Profile[]
  currentMods: Mod[]
  activeProfile: number | null
  onCreateProfile: (name: string, description?: string) => void
  onLoadProfile: (profileId: number) => void
  onDeleteProfile: (profileId: number) => void
  onUpdateProfile: (profileId: number, mods: Mod[]) => void
}

const ModProfiles = (props: Props) => {
  const [t] = useTransContext()
  const [showCreateForm, setShowCreateForm] = createSignal(false)
  const [newProfileName, setNewProfileName] = createSignal("")
  const [newProfileDesc, setNewProfileDesc] = createSignal("")
  const [expandedProfile, setExpandedProfile] = createSignal<number | null>(null)

  const handleCreateProfile = () => {
    if (newProfileName().trim()) {
      props.onCreateProfile(newProfileName().trim(), newProfileDesc().trim() || undefined)
      setNewProfileName("")
      setNewProfileDesc("")
      setShowCreateForm(false)
    }
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
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
          <h3 class="text-lg font-semibold">Mod Profiles</h3>
          <p class="text-darkSlate-400 text-sm">
            Save and switch between different mod configurations
          </p>
        </div>
        <Button
          type="primary"
          size="small"
          onClick={() => setShowCreateForm(!showCreateForm())}
        >
          <div class="i-hugeicons:folder-add h-4 w-4" />
          <span>New Profile</span>
        </Button>
      </div>

      {/* Create profile form */}
      <Show when={showCreateForm()}>
        <div class="bg-darkSlate-700 rounded-xl p-4">
          <div class="text-sm font-medium mb-3">Create New Profile</div>
          <div class="flex flex-col gap-3">
            <Input
              placeholder="Profile name..."
              value={newProfileName()}
              onInput={(e) => setNewProfileName(e.currentTarget.value)}
            />
            <Input
              placeholder="Description (optional)..."
              value={newProfileDesc()}
              onInput={(e) => setNewProfileDesc(e.currentTarget.value)}
            />
            <div class="text-darkSlate-400 text-xs">
              This will save your current mod configuration ({props.currentMods.length} mods)
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
                onClick={handleCreateProfile}
                disabled={!newProfileName().trim()}
              >
                Create Profile
              </Button>
            </div>
          </div>
        </div>
      </Show>

      {/* Active profile indicator */}
      <Show when={props.activeProfile}>
        <div class="bg-primary-500/10 border border-primary-500/30 rounded-xl p-3">
          <div class="flex items-center gap-2">
            <div class="i-hugeicons:checkmark-circle-02 h-5 w-5 text-primary-400" />
            <span class="text-sm">
              Active: <span class="font-semibold">
                {props.profiles.find(p => p.id === props.activeProfile)?.name}
              </span>
            </span>
          </div>
        </div>
      </Show>

      {/* Profiles list */}
      <div class="flex flex-col gap-2">
        <For each={props.profiles}>
          {(profile) => (
            <div class="bg-darkSlate-700 rounded-xl overflow-hidden">
              {/* Profile header */}
              <div
                class="flex items-center gap-3 p-4 cursor-pointer hover:bg-darkSlate-600/50 transition-colors"
                onClick={() => setExpandedProfile(
                  expandedProfile() === profile.id ? null : profile.id
                )}
              >
                <div
                  class={`i-hugeicons:arrow-right-01 h-4 w-4 transition-transform duration-200 ${
                    expandedProfile() === profile.id ? "rotate-90" : ""
                  }`}
                />
                <div class="flex-1">
                  <div class="flex items-center gap-2">
                    <span class="font-medium">{profile.name}</span>
                    <Show when={props.activeProfile === profile.id}>
                      <Badge type="success" size="sm">Active</Badge>
                    </Show>
                  </div>
                  <Show when={profile.description}>
                    <div class="text-darkSlate-400 text-sm">{profile.description}</div>
                  </Show>
                </div>
                <div class="text-darkSlate-400 text-xs">
                  {profile.mods.length} mods
                </div>
              </div>

              {/* Expanded content */}
              <Show when={expandedProfile() === profile.id}>
                <div class="border-t border-darkSlate-600 p-4">
                  {/* Mod list */}
                  <div class="max-h-48 overflow-y-auto mb-4">
                    <For each={profile.mods}>
                      {(mod) => (
                        <div class="flex items-center gap-3 py-2 border-b border-darkSlate-600/50 last:border-0">
                          <div
                            class={`h-2 w-2 rounded-full ${
                              mod.enabled ? "bg-green-400" : "bg-red-400"
                            }`}
                          />
                          <span class="flex-1 text-sm truncate">{mod.name}</span>
                          <span class="text-darkSlate-400 text-xs">{mod.filename}</span>
                        </div>
                      )}
                    </For>
                  </div>

                  {/* Meta info */}
                  <div class="text-darkSlate-400 text-xs mb-4">
                    Created: {formatDate(profile.createdAt)} - Updated: {formatDate(profile.updatedAt)}
                  </div>

                  {/* Actions */}
                  <div class="flex gap-2">
                    <Button
                      type="primary"
                      size="small"
                      onClick={() => props.onLoadProfile(profile.id)}
                      disabled={props.activeProfile === profile.id}
                    >
                      <div class="i-hugeicons:play h-4 w-4" />
                      <span>Load Profile</span>
                    </Button>
                    <Button
                      type="secondary"
                      size="small"
                      onClick={() => props.onUpdateProfile(profile.id, props.currentMods)}
                    >
                      <div class="i-hugeicons:refresh h-4 w-4" />
                      <span>Update</span>
                    </Button>
                    <Button
                      type="danger"
                      size="small"
                      onClick={() => props.onDeleteProfile(profile.id)}
                    >
                      <div class="i-hugeicons:delete-02 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Show>
            </div>
          )}
        </For>

        <Show when={props.profiles.length === 0}>
          <div class="bg-darkSlate-700/50 rounded-xl p-8 text-center">
            <div class="i-hugeicons:folder-open h-12 w-12 mx-auto mb-3 text-darkSlate-500" />
            <div class="text-darkSlate-400">
              No mod profiles yet. Create one to save your current mod configuration.
            </div>
          </div>
        </Show>
      </div>
    </div>
  )
}

export default ModProfiles
