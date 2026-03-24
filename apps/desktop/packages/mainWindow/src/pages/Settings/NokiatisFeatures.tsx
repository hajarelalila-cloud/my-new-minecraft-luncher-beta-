import {
  Button,
  Switch,
  Input
} from "@gd/ui"
import { Trans, useTransContext } from "@gd/i18n"
import { rspc } from "@/utils/rspcClient"
import SettingsData from "./settings.general.data"
import { useRouteData } from "@solidjs/router"
import { Show, createEffect, For } from "solid-js"
import { createStore } from "solid-js/store"
import { FESettings } from "@gd/core_module/bindings"
import Row from "./components/Row"
import RightHandSide from "./components/RightHandSide"
import PageTitle from "./components/PageTitle"
import Title from "./components/Title"
import RowsContainer from "./components/RowsContainer"
import SettingsImportExport from "@/components/SettingsImportExport"
import { createSignal } from "solid-js"

const NokiatisFeatures = () => {
  const routeData: ReturnType<typeof SettingsData> = useRouteData()
  const [t] = useTransContext()

  const [settings, setSettings] = createStore<FESettings>(
    // @ts-ignore
    routeData?.data?.data || {}
  )

  const settingsMutation = rspc.createMutation(() => ({
    mutationKey: ["settings.setSettings"]
  }))

  createEffect(() => {
    if (routeData.data.data) setSettings(routeData.data.data)
  })

  // Mock data for components demo
  const [settingsBackups] = createSignal([
    { id: 1, name: "Pre-update backup", description: "Before v2.0.0 update", createdAt: new Date(), size: 2048 },
    { id: 2, name: "Clean settings", description: "Fresh install backup", createdAt: new Date(Date.now() - 86400000), size: 1536 },
  ])

  const [isExporting, setIsExporting] = createSignal(false)
  const [isImporting, setIsImporting] = createSignal(false)
  const [exportProgress, setExportProgress] = createSignal(0)
  const [importProgress, setImportProgress] = createSignal(0)

  return (
    <>
      <PageTitle>
        <Trans key="settings:_trn_nokiatis_features" />
      </PageTitle>
      <RowsContainer>
        {/* Welcome Screen */}
        <Row>
          <Title
            description={<Trans key="settings:_trn_show_welcome_text" />}
          >
            <Trans key="settings:_trn_show_welcome_title" />
          </Title>
          <RightHandSide>
            <Switch
              checked={settings.showNokiatisWelcome}
              onChange={(e) => {
                settingsMutation.mutate({
                  showNokiatisWelcome: {
                    Set: e.currentTarget.checked
                  }
                })
              }}
            />
          </RightHandSide>
        </Row>

        {/* Offline Mode */}
        <Row>
          <Title
            description={<Trans key="settings:_trn_offline_mode_text" />}
          >
            <Trans key="settings:_trn_offline_mode_title" />
          </Title>
          <RightHandSide>
            <Switch
              checked={settings.enableOfflineMode}
              onChange={(e) => {
                settingsMutation.mutate({
                  enableOfflineMode: {
                    Set: e.currentTarget.checked
                  }
                })
              }}
            />
          </RightHandSide>
        </Row>

        {/* Features Section Header */}
        <Row class="bg-darkSlate-800/50 rounded-xl px-6 py-4">
          <div class="flex items-center gap-3">
            <div class="i-hugeicons:star h-5 w-5 text-primary-400" />
            <span class="font-semibold">New Features</span>
          </div>
        </Row>

        {/* Feature Cards */}
        <div class="grid grid-cols-2 gap-4">
          {/* Instance Tags */}
          <div class="bg-darkSlate-700 rounded-xl p-4">
            <div class="flex items-center gap-3 mb-3">
              <div class="h-10 w-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <div class="i-hugeicons:tag h-5 w-5 text-blue-400" />
              </div>
              <div>
                <div class="font-medium">Instance Tags</div>
                <div class="text-darkSlate-400 text-sm">Organize instances with tags</div>
              </div>
            </div>
            <p class="text-darkSlate-300 text-sm mb-3">
              Create color-coded tags to categorize your instances. Filter and sort by tags in the library.
            </p>
            <div class="flex gap-2 flex-wrap">
              <div class="px-2 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400 border border-blue-500/50">Modpack</div>
              <div class="px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/50">Vanilla</div>
              <div class="px-2 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-400 border border-purple-500/50">Server</div>
            </div>
          </div>

          {/* Mod Profiles */}
          <div class="bg-darkSlate-700 rounded-xl p-4">
            <div class="flex items-center gap-3 mb-3">
              <div class="h-10 w-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <div class="i-hugeicons:folder-favourite h-5 w-5 text-purple-400" />
              </div>
              <div>
                <div class="font-medium">Mod Profiles</div>
                <div class="text-darkSlate-400 text-sm">Save mod configurations</div>
              </div>
            </div>
            <p class="text-darkSlate-300 text-sm mb-3">
              Create profiles to quickly switch between different mod setups. Perfect for testing or different play styles.
            </p>
            <Button type="secondary" size="small">
              <div class="i-hugeicons:folder-add h-4 w-4" />
              Create Profile
            </Button>
          </div>

          {/* Instance Backup */}
          <div class="bg-darkSlate-700 rounded-xl p-4">
            <div class="flex items-center gap-3 mb-3">
              <div class="h-10 w-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                <div class="i-hugeicons:database-sync h-5 w-5 text-green-400" />
              </div>
              <div>
                <div class="font-medium">Instance Backups</div>
                <div class="text-darkSlate-400 text-sm">Protect your instances</div>
              </div>
            </div>
            <p class="text-darkSlate-300 text-sm mb-3">
              Create snapshots of your instances before making changes. Restore if something goes wrong.
            </p>
            <Button type="secondary" size="small">
              <div class="i-hugeicons:archive-01 h-4 w-4" />
              Backup Now
            </Button>
          </div>

          {/* Server Browser */}
          <div class="bg-darkSlate-700 rounded-xl p-4">
            <div class="flex items-center gap-3 mb-3">
              <div class="h-10 w-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
                <div class="i-hugeicons:server h-5 w-5 text-orange-400" />
              </div>
              <div>
                <div class="font-medium">Server Browser</div>
                <div class="text-darkSlate-400 text-sm">Quick server access</div>
              </div>
            </div>
            <p class="text-darkSlate-300 text-sm mb-3">
              Save your favorite servers for quick access. See player counts and server status at a glance.
            </p>
            <Button type="secondary" size="small">
              <div class="i-hugeicons:add-circle h-4 w-4" />
              Add Server
            </Button>
          </div>
        </div>

        {/* Settings Import/Export */}
        <Row class="flex-col items-stretch">
          <SettingsImportExport
            backups={settingsBackups()}
            isExporting={isExporting()}
            isImporting={isImporting()}
            exportProgress={exportProgress()}
            importProgress={importProgress()}
            onExport={(name, description) => {
              setIsExporting(true)
              // Simulate export
              let progress = 0
              const interval = setInterval(() => {
                progress += 10
                setExportProgress(progress)
                if (progress >= 100) {
                  clearInterval(interval)
                  setIsExporting(false)
                  setExportProgress(0)
                }
              }, 200)
            }}
            onImport={(filePath) => {
              setIsImporting(true)
              // Simulate import
              let progress = 0
              const interval = setInterval(() => {
                progress += 10
                setImportProgress(progress)
                if (progress >= 100) {
                  clearInterval(interval)
                  setIsImporting(false)
                  setImportProgress(0)
                }
              }, 200)
            }}
            onRestore={(backupId) => {
              console.log("Restore backup:", backupId)
            }}
            onDelete={(backupId) => {
              console.log("Delete backup:", backupId)
            }}
            onSelectFile={async () => {
              // In real implementation, this would open a file picker
              return "/path/to/settings.json"
            }}
          />
        </Row>
      </RowsContainer>
    </>
  )
}

export default NokiatisFeatures
