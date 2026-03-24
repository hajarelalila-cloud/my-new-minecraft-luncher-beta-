/**
 * Login Page Entry Point
 *
 * Modified for Nokiatis Launcher:
 * - Skips login flow on startup and goes directly to library
 * - Login is only required when clicking "Play" on an instance
 * - Supports both Microsoft (Premium) and Offline (Cracked) accounts
 */

import { createEffect, createMemo } from "solid-js"
import { useSearchParams } from "@solidjs/router"
import { AuthFlow } from "./AuthFlow"
import { useGlobalStore } from "@/components/GlobalStoreContext"
import { useGDNavigate } from "@/managers/NavigationManager"

export default function Login() {
  const globalStore = useGlobalStore()
  const [searchParams] = useSearchParams()
  const navigator = useGDNavigate()

  // Determine if we should redirect to library
  const shouldRedirect = createMemo(() => {
    // Wait for data to load
    const settings = globalStore.settings.data

    if (!settings) {
      return false // Data not loaded yet
    }

    // Don't redirect if explicitly adding accounts from settings
    const isAddingAccount =
      searchParams.addMicrosoftAccount === "true" ||
      searchParams.addGdlAccount === "true"

    if (isAddingAccount) {
      return false // Show auth flow
    }

    // Always redirect to library (skip login on startup)
    // Login will be prompted when clicking Play
    return true
  })

  // Perform redirect when conditions are met
  createEffect(() => {
    if (shouldRedirect()) {
      navigator.navigate("/library", { replace: true })
    }
  })

  return <AuthFlow />
}
