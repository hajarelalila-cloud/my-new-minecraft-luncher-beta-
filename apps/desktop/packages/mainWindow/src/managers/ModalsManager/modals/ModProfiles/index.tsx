import { ModalProps } from "../../"
import ModalLayout from "../../ModalLayout"
import { Trans } from "@gd/i18n"
import { createSignal, For, Show } from "solid-js"
import { Button, Spinner } from "@gd/ui"
import { rspc } from "@/utils/rspcClient"
import { format } from "date-fns"

interface ModProfilesProps extends ModalProps {
  instanceId: number
  instanceName: string
}

const ModProfiles = (props: ModProfilesProps) => {
  const [profileName, setProfileName] = createSignal("")
  const [profileDescription, setProfileDescription] = createSignal("")
  const [isCreating, setIsCreating] = createSignal(false)
  const [isSwitching, setIsSwitching] = createSignal(false)
  const [isDeleting, setIsDeleting] = createSignal(false)
  const [selectedProfile, setSelectedProfile] = createSignal<number | null>(null)
  const [error, setError] = createSignal<string | null>(null)
  const [success, setSuccess] = createSignal<string | null>(null)

  // Query for existing profiles
  const profilesQuery = rspc.createQuery(() => ({
    queryKey: ["instance.getModProfiles", props.instanceId]
  }))

  // Query for current mods
  const currentModsQuery = rspc.createQuery(() => ({
    queryKey: ["instance.getInstanceMods", props.instanceId]
  }))

  // Mutations
  const createProfileMutation = rspc.createMutation(() => ({
    mutationKey: ["instance.createModProfile"]
  }))

  const switchProfileMutation = rspc.createMutation(() => ({
    mutationKey: ["instance.switchModProfile"]
  }))

  const deleteProfileMutation = rspc.createMutation(() => ({
    mutationKey: ["instance.deleteModProfile"]
  }))

  const handleCreateProfile = async () => {
    if (!profileName().trim()) {
      setError("Please enter a profile name")
      return
    }

    setIsCreating(true)
    setError(null)
    setSuccess(null)

    try {
      // Get current mod states
      const mods = currentModsQuery.data || []
      const modStates = mods.map(mod => ({
        modId: mod.id,
        modName: mod.filename,
        enabled: mod.enabled
      }))

      await createProfileMutation.mutateAsync({
        instanceId: props.instanceId,
        name: profileName(),
        description: profileDescription() || undefined,
        mods: modStates
      })
      setSuccess("Profile created successfully!")
      setProfileName("")
      setProfileDescription("")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create profile")
    } finally {
      setIsCreating(false)
    }
  }

  const handleSwitchProfile = async () => {
    const profileId = selectedProfile()
    if (!profileId) {
      setError("Please select a profile to switch to")
      return
    }

    setIsSwitching(true)
    setError(null)
    setSuccess(null)

    try {
      await switchProfileMutation.mutateAsync({
        instanceId: props.instanceId,
        profileId
      })
      setSuccess("Profile switched successfully! Mod states have been updated.")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to switch profile")
    } finally {
      setIsSwitching(false)
    }
  }

  const handleDeleteProfile = async () => {
    const profileId = selectedProfile()
    if (!profileId) {
      setError("Please select a profile to delete")
      return
    }

    setIsDeleting(true)
    setError(null)
    setSuccess(null)

    try {
      await deleteProfileMutation.mutateAsync({
        instanceId: props.instanceId,
        profileId
      })
      setSuccess("Profile deleted successfully!")
      setSelectedProfile(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete profile")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <ModalLayout
      title={`Mod Profiles - ${props.instanceName}`}
      height="h-[600px] max-h-[90vh]"
      width="w-[600px] max-w-[95vw]"
    >
      <div class="flex flex-col gap-6 p-6 h-full overflow-hidden">
        {/* Info Banner */}
        <div class="rounded-lg bg-blue-500/10 border border-blue-500/20 p-4">
          <div class="flex gap-3">
            <div class="i-hugeicons:information-circle text-blue-400 h-5 w-5 flex-shrink-0 mt-0.5" />
            <p class="text-sm text-blue-200">
              Mod profiles let you save and switch between different mod configurations. 
              Create a profile to save the current mod states, then switch between profiles anytime.
            </p>
          </div>
        </div>

        {/* Create Profile Section */}
        <div class="rounded-xl bg-darkSlate-700/50 border border-darkSlate-600 p-4">
          <h3 class="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <div class="i-hugeicons:plus-circle h-5 w-5 text-green-400" />
            Create Profile from Current Mods
          </h3>
          <div class="flex flex-col gap-3">
            <input
              type="text"
              placeholder="Profile name..."
              value={profileName()}
              onInput={(e) => setProfileName(e.currentTarget.value)}
              class="w-full rounded-lg border border-darkSlate-600 bg-darkSlate-800 px-4 py-2 text-white placeholder-gray-500 focus:border-green-500 focus:outline-none"
            />
            <textarea
              placeholder="Description (optional)..."
              value={profileDescription()}
              onInput={(e) => setProfileDescription(e.currentTarget.value)}
              class="w-full rounded-lg border border-darkSlate-600 bg-darkSlate-800 px-4 py-2 text-white placeholder-gray-500 focus:border-green-500 focus:outline-none resize-none h-20"
            />
            <Button
              type="primary"
              onClick={handleCreateProfile}
              loading={isCreating()}
              disabled={!profileName().trim() || isCreating()}
            >
              <div class="i-hugeicons:save h-4 w-4" />
              Save Current Mod Configuration
            </Button>
          </div>
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

        {/* Existing Profiles */}
        <div class="flex-1 flex flex-col min-h-0">
          <h3 class="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <div class="i-hugeicons:layer h-5 w-5 text-purple-400" />
            Saved Profiles
          </h3>
          
          <Show when={profilesQuery.isLoading}>
            <div class="flex items-center justify-center py-8">
              <Spinner class="h-8 w-8" />
            </div>
          </Show>

          <Show when={!profilesQuery.isLoading && profilesQuery.data?.length === 0}>
            <div class="flex flex-col items-center justify-center py-8 text-gray-500">
              <div class="i-hugeicons:layers h-12 w-12 mb-4" />
              <p>No profiles yet</p>
              <p class="text-sm">Save your current mod configuration above</p>
            </div>
          </Show>

          <Show when={!profilesQuery.isLoading && profilesQuery.data && profilesQuery.data.length > 0}>
            <div class="flex-1 overflow-y-auto rounded-lg border border-darkSlate-600 bg-darkSlate-800/50">
              <div class="divide-y divide-darkSlate-600">
                <For each={profilesQuery.data}>
                  {(profile) => (
                    <div
                      class={`flex items-center gap-4 p-4 cursor-pointer hover:bg-darkSlate-700/50 transition-colors ${
                        selectedProfile() === profile.id ? "bg-green-500/10 border-l-4 border-l-green-500" : ""
                      }`}
                      onClick={() => setSelectedProfile(profile.id)}
                    >
                      <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/20">
                        <div class="i-hugeicons:layer h-5 w-5 text-green-400" />
                      </div>
                      <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-2">
                          <span class="font-medium text-white truncate">{profile.name}</span>
                          <span class="text-xs text-gray-500 bg-darkSlate-600 px-2 py-0.5 rounded">
                            {profile.modCount || 0} mods
                          </span>
                        </div>
                        <div class="text-xs text-gray-400">
                          Created {format(new Date(profile.createdAt), "MMM d, yyyy")}
                        </div>
                        <Show when={profile.description}>
                          <p class="text-xs text-gray-500 mt-1 truncate">{profile.description}</p>
                        </Show>
                      </div>
                      <div class="i-hugeicons:checkmark-circle-02 h-5 w-5 text-green-400" 
                           classList={{ "opacity-0": selectedProfile() !== profile.id, "opacity-100": selectedProfile() === profile.id }} 
                      />
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
            onClick={handleDeleteProfile}
            disabled={!selectedProfile() || isDeleting()}
            loading={isDeleting()}
          >
            <div class="i-hugeicons:delete-02 h-4 w-4" />
            Delete
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
            onClick={handleSwitchProfile}
            disabled={!selectedProfile() || isSwitching()}
            loading={isSwitching()}
          >
            <div class="i-hugeicons:refresh h-4 w-4" />
            Switch to Profile
          </Button>
        </div>
      </div>
    </ModalLayout>
  )
}

export default ModProfiles
