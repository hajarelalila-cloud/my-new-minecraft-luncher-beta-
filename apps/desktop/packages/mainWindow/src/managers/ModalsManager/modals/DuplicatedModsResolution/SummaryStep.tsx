import { Button } from "@gd/ui"
import { For, Show } from "solid-js"
import { DuplicatedMod } from "./ModSelectionStep"
import { DuplicateAction } from "./ActionStep"
import { Trans } from "@gd/i18n"
import { getModImageUrl } from "@/utils/instances"

interface Props {
  mods: DuplicatedMod[]
  selectedVersions: Record<string, string>
  action: DuplicateAction
  prevStep: () => void
  onFinish: () => void
  isApplying: boolean
  instanceId: number
}

const SummaryStep = (props: Props) => {
  const getSelectedVersion = (mod: DuplicatedMod) => {
    const selectedId = props.selectedVersions[mod.name]
    return mod.versions.find((v) => v.id === selectedId)
  }

  const getUnselectedVersions = (mod: DuplicatedMod) => {
    const selectedId = props.selectedVersions[mod.name]
    return mod.versions.filter((v) => v.id !== selectedId)
  }

  return (
    <div class="flex flex-col h-full">
      {/* Fixed Header - won't scroll */}
      <div class="flex-shrink-0 flex flex-col gap-4">
        <div class="flex items-center gap-3 mb-2">
          <div class="i-hugeicons:checkmark-badge-01 text-green-500 text-3xl" />
          <h2 class="text-xl font-bold m-0">
            <Trans key="instance.duplicates.summary.title" />
          </h2>
        </div>

        <p class="text-lightSlate-700 text-sm leading-6">
          <Trans key="instance.duplicates.summary.description" />
        </p>

        <div class="bg-darkSlate-600 rounded-lg p-4 mb-2">
          <div class="flex items-center gap-2 mb-3">
            <div class="i-hugeicons:information-circle text-primary-500" />
            <h3 class="text-sm font-semibold m-0">
              <Trans key="instance.duplicates.summary.action_title" />
            </h3>
          </div>
          <p class="text-sm text-lightSlate-700 m-0 ml-6">
            <Show
              when={props.action === "disable"}
              fallback={
                <Trans key="instance.duplicates.summary.action_remove" />
              }
            >
              <Trans key="instance.duplicates.summary.action_disable" />
            </Show>
          </p>
        </div>
      </div>

      {/* Scrollable Content - only this section scrolls */}
      <div class="flex-1 overflow-y-auto overflow-x-hidden pr-2 mt-2">
        <div class="flex flex-col gap-3">
          <For each={props.mods}>
            {(mod) => (
              <div class="border border-darkSlate-500 rounded-lg p-4 bg-darkSlate-700">
                <div class="flex items-start gap-3 mb-3">
                  <Show
                    when={mod.modId && mod.platform}
                    fallback={
                      <div class="w-10 h-10 rounded-lg bg-darkSlate-600 flex items-center justify-center">
                        <div class="i-hugeicons:puzzle text-xl text-darkSlate-400" />
                      </div>
                    }
                  >
                    <img
                      src={getModImageUrl(
                        props.instanceId.toString(),
                        mod.modId!,
                        mod.platform!
                      )}
                      alt={mod.name}
                      class="w-10 h-10 rounded-lg"
                    />
                  </Show>
                  <div class="flex-1">
                    <h4 class="font-semibold text-sm m-0 mb-1">{mod.name}</h4>

                    <Show when={getSelectedVersion(mod)}>
                      {(version) => (
                        <div class="bg-darkSlate-800 rounded p-2 mb-2">
                          <div class="flex items-center gap-2 text-xs">
                            <div class="i-hugeicons:tick-02 text-green-500" />
                            <span class="text-green-400">
                              <Trans key="instance.duplicates.summary.status_keep" />
                            </span>
                            <span class="text-lightSlate-500">
                              {version().fileName}
                            </span>
                          </div>
                        </div>
                      )}
                    </Show>

                    <div class="space-y-1">
                      <For each={getUnselectedVersions(mod)}>
                        {(version) => (
                          <div class="flex items-center gap-2 text-xs text-lightSlate-600">
                            <div
                              class="text-sm"
                              classList={{
                                "i-hugeicons:view-off-slash text-yellow-500":
                                  props.action === "disable",
                                "i-hugeicons:delete-02 text-red-500":
                                  props.action === "remove"
                              }}
                            />
                            <span
                              classList={{
                                "text-yellow-400": props.action === "disable",
                                "text-red-400": props.action === "remove"
                              }}
                            >
                              <Show
                                when={props.action === "disable"}
                                fallback={
                                  <Trans key="instance.duplicates.summary.status_remove" />
                                }
                              >
                                <Trans key="instance.duplicates.summary.status_disable" />
                              </Show>
                            </span>
                            <span>{version.fileName}</span>
                          </div>
                        )}
                      </For>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </For>
        </div>
      </div>

      {/* Fixed Footer - won't scroll */}
      <div class="flex-shrink-0 flex justify-between mt-6">
        <Button
          type="secondary"
          size="large"
          onClick={() => props.prevStep()}
          disabled={props.isApplying}
        >
          <Trans key="instance.duplicates.summary.button_back" />
        </Button>
        <Button
          type="primary"
          size="large"
          onClick={() => props.onFinish()}
          loading={props.isApplying}
          disabled={props.isApplying}
        >
          <Trans key="instance.duplicates.summary.button_apply" />
        </Button>
      </div>
    </div>
  )
}

export default SummaryStep
