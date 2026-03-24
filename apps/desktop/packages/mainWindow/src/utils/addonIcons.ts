import { FEUnifiedSearchType, AddonType } from "@gd/core_module/bindings"

/**
 * Get the icon class for an addon type
 * Provides consistent icon mapping across the entire application
 */
export function getAddonTypeIcon(
  type: FEUnifiedSearchType | AddonType
): string {
  const iconMap: Record<string, string> = {
    mod: "i-hugeicons:cube",
    mods: "i-hugeicons:cube",
    modpack: "i-hugeicons:ice-cubes",
    shader: "i-hugeicons:3-d-view",
    shaders: "i-hugeicons:3-d-view",
    resourcePack: "i-hugeicons:cap",
    resourcepacks: "i-hugeicons:cap",
    world: "i-hugeicons:globe",
    worlds: "i-hugeicons:globe",
    datapack: "i-hugeicons:package",
    datapacks: "i-hugeicons:package"
  }

  return iconMap[type] || "i-hugeicons:folder-01"
}
