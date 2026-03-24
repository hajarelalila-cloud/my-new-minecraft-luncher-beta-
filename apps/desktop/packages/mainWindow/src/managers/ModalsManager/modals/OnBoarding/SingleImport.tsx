import { setTaskIds } from "@/utils/import"
import { taskIds } from "@/utils/import"
import { rspc } from "@/utils/rspcClient"
import { Progress } from "@gd/ui"
import { Match, Switch, createEffect, createSignal } from "solid-js"

const [isDownloaded, setIsDownloaded] = createSignal(false)
export { isDownloaded }

const SingleImport = (props: {
  instanceIndex: number
  instanceName: string
  taskId?: number
  importState: string
}) => {
  const [progress, setProgress] = createSignal(0)
  const [state, setState] = createSignal("idle")

  const _task = rspc.createQuery(() => ({
    queryKey: ["vtask.getTask", props.taskId || null]
  }))

  createEffect(() => {
    if (taskIds() !== undefined) {
      const task = _task.data
      try {
        if (task?.progress) {
          if (task.progress.type == "Known") {
            setProgress(Math.floor(task.progress.value * 100))
          }
        }
        const isFailed = task && task.progress.type === "Failed"
        const isDownloaded = task === null && progress() !== 0
        if (isDownloaded || isFailed) {
          const taskIdsArray = taskIds()
          taskIdsArray[props.instanceIndex] = undefined
          setTaskIds(taskIdsArray)
        }
        if (isFailed) {
          setState("failed")
        } else if (isDownloaded) {
          setState("completed")
          setIsDownloaded(true)
        }
      } catch (e) {
        console.error(e)
      }
    }
  })

  return (
    <div class="flex justify-between gap-2 rounded-md px-4">
      <span class="font-semibold">{props.instanceName}</span>
      <Switch>
        <Match when={state() === "failed" || props.importState === "error"}>
          <div>
            <div class="i-ph:x-bold text-2xl text-red-600" />
          </div>
        </Match>
        <Match when={state() === "idle"}>
          <div class="w-30 flex items-center gap-4">
            <Progress value={progress()} />
            <div class="font-semibold">{progress()}%</div>
          </div>
        </Match>

        <Match when={state() === "completed"}>
          <div class="i-ic:round-check text-2xl text-green-600" />
        </Match>
      </Switch>
    </div>
  )
}
export default SingleImport
