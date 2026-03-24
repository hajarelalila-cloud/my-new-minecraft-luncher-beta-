import { ModalProps } from "../../"
import ModalLayout from "../../ModalLayout"
import { Trans } from "@gd/i18n"
import { createSignal, For, Show, onMount } from "solid-js"
import { Button, Spinner } from "@gd/ui"
import { rspc } from "@/utils/rspcClient"
import { format, formatDistanceToNow } from "date-fns"

interface NotificationPanelProps extends ModalProps {}

const NotificationPanel = (props: NotificationPanelProps) => {
  const [filter, setFilter] = createSignal<"all" | "unread" | "updates" | "system">("all")
  const [isMarkingRead, setIsMarkingRead] = createSignal(false)

  // Query for notifications
  const notificationsQuery = rspc.createQuery(() => ({
    queryKey: ["notifications.getAll"]
  }))

  // Mutations
  const markReadMutation = rspc.createMutation(() => ({
    mutationKey: ["notifications.markRead"]
  }))

  const markAllReadMutation = rspc.createMutation(() => ({
    mutationKey: ["notifications.markAllRead"]
  }))

  const dismissMutation = rspc.createMutation(() => ({
    mutationKey: ["notifications.dismiss"]
  }))

  const handleMarkRead = async (notificationId: number) => {
    await markReadMutation.mutateAsync({ notificationId })
  }

  const handleMarkAllRead = async () => {
    setIsMarkingRead(true)
    try {
      await markAllReadMutation.mutateAsync()
    } finally {
      setIsMarkingRead(false)
    }
  }

  const handleDismiss = async (notificationId: number) => {
    await dismissMutation.mutateAsync({ notificationId })
  }

  const filteredNotifications = () => {
    const notifications = notificationsQuery.data || []
    const currentFilter = filter()

    switch (currentFilter) {
      case "unread":
        return notifications.filter((n: any) => !n.isRead)
      case "updates":
        return notifications.filter((n: any) => n.type === "update")
      case "system":
        return notifications.filter((n: any) => n.type === "system" || n.type === "alert")
      default:
        return notifications
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "update":
        return "i-hugeicons:software-download h-5 w-5 text-blue-400"
      case "friend":
        return "i-hugeicons:user-add-01 h-5 w-5 text-green-400"
      case "system":
        return "i-hugeicons:settings h-5 w-5 text-gray-400"
      case "alert":
        return "i-hugeicons:alert-02 h-5 w-5 text-yellow-400"
      default:
        return "i-hugeicons:notification-circle h-5 w-5 text-purple-400"
    }
  }

  const getNotificationBg = (type: string, isRead: boolean) => {
    if (isRead) return "bg-darkSlate-700/30"
    switch (type) {
      case "update":
        return "bg-blue-500/10"
      case "friend":
        return "bg-green-500/10"
      case "alert":
        return "bg-yellow-500/10"
      default:
        return "bg-purple-500/10"
    }
  }

  const unreadCount = () => {
    return (notificationsQuery.data || []).filter((n: any) => !n.isRead).length
  }

  return (
    <ModalLayout
      title="Notifications"
      height="h-[600px] max-h-[90vh]"
      width="w-[500px] max-w-[95vw]"
    >
      <div class="flex flex-col gap-4 p-4 h-full overflow-hidden">
        {/* Header */}
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="text-gray-400 text-sm">
              {unreadCount()} unread
            </span>
          </div>
          <Show when={unreadCount() > 0}>
            <Button
              type="secondary"
              size="small"
              onClick={handleMarkAllRead}
              loading={isMarkingRead()}
            >
              Mark all as read
            </Button>
          </Show>
        </div>

        {/* Filters */}
        <div class="flex gap-2">
          <Button
            type={filter() === "all" ? "primary" : "secondary"}
            size="small"
            onClick={() => setFilter("all")}
          >
            All
          </Button>
          <Button
            type={filter() === "unread" ? "primary" : "secondary"}
            size="small"
            onClick={() => setFilter("unread")}
          >
            Unread
          </Button>
          <Button
            type={filter() === "updates" ? "primary" : "secondary"}
            size="small"
            onClick={() => setFilter("updates")}
          >
            Updates
          </Button>
          <Button
            type={filter() === "system" ? "primary" : "secondary"}
            size="small"
            onClick={() => setFilter("system")}
          >
            System
          </Button>
        </div>

        {/* Notifications List */}
        <div class="flex-1 overflow-y-auto">
          <Show when={notificationsQuery.isLoading}>
            <div class="flex items-center justify-center py-8">
              <Spinner class="h-8 w-8" />
            </div>
          </Show>

          <Show when={!notificationsQuery.isLoading && filteredNotifications().length === 0}>
            <div class="flex flex-col items-center justify-center py-12 text-gray-500">
              <div class="i-hugeicons:notification-off h-16 w-16 mb-4" />
              <p class="text-lg font-medium">No notifications</p>
              <p class="text-sm">You're all caught up!</p>
            </div>
          </Show>

          <Show when={!notificationsQuery.isLoading && filteredNotifications().length > 0}>
            <div class="space-y-2">
              <For each={filteredNotifications()}>
                {(notification: any) => (
                  <div class={`relative rounded-lg border border-darkSlate-600 ${getNotificationBg(notification.type, notification.isRead)} overflow-hidden`}>
                    <div class="flex items-start gap-3 p-4">
                      {/* Unread indicator */}
                      <Show when={!notification.isRead}>
                        <div class="absolute left-0 top-0 bottom-0 w-1 bg-purple-500" />
                      </Show>

                      {/* Icon */}
                      <div class={`flex h-10 w-10 items-center justify-center rounded-lg bg-darkSlate-700 ${getNotificationIcon(notification.type)}`} />

                      {/* Content */}
                      <div class="flex-1 min-w-0">
                        <div class="flex items-start justify-between gap-2">
                          <h4 class="font-medium text-white text-sm">{notification.title}</h4>
                          <span class="text-xs text-gray-500 flex-shrink-0">
                            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                        <p class="text-sm text-gray-400 mt-1">{notification.message}</p>

                        {/* Action Button */}
                        <Show when={notification.actionUrl}>
                          <a
                            href={notification.actionUrl}
                            class="inline-flex items-center gap-1 mt-2 text-sm text-purple-400 hover:text-purple-300"
                          >
                            {notification.actionLabel || "Learn more"}
                            <div class="i-hugeicons:arrow-right-01 h-4 w-4" />
                          </a>
                        </Show>
                      </div>

                      {/* Actions */}
                      <div class="flex gap-1">
                        <Show when={!notification.isRead}>
                          <button
                            class="p-1.5 rounded-lg hover:bg-darkSlate-600 text-gray-400 hover:text-white transition-colors"
                            onClick={() => handleMarkRead(notification.id)}
                            title="Mark as read"
                          >
                            <div class="i-hugeicons:checkmark-circle h-4 w-4" />
                          </button>
                        </Show>
                        <button
                          class="p-1.5 rounded-lg hover:bg-darkSlate-600 text-gray-400 hover:text-white transition-colors"
                          onClick={() => handleDismiss(notification.id)}
                          title="Dismiss"
                        >
                          <div class="i-hugeicons:cancel-01 h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </For>
            </div>
          </Show>
        </div>

        {/* Footer */}
        <div class="flex justify-end pt-4 border-t border-darkSlate-600">
          <Button type="secondary" onClick={() => props.closeModal?.()}>
            Close
          </Button>
        </div>
      </div>
    </ModalLayout>
  )
}

export default NotificationPanel
