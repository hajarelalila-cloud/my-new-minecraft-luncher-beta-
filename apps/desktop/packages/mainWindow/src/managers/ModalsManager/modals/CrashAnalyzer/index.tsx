import { ModalProps } from "../../"
import ModalLayout from "../../ModalLayout"
import { Trans } from "@gd/i18n"
import { createSignal, For, Show } from "solid-js"
import { Button, Spinner } from "@gd/ui"
import { rspc } from "@/utils/rspcClient"
import { format } from "date-fns"

interface CrashAnalyzerProps extends ModalProps {
  instanceId?: number
  instanceName?: string
  crashLog?: string
}

const CrashAnalyzer = (props: CrashAnalyzerProps) => {
  const [selectedCrash, setSelectedCrash] = createSignal<number | null>(null)
  const [isAnalyzing, setIsAnalyzing] = createSignal(false)
  const [manualLog, setManualLog] = createSignal("")
  const [analysisResult, setAnalysisResult] = createSignal<any>(null)
  const [error, setError] = createSignal<string | null>(null)

  // Query for crash history
  const crashesQuery = rspc.createQuery(() => ({
    queryKey: ["instance.getCrashReports", props.instanceId]
  }))

  // Mutations
  const analyzeCrashMutation = rspc.createMutation(() => ({
    mutationKey: ["instance.analyzeCrash"]
  }))

  const handleAnalyzeCrash = async () => {
    const crashId = selectedCrash()
    const log = manualLog()

    if (!crashId && !log.trim()) {
      setError("Please select a crash report or paste a crash log")
      return
    }

    setIsAnalyzing(true)
    setError(null)
    setAnalysisResult(null)

    try {
      const result = await analyzeCrashMutation.mutateAsync({
        instanceId: props.instanceId,
        crashId: crashId || undefined,
        crashLog: log || undefined
      })
      setAnalysisResult(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to analyze crash")
    } finally {
      setIsAnalyzing(false)
    }
  }

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + "..."
  }

  return (
    <ModalLayout
      title="Crash Report Analyzer"
      height="h-[700px] max-h-[90vh]"
      width="w-[900px] max-w-[95vw]"
    >
      <div class="flex flex-col gap-6 p-6 h-full overflow-hidden">
        {/* Info Banner */}
        <div class="rounded-lg bg-red-500/10 border border-red-500/20 p-4">
          <div class="flex gap-3">
            <div class="i-hugeicons:bug text-red-400 h-5 w-5 flex-shrink-0 mt-0.5" />
            <p class="text-sm text-red-200">
              Our AI-powered crash analyzer will help identify the cause of your crash and suggest solutions.
            </p>
          </div>
        </div>

        <div class="flex gap-4 flex-1 min-h-0">
          {/* Left Panel - Crash History */}
          <div class="w-1/3 flex flex-col">
            <h3 class="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Recent Crashes
            </h3>
            <div class="flex-1 overflow-y-auto rounded-lg border border-darkSlate-600 bg-darkSlate-800/50">
              <Show when={crashesQuery.isLoading}>
                <div class="flex items-center justify-center py-8">
                  <Spinner class="h-6 w-6" />
                </div>
              </Show>

              <Show when={!crashesQuery.isLoading && crashesQuery.data?.length === 0}>
                <div class="flex flex-col items-center justify-center py-8 text-gray-500">
                  <div class="i-hugeicons:task-error h-10 w-10 mb-3" />
                  <p class="text-sm">No crash reports</p>
                </div>
              </Show>

              <Show when={!crashesQuery.isLoading && crashesQuery.data && crashesQuery.data.length > 0}>
                <div class="divide-y divide-darkSlate-600">
                  <For each={crashesQuery.data}>
                    (crash: any) => (
                      <div
                        class={`p-3 cursor-pointer hover:bg-darkSlate-700/50 transition-colors ${
                          selectedCrash() === crash.id ? "bg-red-500/10 border-l-4 border-l-red-500" : ""
                        }`}
                        onClick={() => setSelectedCrash(crash.id)}
                      >
                        <div class="font-medium text-white text-sm truncate">{crash.title}</div>
                        <div class="text-xs text-gray-500 mt-1">
                          {format(new Date(crash.createdAt), "MMM d, h:mm a")}
                        </div>
                        <Show when={crash.isResolved}>
                          <span class="text-xs text-green-400 mt-1 inline-block">Resolved</span>
                        </Show>
                      </div>
                    )
                  </For>
                </div>
              </Show>
            </div>

            {/* Manual Paste */}
            <div class="mt-4">
              <h3 class="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Or Paste Crash Log
              </h3>
              <textarea
                placeholder="Paste your crash log here..."
                value={manualLog()}
                onInput={(e) => setManualLog(e.currentTarget.value)}
                class="w-full h-32 rounded-lg border border-darkSlate-600 bg-darkSlate-800 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-red-500 focus:outline-none resize-none font-mono"
              />
            </div>

            <Button
              type="primary"
              class="mt-4"
              onClick={handleAnalyzeCrash}
              loading={isAnalyzing()}
              disabled={(!selectedCrash() && !manualLog().trim()) || isAnalyzing()}
            >
              <div class="i-hugeicons:ai-search h-4 w-4" />
              Analyze Crash
            </Button>
          </div>

          {/* Right Panel - Analysis Result */}
          <div class="flex-1 flex flex-col min-w-0">
            <h3 class="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Analysis Result
            </h3>
            
            <Show when={isAnalyzing()}>
              <div class="flex flex-col items-center justify-center py-16 text-gray-500">
                <Spinner class="h-10 w-10 mb-4" />
                <p>Analyzing crash report...</p>
                <p class="text-sm">This may take a few seconds</p>
              </div>
            </Show>

            <Show when={!isAnalyzing() && !analysisResult()}>
              <div class="flex flex-col items-center justify-center py-16 text-gray-500">
                <div class="i-hugeicons:ai-magic h-12 w-12 mb-4" />
                <p>No analysis yet</p>
                <p class="text-sm">Select a crash or paste a log to analyze</p>
              </div>
            </Show>

            <Show when={!isAnalyzing() && analysisResult()}>
              <div class="flex-1 overflow-y-auto rounded-lg border border-darkSlate-600 bg-darkSlate-800/50 p-4">
                {/* Summary */}
                <div class="mb-6">
                  <h4 class="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                    <div class="i-hugeicons:document-summary h-5 w-5 text-yellow-400" />
                    Summary
                  </h4>
                  <p class="text-gray-300 text-sm">{analysisResult()?.summary}</p>
                </div>

                {/* Cause */}
                <div class="mb-6">
                  <h4 class="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                    <div class="i-hugeicons:target h-5 w-5 text-red-400" />
                    Likely Cause
                  </h4>
                  <div class="rounded-lg bg-red-500/10 border border-red-500/20 p-3">
                    <p class="text-red-200 text-sm">{analysisResult()?.cause}</p>
                  </div>
                </div>

                {/* Solution */}
                <div class="mb-6">
                  <h4 class="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                    <div class="i-hugeicons:lightbulb h-5 w-5 text-green-400" />
                    Suggested Solution
                  </h4>
                  <div class="rounded-lg bg-green-500/10 border border-green-500/20 p-3">
                    <p class="text-green-200 text-sm whitespace-pre-wrap">{analysisResult()?.solution}</p>
                  </div>
                </div>

                {/* Related Mod */}
                <Show when={analysisResult()?.modId}>
                  <div class="mb-6">
                    <h4 class="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                      <div class="i-hugeicons:plugin h-5 w-5 text-purple-400" />
                      Related Mod
                    </h4>
                    <div class="flex items-center gap-3 p-3 rounded-lg bg-darkSlate-700/50 border border-darkSlate-600">
                      <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/20">
                        <div class="i-hugeicons:box h-5 w-5 text-purple-400" />
                      </div>
                      <div>
                        <div class="font-medium text-white">{analysisResult()?.modId}</div>
                        <div class="text-xs text-gray-400">Consider updating or removing this mod</div>
                      </div>
                    </div>
                  </div>
                </Show>

                {/* Full Log */}
                <Show when={analysisResult()?.fullLog}>
                  <div>
                    <h4 class="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                      <div class="i-hugeicons:code-file h-5 w-5 text-blue-400" />
                      Full Log
                    </h4>
                    <div class="rounded-lg bg-darkSlate-900 p-3 max-h-48 overflow-y-auto">
                      <pre class="text-xs text-gray-400 font-mono whitespace-pre-wrap">{analysisResult()?.fullLog}</pre>
                    </div>
                  </div>
                </Show>
              </div>
            </Show>

            <Show when={error()}>
              <div class="flex items-center gap-2 rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400 mt-4">
                <div class="i-hugeicons:cancel-circle h-4 w-4" />
                {error()}
              </div>
            </Show>
          </div>
        </div>

        {/* Close Button */}
        <div class="flex justify-end pt-4 border-t border-darkSlate-600">
          <Button type="secondary" onClick={() => props.closeModal?.()}>
            Close
          </Button>
        </div>
      </div>
    </ModalLayout>
  )
}

export default CrashAnalyzer
