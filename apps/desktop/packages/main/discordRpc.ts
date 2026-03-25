/**
 * Discord Rich Presence Manager for Nokiatis Launcher
 *
 * Comprehensive Discord RPC integration with:
 * - Dynamic activity updates (playtime, mod count, memory)
 * - Join Game feature for multiplayer
 * - Modpack support with icons
 * - Download/install progress states
 * - Privacy settings and customization
 * - Instance icons and visual features
 *
 * @author Nokiatis Team
 */

import DiscordRPC from "discord-rpc-revamp"
import log from "electron-log/main"

// Discord Application ID for Nokiatis Launcher
const DISCORD_CLIENT_ID = "1486472122715996270"

// Logger for Discord RPC
const logger = log.scope("DiscordRPC")

// ============================================
// TYPES & INTERFACES
// ============================================

export type PresenceState = 
  | "idle" 
  | "browsing" 
  | "downloading" 
  | "installing" 
  | "launching" 
  | "playing"

export interface GameInfo {
  instanceName: string
  instanceId: string
  mcVersion: string
  modLoader?: string
  modLoaderVersion?: string
  modCount?: number
  modpackName?: string
  modpackIcon?: string
  modpackVersion?: string
  isPlaying: boolean
  isMultiplayer?: boolean
  serverIp?: string
  serverPort?: number
  maxPlayers?: number
  currentPlayers?: number
  memoryAllocated?: number // in MB
}

export interface DownloadInfo {
  type: "mod" | "modpack" | "minecraft" | "java" | "modloader"
  name: string
  progress: number // 0-100
  speed?: string
  eta?: string
}

export interface PrivacySettings {
  hideInstanceName: boolean
  hideServerIp: boolean
  hideModCount: boolean
  hidePlaytime: boolean
  customStatus?: string
  disabledInstances: string[] // instance IDs to disable RPC for
  enableJoinButton: boolean
}

export interface PresenceTheme {
  name: string
  primaryColor: string
  accentColor: string
  iconStyle: "modern" | "classic" | "minimal"
}

// ============================================
// DISCORD RPC MANAGER CLASS
// ============================================

class DiscordRPCManager {
  private client: DiscordRPC.Client | null = null
  private isConnected: boolean = false
  private reconnectAttempts: number = 0
  private maxReconnectAttempts: number = 5
  private reconnectInterval: NodeJS.Timeout | null = null
  
  // State
  private currentPresence: PresenceState = "idle"
  private currentGameInfo: GameInfo | null = null
  private currentDownloadInfo: DownloadInfo | null = null
  private startTimestamp: number = Date.now()
  private isEnabled: boolean = true
  
  // Settings
  private privacySettings: PrivacySettings = {
    hideInstanceName: false,
    hideServerIp: true,
    hideModCount: false,
    hidePlaytime: false,
    disabledInstances: [],
    enableJoinButton: true
  }
  
  // Theme
  private currentTheme: PresenceTheme = {
    name: "default",
    primaryColor: "#7289DA",
    accentColor: "#5865F2",
    iconStyle: "modern"
  }
  
  // Playtime tracking
  private playtimeInterval: NodeJS.Timeout | null = null
  private sessionPlaytime: number = 0 // in seconds
  
  // Screenshot callback
  private screenshotCallback: (() => Promise<Buffer | null>) | null = null

  constructor() {
    logger.info("Discord RPC Manager initialized with all features")
  }

  // ============================================
  // CONNECTION MANAGEMENT
  // ============================================

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
      this.client = new DiscordRPC.Client({ transport: "ipc" })

      this.client.on("ready", () => {
        logger.info(`Discord RPC connected! User: ${this.client?.user?.username}`)
        this.isConnected = true
        this.reconnectAttempts = 0
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
        if (!error.message.includes("Could not connect")) {
          this.scheduleReconnect()
        }
      })

      // Handle join game events from Discord
      this.client.on("joinGame", (secret: string) => {
        logger.info(`Join game request received: ${secret}`)
        this.handleJoinRequest(secret)
      })

      this.client.on("joinRequest", (user: any) => {
        logger.info(`Join request from: ${user.username}`)
        // Auto-accept join requests for now
        if (this.client) {
          this.client.sendJoinRequestResponse(user, "ACCEPT")
        }
      })

      this.client.on("spectateGame", (secret: string) => {
        logger.info(`Spectate request received: ${secret}`)
      })

      await this.client.login({ clientId: DISCORD_CLIENT_ID })
      return true

    } catch (error) {
      logger.error("Failed to initialize Discord RPC:", error)
      this.isConnected = false
      this.scheduleReconnect()
      return false
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectInterval) return

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

  // ============================================
  // PRESENCE STATES
  // ============================================

  /**
   * Set presence when browsing the launcher
   */
  async setBrowsingPresence(): Promise<void> {
    if (!this.isConnected || !this.client) return

    this.currentPresence = "browsing"
    this.startTimestamp = Date.now()

    const customStatus = this.privacySettings.customStatus

    try {
      await this.client.setActivity({
        details: customStatus || "In the Launcher",
        state: "Browsing instances",
        startTimestamp: this.startTimestamp,
        largeImageKey: "logo",
        largeImageText: "Nokiatis Launcher",
        smallImageKey: "browse",
        smallImageText: "Made with ❤️ by Nokiatis Team",
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
   * Set presence when downloading something
   */
  async setDownloadingPresence(info: DownloadInfo): Promise<void> {
    if (!this.isConnected || !this.client) return

    this.currentPresence = "downloading"
    this.currentDownloadInfo = info

    const typeNames: Record<string, string> = {
      mod: "Mod",
      modpack: "Modpack",
      minecraft: "Minecraft",
      java: "Java",
      modloader: "Modloader"
    }

    const typeName = typeNames[info.type] || "File"
    const progressStr = `Downloading ${typeName} (${info.progress}%)`

    try {
      await this.client.setActivity({
        details: `⬇️ Downloading ${info.name}`,
        state: info.speed ? `${progressStr} - ${info.speed}` : progressStr,
        startTimestamp: this.startTimestamp,
        largeImageKey: "logo",
        largeImageText: "Nokiatis Launcher",
        smallImageKey: "browse",
        smallImageText: info.eta ? `ETA: ${info.eta}` : `Progress: ${info.progress}%`,
        buttons: [
          {
            label: "Get Nokiatis Launcher",
            url: "https://github.com/itzraynx/my-new-minecraft-luncher"
          }
        ],
        instance: false
      })
      logger.info(`Set downloading presence: ${info.name} (${info.progress}%)`)
    } catch (error) {
      logger.error("Failed to set downloading presence:", error)
    }
  }

  /**
   * Set presence when installing something
   */
  async setInstallingPresence(type: string, name: string): Promise<void> {
    if (!this.isConnected || !this.client) return

    this.currentPresence = "installing"

    try {
      await this.client.setActivity({
        details: `🔧 Installing ${type}`,
        state: name,
        startTimestamp: this.startTimestamp,
        largeImageKey: "logo",
        largeImageText: "Nokiatis Launcher",
        smallImageKey: "forge",
        smallImageText: "Installing...",
        buttons: [
          {
            label: "Get Nokiatis Launcher",
            url: "https://github.com/itzraynx/my-new-minecraft-luncher"
          }
        ],
        instance: false
      })
      logger.info(`Set installing presence: ${type} - ${name}`)
    } catch (error) {
      logger.error("Failed to set installing presence:", error)
    }
  }

  /**
   * Set presence when launching Minecraft
   */
  async setLaunchingPresence(gameInfo: GameInfo): Promise<void> {
    if (!this.isConnected || !this.client) return

    this.currentPresence = "launching"
    this.currentGameInfo = gameInfo

    try {
      await this.client.setActivity({
        details: `▶️ Launching ${this.getDisplayName(gameInfo)}`,
        state: this.buildStateString(gameInfo),
        startTimestamp: Date.now(),
        largeImageKey: "minecraft",
        largeImageText: `Minecraft ${gameInfo.mcVersion}`,
        smallImageKey: gameInfo.modLoader?.toLowerCase() || "vanilla",
        smallImageText: this.buildSmallImageText(gameInfo),
        buttons: [
          {
            label: "Get Nokiatis Launcher",
            url: "https://github.com/itzraynx/my-new-minecraft-luncher"
          }
        ],
        instance: false
      })
      logger.info(`Set launching presence: ${gameInfo.instanceName}`)
    } catch (error) {
      logger.error("Failed to set launching presence:", error)
    }
  }

  /**
   * Set presence when playing Minecraft (full featured)
   */
  async setPlayingPresence(gameInfo: GameInfo): Promise<void> {
    if (!this.isConnected || !this.client) return

    // Check if this instance has RPC disabled
    if (this.privacySettings.disabledInstances.includes(gameInfo.instanceId)) {
      logger.info(`RPC disabled for instance: ${gameInfo.instanceId}`)
      return
    }

    this.currentPresence = "playing"
    this.currentGameInfo = gameInfo
    this.startTimestamp = Date.now()
    this.sessionPlaytime = 0

    // Start playtime tracking
    this.startPlaytimeTracking()

    // Build activity object
    const activity: DiscordRPC.SetActivity = {
      details: this.buildDetailsString(gameInfo),
      state: this.buildPlayingStateString(gameInfo),
      startTimestamp: this.startTimestamp,
      largeImageKey: this.getLargeImageKey(gameInfo),
      largeImageText: this.buildLargeImageText(gameInfo),
      smallImageKey: this.getSmallImageKey(gameInfo),
      smallImageText: this.buildSmallImageText(gameInfo),
      instance: true
    }

    // Add buttons
    const buttons: DiscordRPC.Button[] = [
      {
        label: "Get Nokiatis Launcher",
        url: "https://github.com/itzraynx/my-new-minecraft-luncher"
      }
    ]

    // Add join button for multiplayer
    if (gameInfo.isMultiplayer && gameInfo.serverIp && this.privacySettings.enableJoinButton) {
      // Create join secret
      const joinSecret = this.createJoinSecret(gameInfo)
      activity.party = {
        id: `nokiatis-${gameInfo.instanceId}`,
        size: gameInfo.currentPlayers && gameInfo.maxPlayers 
          ? [gameInfo.currentPlayers, gameInfo.maxPlayers] 
          : undefined,
        privacy: "PUBLIC"
      }
      activity.secrets = {
        join: joinSecret
      }
    }

    activity.buttons = buttons

    try {
      await this.client.setActivity(activity)
      logger.info(`Set playing presence for ${gameInfo.instanceName}`)
    } catch (error) {
      logger.error("Failed to set playing presence:", error)
    }
  }

  /**
   * Update presence with current playtime
   */
  async updatePlaytimePresence(): Promise<void> {
    if (!this.isConnected || !this.client) return
    if (this.currentPresence !== "playing" || !this.currentGameInfo) return

    const gameInfo = this.currentGameInfo
    const playtimeStr = this.formatPlaytime(this.sessionPlaytime)

    // Don't update too frequently (Discord rate limit)
    try {
      await this.client.setActivity({
        details: this.buildDetailsString(gameInfo),
        state: this.privacySettings.hidePlaytime 
          ? this.buildPlayingStateString(gameInfo)
          : `${this.buildPlayingStateString(gameInfo)} | ⏱️ ${playtimeStr}`,
        startTimestamp: this.startTimestamp,
        largeImageKey: this.getLargeImageKey(gameInfo),
        largeImageText: this.buildLargeImageText(gameInfo),
        smallImageKey: this.getSmallImageKey(gameInfo),
        smallImageText: this.buildSmallImageText(gameInfo),
        buttons: [
          {
            label: "Get Nokiatis Launcher",
            url: "https://github.com/itzraynx/my-new-minecraft-luncher"
          }
        ],
        instance: true
      })
    } catch (error) {
      logger.error("Failed to update playtime:", error)
    }
  }

  // ============================================
  // HELPER METHODS
  // ============================================

  private getDisplayName(gameInfo: GameInfo): string {
    if (this.privacySettings.hideInstanceName) {
      return gameInfo.modpackName || "Minecraft"
    }
    return gameInfo.instanceName
  }

  private buildDetailsString(gameInfo: GameInfo): string {
    let details = `🎮 Playing ${this.getDisplayName(gameInfo)}`
    if (details.length > 50) {
      details = details.substring(0, 47) + "..."
    }
    return details
  }

  private buildStateString(gameInfo: GameInfo): string {
    const parts: string[] = []
    
    if (gameInfo.modLoader) {
      parts.push(`${gameInfo.modLoader} ${gameInfo.mcVersion}`)
    } else {
      parts.push(`Vanilla ${gameInfo.mcVersion}`)
    }
    
    if (gameInfo.memoryAllocated && !this.privacySettings.hideModCount) {
      parts.push(`${gameInfo.memoryAllocated}MB RAM`)
    }
    
    return parts.join(" | ")
  }

  private buildPlayingStateString(gameInfo: GameInfo): string {
    const parts: string[] = []
    
    if (gameInfo.modLoader) {
      parts.push(`${gameInfo.modLoader} ${gameInfo.mcVersion}`)
    } else {
      parts.push(`Vanilla ${gameInfo.mcVersion}`)
    }
    
    // Add mod count
    if (gameInfo.modCount && gameInfo.modCount > 0 && !this.privacySettings.hideModCount) {
      parts.push(`${gameInfo.modCount} mods`)
    }
    
    // Add server info for multiplayer
    if (gameInfo.isMultiplayer && gameInfo.serverIp && !this.privacySettings.hideServerIp) {
      const serverStr = gameInfo.serverPort && gameInfo.serverPort !== 25565
        ? `${gameInfo.serverIp}:${gameInfo.serverPort}`
        : gameInfo.serverIp
      parts.push(`🌐 ${serverStr}`)
    }
    
    // Add player count
    if (gameInfo.currentPlayers && gameInfo.maxPlayers) {
      parts.push(`👥 ${gameInfo.currentPlayers}/${gameInfo.maxPlayers}`)
    }
    
    return parts.join(" | ")
  }

  private getLargeImageKey(gameInfo: GameInfo): string {
    // Use modpack icon if available
    if (gameInfo.modpackIcon) {
      return gameInfo.modpackIcon
    }
    // Use instance-specific icon naming convention
    return "minecraft"
  }

  private getSmallImageKey(gameInfo: GameInfo): string {
    if (gameInfo.modLoader) {
      const loaderKey = gameInfo.modLoader.toLowerCase()
      // Support for different modloaders
      const validKeys = ["forge", "fabric", "quilt", "neoforge"]
      return validKeys.includes(loaderKey) ? loaderKey : "vanilla"
    }
    return "vanilla"
  }

  private buildLargeImageText(gameInfo: GameInfo): string {
    if (gameInfo.modpackName) {
      return `${gameInfo.modpackName}${gameInfo.modpackVersion ? ` v${gameInfo.modpackVersion}` : ""}`
    }
    return `Minecraft ${gameInfo.mcVersion}`
  }

  private buildSmallImageText(gameInfo: GameInfo): string {
    if (gameInfo.modLoader) {
      const version = gameInfo.modLoaderVersion ? ` ${gameInfo.modLoaderVersion}` : ""
      return `${gameInfo.modLoader}${version}`
    }
    return "Vanilla Minecraft"
  }

  private formatPlaytime(seconds: number): string {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }

  private startPlaytimeTracking(): void {
    if (this.playtimeInterval) {
      clearInterval(this.playtimeInterval)
    }
    
    this.playtimeInterval = setInterval(() => {
      this.sessionPlaytime++
      
      // Update presence every minute
      if (this.sessionPlaytime % 60 === 0) {
        this.updatePlaytimePresence()
      }
    }, 1000)
  }

  private stopPlaytimeTracking(): void {
    if (this.playtimeInterval) {
      clearInterval(this.playtimeInterval)
      this.playtimeInterval = null
    }
  }

  private createJoinSecret(gameInfo: GameInfo): string {
    const data = {
      ip: gameInfo.serverIp,
      port: gameInfo.serverPort || 25565,
      version: gameInfo.mcVersion,
      instance: gameInfo.instanceId
    }
    return Buffer.from(JSON.stringify(data)).toString("base64")
  }

  private handleJoinRequest(secret: string): void {
    try {
      const data = JSON.parse(Buffer.from(secret, "base64").toString())
      logger.info("Join game data:", data)
      // Emit event for main process to handle
      // This would connect to the game server
    } catch (error) {
      logger.error("Failed to parse join secret:", error)
    }
  }

  // ============================================
  // PUBLIC API
  // ============================================

  /**
   * Update activity based on state string from backend
   */
  async updateActivity(state: string): Promise<void> {
    if (state.startsWith("playing:")) {
      try {
        const jsonData = state.substring(8)
        const gameInfo: GameInfo = JSON.parse(jsonData)
        await this.setPlayingPresence(gameInfo)
      } catch (error) {
        logger.warn("Failed to parse game info, using simple presence")
        await this.setPlayingPresence({
          instanceName: "Minecraft",
          instanceId: "unknown",
          mcVersion: "Unknown",
          isPlaying: true
        })
      }
    } else if (state.startsWith("downloading:")) {
      try {
        const jsonData = state.substring(12)
        const downloadInfo: DownloadInfo = JSON.parse(jsonData)
        await this.setDownloadingPresence(downloadInfo)
      } catch (error) {
        logger.warn("Failed to parse download info")
      }
    } else if (state.startsWith("installing:")) {
      try {
        const jsonData = state.substring(11)
        const { type, name } = JSON.parse(jsonData)
        await this.setInstallingPresence(type, name)
      } catch (error) {
        logger.warn("Failed to parse install info")
      }
    } else if (state.startsWith("launching:")) {
      try {
        const jsonData = state.substring(10)
        const gameInfo: GameInfo = JSON.parse(jsonData)
        await this.setLaunchingPresence(gameInfo)
      } catch (error) {
        logger.warn("Failed to parse launch info")
      }
    } else if (state === "browsing") {
      await this.setBrowsingPresence()
    } else if (state === "Playing Minecraft") {
      await this.setPlayingPresence({
        instanceName: "Minecraft",
        instanceId: "unknown",
        mcVersion: "Unknown",
        isPlaying: true
      })
    } else {
      logger.info(`Unknown activity state: ${state}`)
    }
  }

  /**
   * Clear the current presence
   */
  async stopActivity(): Promise<void> {
    if (!this.isConnected || !this.client) return

    this.stopPlaytimeTracking()

    try {
      await this.client.clearActivity()
      this.currentPresence = "idle"
      this.currentGameInfo = null
      this.currentDownloadInfo = null
      logger.info("Cleared activity")
      
      // Return to browsing presence
      await this.setBrowsingPresence()
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

    this.stopPlaytimeTracking()

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

  // ============================================
  // SETTINGS
  // ============================================

  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled
    if (!enabled) {
      this.shutdown()
    }
  }

  isEnabled_(): boolean {
    return this.isEnabled
  }

  isActive(): boolean {
    return this.isConnected
  }

  getPresenceState(): PresenceState {
    return this.currentPresence
  }

  getGameInfo(): GameInfo | null {
    return this.currentGameInfo
  }

  getSessionPlaytime(): number {
    return this.sessionPlaytime
  }

  setPrivacySettings(settings: Partial<PrivacySettings>): void {
    this.privacySettings = { ...this.privacySettings, ...settings }
    logger.info("Updated privacy settings:", this.privacySettings)
    
    // Refresh presence if currently playing
    if (this.currentPresence === "playing" && this.currentGameInfo) {
      this.setPlayingPresence(this.currentGameInfo)
    }
  }

  getPrivacySettings(): PrivacySettings {
    return { ...this.privacySettings }
  }

  setTheme(theme: Partial<PresenceTheme>): void {
    this.currentTheme = { ...this.currentTheme, ...theme }
    logger.info("Updated theme:", this.currentTheme)
  }

  addDisabledInstance(instanceId: string): void {
    if (!this.privacySettings.disabledInstances.includes(instanceId)) {
      this.privacySettings.disabledInstances.push(instanceId)
      logger.info(`Disabled RPC for instance: ${instanceId}`)
    }
  }

  removeDisabledInstance(instanceId: string): void {
    this.privacySettings.disabledInstances = this.privacySettings.disabledInstances.filter(
      id => id !== instanceId
    )
    logger.info(`Enabled RPC for instance: ${instanceId}`)
  }

  isInstanceDisabled(instanceId: string): boolean {
    return this.privacySettings.disabledInstances.includes(instanceId)
  }

  // ============================================
  // SCREENSHOT FEATURE
  // ============================================

  setScreenshotCallback(callback: () => Promise<Buffer | null>): void {
    this.screenshotCallback = callback
  }

  async takeScreenshot(): Promise<Buffer | null> {
    if (this.screenshotCallback) {
      return await this.screenshotCallback()
    }
    return null
  }
}

// Export singleton instance
export const discordRpcManager = new DiscordRPCManager()
