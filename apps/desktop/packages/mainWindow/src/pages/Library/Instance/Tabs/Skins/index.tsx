import { Show, For, createSignal } from "solid-js"
import { Button, Input } from "@gd/ui"
import { useParams } from "@solidjs/router"
import { rspc } from "@/utils/rspcClient"
import { useModal } from "@/managers/ModalsManager"
import { Trans } from "@gd/i18n"

const SkinsTab = () => {
  const params = useParams()
  const instanceId = () => parseInt(params.id, 10)
  const modalsContext = useModal()
  
  const [selectedSkin, setSelectedSkin] = createSignal<string | null>(null)
  const [searchQuery, setSearchQuery] = createSignal("")
  
  // Featured skins (built-in)
  const featuredSkins = [
    { id: "steve", name: "Steve", isCustom: false },
    { id: "alex", name: "Alex", isCustom: false },
    { id: "noor", name: "Noor", isCustom: false },
    { id: "sunny", name: "Sunny", isCustom: false },
    { id: "ari", name: "Ari", isCustom: false },
    { id: "zuri", name: "Zuri", isCustom: false },
    { id: "makena", name: "Makena", isCustom: false },
    { id: "kai", name: "Kai", isCustom: false },
    { id: "efe", name: "Efe", isCustom: false },
  ]
  
  const instance = rspc.createQuery(() => ({
    queryKey: ["instance.getInstanceDetails", instanceId()],
    enabled: !isNaN(instanceId())
  }))

  const handleOpenSkinManager = () => {
    modalsContext?.openModal(
      { name: "offlineSkinManager" },
      { instanceId: instanceId() }
    )
  }

  const handleSelectSkin = (skinId: string) => {
    setSelectedSkin(skinId)
  }

  return (
    <div class="flex h-full flex-col gap-4 p-4">
      {/* Header */}
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-xl font-bold text-white">
            <Trans key="skins:_trn_title">Skins</Trans>
          </h2>
          <p class="text-sm text-gray-400">
            <Trans key="skins:_trn_description">Choose your in-game appearance</Trans>
          </p>
        </div>
        <Button
          type="primary"
          onClick={handleOpenSkinManager}
        >
          <div class="i-hugeicons:upload-01 mr-2" />
          <Trans key="skins:_trn_upload_skin">Upload Skin</Trans>
        </Button>
      </div>

      {/* Search */}
      <div class="w-full max-w-md">
        <Input
          placeholder="Search skins..."
          value={searchQuery()}
          onInput={(e) => setSearchQuery(e.currentTarget.value)}
          class="w-full"
        />
      </div>

      {/* Featured Skins */}
      <div class="mt-4">
        <h3 class="mb-3 text-lg font-semibold text-white">
          <Trans key="skins:_trn_featured">Featured Skins</Trans>
        </h3>
        <div class="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
          <For each={featuredSkins}>
            {(skin) => (
              <div
                class="group cursor-pointer rounded-lg border-2 border-transparent bg-darkSlate-700 p-2 transition-all hover:border-purple-500"
                classList={{
                  "border-purple-500": selectedSkin() === skin.id
                }}
                onClick={() => handleSelectSkin(skin.id)}
              >
                <div class="aspect-square overflow-hidden rounded-lg bg-darkSlate-800">
                  <div class="flex h-full w-full items-center justify-center">
                    <div class="i-hugeicons:user-circle h-16 w-16 text-gray-500" />
                  </div>
                </div>
                <p class="mt-2 text-center text-xs font-medium text-white">
                  {skin.name}
                </p>
              </div>
            )}
          </For>
        </div>
      </div>

      {/* Custom Skins */}
      <div class="mt-6">
        <h3 class="mb-3 text-lg font-semibold text-white">
          <Trans key="skins:_trn_custom">Custom Skins</Trans>
        </h3>
        <div class="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-600 py-12">
          <div class="i-hugeicons:image-add h-16 w-16 text-gray-500" />
          <p class="mt-4 text-gray-400">
            <Trans key="skins:_trn_no_custom">No custom skins yet</Trans>
          </p>
          <Button
            type="secondary"
            class="mt-4"
            onClick={handleOpenSkinManager}
          >
            <div class="i-hugeicons:upload-01 mr-2" />
            <Trans key="skins:_trn_add_custom">Add Custom Skin</Trans>
          </Button>
        </div>
      </div>

      {/* Info Box */}
      <div class="mt-4 rounded-lg bg-purple-900/20 border border-purple-500/30 p-4">
        <div class="flex items-start gap-3">
          <div class="i-hugeicons:information-circle text-xl text-purple-400" />
          <div>
            <h4 class="font-semibold text-purple-200">
              <Trans key="skins:_trn_info_title">Skin System</Trans>
            </h4>
            <p class="mt-1 text-sm text-purple-300/70">
              <Trans key="skins:_trn_info_desc">Upload your own skin or choose from featured options. Skins work in offline mode and on servers that allow custom skins.</Trans>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SkinsTab
