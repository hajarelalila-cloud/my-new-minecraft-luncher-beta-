import { Show } from "solid-js"
import { useMatch } from "@solidjs/router"
import { InlineFilterBadges } from "./InlineFilterBadges"
import useSearchContext from "./SearchInputContext"
import { Trans, useTransContext } from "@gd/i18n"
import { Button } from "@gd/ui"
import { useGDNavigate } from "@/managers/NavigationManager"

export function FilterBadgesBar() {
  const isSearchPage = useMatch(() => "/search/*")
  const isAddonPage = useMatch(() => "/addon/*")
  const searchContext = useSearchContext()
  const [t] = useTransContext()
  const navigator = useGDNavigate()

  const isExpanded = () => !!(isSearchPage() || isAddonPage())

  const hasActiveFilters = () => {
    const query = searchContext?.searchQuery()
    return !!(
      query?.categories?.length ||
      query?.modloaders?.length ||
      query?.gameVersions?.length ||
      query?.searchApi ||
      query?.environment ||
      query?.platformFilters
    )
  }

  const clearAllFilters = () => {
    searchContext?.setSearchQuery((prev) => ({
      ...prev,
      categories: null,
      modloaders: null,
      gameVersions: null,
      searchApi: null,
      environment: null,
      platformFilters: null
    }))
  }

  return (
    <Show when={isExpanded() && hasActiveFilters()}>
      <div
        class="w-full bg-darkSlate-800 border-b border-darkSlate-700 transition-all duration-300 ease-in-out"
        style={{ "view-transition-name": "filter-badges-bar" }}
      >
        <div class="flex items-center py-3 px-6 gap-4">
          <Show when={searchContext?.selectedInstanceId()}>
            <Button
              size="small"
              type="outline"
              onClick={() => {
                navigator.navigate(`/library/${searchContext?.selectedInstanceId()}/addons`)
              }}
            >
              <div class="i-hugeicons:arrow-left-01" />
              <Trans key="search.go_back" />
            </Button>
          </Show>
          <div class="flex items-center justify-center flex-1">
            <div class="flex items-center gap-2 max-w-[700px] overflow-visible scrollbar-hide">
              <button
                class="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium text-lightSlate-400 hover:text-lightSlate-50 hover:bg-darkSlate-700 transition-colors flex-shrink-0"
                onClick={clearAllFilters}
              >
                <div class="i-hugeicons:delete-02 text-sm" />
                {t("search.clear_all_filters")}
              </button>
              <div class="h-4 w-px bg-darkSlate-600 flex-shrink-0" />
              <InlineFilterBadges />
            </div>
          </div>
        </div>
      </div>
    </Show>
  )
}
