/**
 * Discord Rich Presence Manager for Nokiatis Launcher
 *
 * This module handles Discord Rich Presence integration, allowing the launcher
 * to display activity on Discord when browsing the launcher and when playing Minecraft.
 *
 * Features:
 * - Shows launcher activity when browsing the launcher
 * - Shows game activity when playing Minecraft
 * - Persists even when launcher window is closed during gameplay
 * - Displays instance name, modloader, and Minecraft version
 *
 * @author Nokiatis Team
 */

import DiscordRPC from "discord-rpc-revamp"
import log from "electron-log/main"

// Discord Application ID - You need to create a Discord application at https://discord.com/developers/applications
// For now, we'll use a placeholder. Replace this with your actual Discord App ID
const DISCORD_CLIENT_ID = "1354913057986965524" // Replace with your Discord App ID

// Logger for Discord RPC
const logger = log.scope("DiscordRPC")

export interface GameInfo {
  instanceName: string
  mcVersion: string
  modLoader?: string
  modLoaderVersion?: string
  isPlaying: boolean
}

export type PresenceState = "idle" | "browsing" | "playing"

class DiscordRPCManager {
  private client: DiscordRPC.Client | null = null
  private isConnected: boolean = false
  private reconnectAttempts: number = 0
  private maxReconnectAttempts: number = 5
  private reconnectInterval: NodeJS.Timeout | null = null
  private currentPresence: PresenceState = "idle"
  private currentGameInfo: GameInfo | null = null
  private startTimestamp: number = Date.now()
  private isEnabled: boolean = true

  constructor() {
    logger.info("Discord RPC Manager initialized")
  }

  /**
   * Initialize the Discord RPC client and establish connection
   */
  async init(): Promise<boolean> {
    if (!this.isEnabled) {
      logger.info("Discord RPC is disabled")
      return false
    }

    if (this.isConnected && this.client) {
      logger.info("Discord RPC already connected")
      return true
    }

    try {
      // Create new Discord RPC client
      this.client = new DiscordRPC.Client({ transport: "ipc" })

      // Set up event handlers
      this.client.on("ready", () => {
        logger.info(`Discord RPC connected! User: ${this.client?.user?.username}`)
        this.isConnected = true
        this.reconnectAttempts = 0
        // Set initial presence
        this.setBrowsingPresence()
      })

      this.client.on("disconnected", () => {
        logger.warn("Discord RPC disconnected")
        this.isConnected = false
        this.scheduleReconnect()
      })

      this.client.on("error", (error: Error) => {
        logger.error("Discord RPC error:", error)
        this.isConnected = false
        // Don't reconnect on certain errors
        if (!error.message.includes("Could not connect")) {
          this.scheduleReconnect()
        }
      })

      // Login to Discord
      await this.client.login({ clientId: DISCORD_CLIENT_ID })
      return true

    } catch (error) {
      logger.error("Failed to initialize Discord RPC:", error)
      this.isConnected = false
      this.scheduleReconnect()
      return false
    }
  }

  /**
   * Schedule a reconnection attempt
   */
  private scheduleReconnect(): void {
    if (this.reconnectInterval) {
      return
    }

    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      logger.warn("Max reconnect attempts reached, stopping reconnection")
      return
    }

    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000)
    logger.info(`Scheduling reconnect in ${delay}ms (attempt ${this.reconnectAttempts + 1}/${this.maxReconnectAttempts})`)

    this.reconnectInterval = setTimeout(() => {
      this.reconnectInterval = null
      this.reconnectAttempts++
      this.init()
    }, delay)
  }

  /**
   * Set presence to show the user is browsing the launcher
   */
  async setBrowsingPresence(): Promise<void> {
    if (!this.isConnected || !this.client) {
      return
    }

    this.currentPresence = "browsing"
    this.startTimestamp = Date.now()

    try {
      await this.client.setActivity({
        details: "In the Launcher",
        state: "Browsing instances",
        startTimestamp: this.startTimestamp,
        largeImageKey: "logo",
        largeImageText: "Nokiatis Launcher",
        smallImageKey: "browse",
        smallImageText: "Made with love by Nokiatis Team",
        buttons: [
          {
            label: "Download Nokiatis Launcher",
            url: "https://github.com/itzraynx/my-new-minecraft-luncher"
          }
        ],
        instance: false
      })
      logger.info("Set browsing presence")
    } catch (error) {
      logger.error("Failed to set browsing presence:", error)
    }
  }

  /**
   * Set presence to show the user is playing Minecraft
   */
  async setPlayingPresence(gameInfo: GameInfo): Promise<void> {
    if (!this.isConnected || !this.client) {
      return
    }

    this.currentPresence = "playing"
    this.currentGameInfo = gameInfo
    this.startTimestamp = Date.now()

    // Build the state string based on available info
    let stateStr = gameInfo.mcVersion
    if (gameInfo.modLoader) {
      stateStr = `${gameInfo.modLoader} ${gameInfo.mcVersion}`
    }

    // Build details string
    let detailsStr = `Playing ${gameInfo.instanceName}`
    if (detailsStr.length > 50) {
      detailsStr = detailsStr.substring(0, 47) + "..."
    }

    try {
      await this.client.setActivity({
        details: detailsStr,
        state: stateStr,
        startTimestamp: this.startTimestamp,
        largeImageKey: "minecraft",
        largeImageText: `Minecraft ${gameInfo.mcVersion}`,
        smallImageKey: gameInfo.modLoader?.toLowerCase() || "vanilla",
        smallImageText: gameInfo.modLoader ? `${gameInfo.modLoader} ${gameInfo.modLoaderVersion || ""}`.trim() : "Vanilla Minecraft",
        buttons: [
          {
            label: "Get Nokiatis Launcher",
            url: "https://github.com/itzraynx/my-new-minecraft-luncher"
          }
        ],
        instance: true
      })
      logger.info(`Set playing presence for ${gameInfo.instanceName}`)
    } catch (error) {
      logger.error("Failed to set playing presence:", error)
    }
  }

  /**
   * Update activity based on state string from backend
   */
  async updateActivity(state: string): Promise<void> {
    // Parse the state string which can contain JSON data
    if (state.startsWith("playing:")) {
      try {
        const jsonData = state.substring(8) // Remove "playing:" prefix
        const gameInfo: GameInfo = JSON.parse(jsonData)
        await this.setPlayingPresence(gameInfo)
      } catch (error) {
        // If parsing fails, use a simple playing state
        logger.warn("Failed to parse game info, using simple presence")
        await this.setPlayingPresence({
          instanceName: "Minecraft",
          mcVersion: "Unknown",
          isPlaying: true
        })
      }
    } else if (state === "Playing Minecraft") {
      // Fallback for old format
      await this.setPlayingPresence({
        instanceName: "Minecraft",
        mcVersion: "Unknown",
        isPlaying: true
      })
    } else if (state === "browsing") {
      await this.setBrowsingPresence()
    } else {
      logger.info(`Unknown activity state: ${state}`)
    }
  }

  /**
   * Clear the current presence
   */
  async stopActivity(): Promise<void> {
    if (!this.isConnected || !this.client) {
      return
    }

    try {
      await this.client.clearActivity()
      this.currentPresence = "idle"
      this.currentGameInfo = null
      logger.info("Cleared activity")
    } catch (error) {
      logger.error("Failed to clear activity:", error)
    }
  }

  /**
   * Shutdown the Discord RPC connection
   */
  async shutdown(): Promise<void> {
    if (this.reconnectInterval) {
      clearTimeout(this.reconnectInterval)
      this.reconnectInterval = null
    }

    if (this.client) {
      try {
        await this.client.destroy()
        logger.info("Discord RPC client destroyed")
      } catch (error) {
        logger.error("Error destroying Discord RPC client:", error)
      }
    }

    this.client = null
    this.isConnected = false
    this.currentPresence = "idle"
    this.currentGameInfo = null
  }

  /**
   * Enable or disable Discord RPC
   */
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled
    if (!enabled) {
      this.shutdown()
    }
  }

  /**
   * Check if Discord RPC is connected
   */
  isActive(): boolean {
    return this.isConnected
  }

  /**
   * Get the current presence state
   */
  getPresenceState(): PresenceState {
    return this.currentPresence
  }

  /**
   * Get current game info if playing
   */
  getGameInfo(): GameInfo | null {
    return this.currentGameInfo
  }
}

// Export a singleton instance
export const discordRpcManager = new DiscordRPCManager()
