import { ModalProps } from "../../"
import ModalLayout from "../../ModalLayout"
import { Trans } from "@gd/i18n"
import { createSignal, onMount, onCleanup, Show, For } from "solid-js"
import { Button } from "@gd/ui"
import { rspc } from "@/utils/rspcClient"

type PCPerformance = "low" | "medium" | "high" | null

interface FeatureItem {
  icon: string
  title: string
  description: string
  color: string
}

const features: FeatureItem[] = [
  { icon: "i-hugeicons:game-controller", title: "Minecraft", description: "All versions supported", color: "from-green-500 to-emerald-600" },
  { icon: "i-hugeicons:cube-01", title: "Modpacks", description: "One-click install", color: "from-blue-500 to-cyan-600" },
  { icon: "i-hugeicons:java", title: "Java Manager", description: "Auto Java setup", color: "from-orange-500 to-amber-600" },
  { icon: "i-hugeicons:cloud-download", title: "CurseForge", description: "Direct integration", color: "from-red-500 to-rose-600" },
  { icon: "i-hugeicons:user", title: "Offline Mode", description: "No login required", color: "from-purple-500 to-violet-600" },
  { icon: "i-hugeicons:server", title: "Servers", description: "Quick connect", color: "from-indigo-500 to-blue-600" },
  { icon: "i-hugeicons:archive", title: "Backups", description: "Auto-save your progress", color: "from-teal-500 to-cyan-600" },
  { icon: "i-hugeicons:ai-magic", title: "Smart Analysis", description: "Crash diagnostics", color: "from-pink-500 to-rose-600" },
]

const NokiatisWelcome = (props: ModalProps) => {
  const [isVisible, setIsVisible] = createSignal(false)
  const [animationPhase, setAnimationPhase] = createSignal(0)
  const [particleIndex, setParticleIndex] = createSignal(0)
  const [selectedPerformance, setSelectedPerformance] = createSignal<PCPerformance>(null)
  const [showPerformanceSelector, setShowPerformanceSelector] = createSignal(true)
  const [isSaving, setIsSaving] = createSignal(false)
  const [hoveredFeature, setHoveredFeature] = createSignal<number | null>(null)
  const [skipAnimations, setSkipAnimations] = createSignal(false)

  // Mutation for saving performance setting
  const setPerformanceMutation = rspc.createMutation(() => ({
    mutationKey: ["settings.setSettings"]
  }))

  // Particle animation interval
  let particleInterval: number | undefined

  // Reduced animations based on performance
  const getAnimationDuration = () => {
    const perf = selectedPerformance()
    switch (perf) {
      case "low": return 0 // No animations
      case "medium": return 1.5 // Slower animations
      case "high": return 1 // Normal speed
      default: return 1
    }
  }

  onMount(() => {
    // Start animations
    setTimeout(() => setIsVisible(true), 100)
  })

  onCleanup(() => {
    if (particleInterval) clearInterval(particleInterval)
  })

  const startAnimations = () => {
    const duration = getAnimationDuration()
    if (duration === 0 || skipAnimations()) {
      // Low end or skip - go directly to final phase
      setAnimationPhase(4)
      return
    }

    setTimeout(() => setAnimationPhase(1), 400 * duration)
    setTimeout(() => setAnimationPhase(2), 800 * duration)
    setTimeout(() => setAnimationPhase(3), 1200 * duration)
    setTimeout(() => setAnimationPhase(4), 1600 * duration)

    // Particle effect only for high end
    if (selectedPerformance() === "high") {
      particleInterval = setInterval(() => {
        setParticleIndex((prev) => (prev + 1) % 20)
      }, 100)
    }
  }

  const handlePerformanceSelect = (perf: PCPerformance) => {
    setSelectedPerformance(perf)
  }

  const handleSkipPerformance = () => {
    setSelectedPerformance("medium")
    setSkipAnimations(true)
    setShowPerformanceSelector(false)
    setAnimationPhase(4)
  }

  const handleContinue = async () => {
    if (showPerformanceSelector()) {
      setShowPerformanceSelector(false)
      startAnimations()
      return
    }

    setIsSaving(true)
    try {
      // Save performance setting
      await setPerformanceMutation.mutateAsync({
        key: "animationPerformance",
        value: selectedPerformance() || "medium"
      })

      if (props.closeModal) {
        props.closeModal()
      }
    } catch (err) {
      console.error("Failed to save settings:", err)
    } finally {
      setIsSaving(false)
    }
  }

  const discordUrl = "https://discord.gg/FXn5zfEqBD"

  return (
    <ModalLayout
      noHeader={true}
      noPadding
      height="h-auto"
      width="w-[720px] max-w-[95vw]"
    >
      <style>
        {`
          @keyframes gradientShift {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
          }
          @keyframes floatAnimation {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
          }
          @keyframes pulseGlow {
            0%, 100% { box-shadow: 0 0 20px rgba(139, 92, 246, 0.3), 0 0 40px rgba(139, 92, 246, 0.1); }
            50% { box-shadow: 0 0 40px rgba(139, 92, 246, 0.6), 0 0 80px rgba(139, 92, 246, 0.3); }
          }
          @keyframes shimmer {
            0% { background-position: -200% center; }
            100% { background-position: 200% center; }
          }
          @keyframes borderGlow {
            0%, 100% { border-color: rgba(139, 92, 246, 0.3); }
            50% { border-color: rgba(139, 92, 246, 0.8); }
          }
          @keyframes particleFloat {
            0% { transform: translateY(0) translateX(0); opacity: 0; }
            10% { opacity: 1; }
            90% { opacity: 1; }
            100% { transform: translateY(-100px) translateX(20px); opacity: 0; }
          }
          @keyframes scaleIn {
            from { transform: scale(0.9); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
          }
          @keyframes slideUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes slideInLeft {
            from { opacity: 0; transform: translateX(-20px); }
            to { opacity: 1; transform: translateX(0); }
          }
          @keyframes slideInRight {
            from { opacity: 0; transform: translateX(20px); }
            to { opacity: 1; transform: translateX(0); }
          }
          @keyframes rotate {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
          @keyframes bounceIn {
            0% { transform: scale(0.3); opacity: 0; }
            50% { transform: scale(1.05); }
            70% { transform: scale(0.9); }
            100% { transform: scale(1); opacity: 1; }
          }
          @keyframes slideUpFade {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes glowPulse {
            0%, 100% { filter: drop-shadow(0 0 8px rgba(139, 92, 246, 0.4)); }
            50% { filter: drop-shadow(0 0 16px rgba(139, 92, 246, 0.8)); }
          }
          
          .gradient-bg {
            background: linear-gradient(-45deg, #1e1b4b, #4c1d95, #5b21b6, #6d28d9, #7c3aed, #4c1d95);
            background-size: 400% 400%;
            animation: gradientShift 8s ease infinite;
          }
          .gradient-bg-static {
            background: linear-gradient(135deg, #1e1b4b, #4c1d95, #5b21b6);
          }
          .float-animation { animation: floatAnimation 3s ease-in-out infinite; }
          .pulse-glow { animation: pulseGlow 2s ease-in-out infinite; }
          .shimmer-text {
            background: linear-gradient(90deg, #ffffff 0%, #c4b5fd 25%, #ffffff 50%, #c4b5fd 75%, #ffffff 100%);
            background-size: 200% auto;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            animation: shimmer 3s linear infinite;
          }
          .border-glow { animation: borderGlow 2s ease-in-out infinite; }
          .particle { animation: particleFloat 3s ease-out infinite; }
          .glass-effect {
            background: rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
          }
          .scale-in { animation: scaleIn 0.3s ease-out forwards; }
          .slide-up { animation: slideUp 0.5s ease-out forwards; }
          .slide-in-left { animation: slideInLeft 0.4s ease-out forwards; }
          .slide-in-right { animation: slideInRight 0.4s ease-out forwards; }
          .bounce-in { animation: bounceIn 0.6s ease-out forwards; }
          .slide-up-fade { animation: slideUpFade 0.5s ease-out forwards; }
          .glow-pulse { animation: glowPulse 2s ease-in-out infinite; }
          
          .performance-card {
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          }
          .performance-card:hover {
            transform: translateY(-6px) scale(1.02);
          }
          .performance-card.selected {
            border-color: rgba(139, 92, 246, 0.8);
            background: rgba(139, 92, 246, 0.15);
            transform: translateY(-6px) scale(1.02);
          }
          
          .feature-card {
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          }
          .feature-card:hover {
            transform: translateY(-4px) scale(1.05);
          }
          
          .discord-btn {
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          }
          .discord-btn:hover {
            transform: translateY(-2px) scale(1.02);
            box-shadow: 0 8px 25px rgba(88, 101, 242, 0.4);
          }
          
          .step-indicator {
            transition: all 0.3s ease;
          }
          
          .background-blur-circle {
            filter: blur(60px);
          }
        `}
      </style>

      <div class="relative overflow-hidden rounded-xl">
        {/* Animated background - static for low end */}
        <Show when={selectedPerformance() !== "low"} fallback={<div class="gradient-bg-static absolute inset-0 opacity-90" />}>
          <div class="gradient-bg absolute inset-0 opacity-90" />
        </Show>

        {/* Decorative elements - only for high end */}
        <Show when={selectedPerformance() === "high" && !showPerformanceSelector()}>
          {/* Rotating circles */}
          <div class="rotate-slow absolute -right-32 -top-32 h-96 w-96 rounded-full bg-purple-500/10 background-blur-circle" style="animation: rotate 30s linear infinite;" />
          <div class="rotate-slow absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-violet-400/10 background-blur-circle" style="animation: rotate 25s linear infinite reverse;" />
          <div class="rotate-slow absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-indigo-500/5 background-blur-circle" style="animation: rotate 40s linear infinite;" />
          
          {/* Floating particles */}
          <For each={[...Array(8)]}>
            {(_, i) => (
              <div 
                class="particle absolute h-1.5 w-1.5 rounded-full bg-white/40"
                style={`left: ${10 + i() * 12}%; top: ${20 + (i() % 3) * 20}%; animation-delay: ${i() * 0.2}s;`}
              />
            )}
          </For>
        </Show>

        {/* Content */}
        <div class="relative z-10 p-8 text-center">
          {/* Step indicator */}
          <div class="flex justify-center gap-2 mb-6">
            <div class={`step-indicator h-2 w-12 rounded-full ${showPerformanceSelector() ? 'bg-white' : 'bg-white/30'}`} />
            <div class={`step-indicator h-2 w-12 rounded-full ${!showPerformanceSelector() ? 'bg-white' : 'bg-white/30'}`} />
          </div>

          {/* Logo/Icon */}
          <div
            class={`mx-auto mb-6 transition-all duration-700 ${
              isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
            } ${selectedPerformance() === "high" && !showPerformanceSelector() ? 'float-animation' : ''}`}
          >
            <div class={`mx-auto flex h-28 w-28 items-center justify-center rounded-3xl overflow-hidden ${selectedPerformance() === "high" && !showPerformanceSelector() ? 'pulse-glow glow-pulse' : ''}`}>
              <img 
                src="data:image/png;base64,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" 
                alt="Nokiatis Launcher" 
                class="h-28 w-28 object-contain"
              />
            </div>
          </div>

          {/* Title */}
          <div class={`transition-all duration-700 ${showPerformanceSelector() || animationPhase() >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <h1 class="mb-2 text-5xl font-bold text-white tracking-tight">
              <Show when={selectedPerformance() !== "low" || !showPerformanceSelector()} fallback={<span>Nokiatis Launcher</span>}>
                <span class="shimmer-text">Nokiatis Launcher</span>
              </Show>
            </h1>
            <div class="mb-6 text-sm font-medium text-purple-200/80">
              Your Ultimate Minecraft Experience • Version {__APP_VERSION__}
            </div>
          </div>

          {/* Performance Selector */}
          <Show when={showPerformanceSelector()}>
            <div class="scale-in">
              <p class="mb-6 text-lg text-purple-100">
                Choose your PC performance level for the best experience
              </p>
              
              <div class="mb-8 grid grid-cols-3 gap-4">
                {/* Low End */}
                <div
                  class={`performance-card cursor-pointer rounded-2xl border-2 p-5 text-center ${
                    selectedPerformance() === "low" ? 'selected border-glow' : 'border-white/10 bg-white/5 hover:bg-white/10'
                  }`}
                  onClick={() => handlePerformanceSelect("low")}
                >
                  <div class="mb-3 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 mx-auto shadow-lg shadow-green-500/20">
                    <div class="i-hugeicons:cpu h-7 w-7 text-white" />
                  </div>
                  <h3 class="mb-1 font-bold text-white text-lg">Low End</h3>
                  <p class="text-sm text-purple-200/70">No animations</p>
                  <p class="text-xs text-purple-200/50 mt-1">Best for older PCs</p>
                </div>

                {/* Medium */}
                <div
                  class={`performance-card cursor-pointer rounded-2xl border-2 p-5 text-center ${
                    selectedPerformance() === "medium" ? 'selected border-glow' : 'border-white/10 bg-white/5 hover:bg-white/10'
                  }`}
                  onClick={() => handlePerformanceSelect("medium")}
                >
                  <div class="mb-3 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 mx-auto shadow-lg shadow-blue-500/20">
                    <div class="i-hugeicons:cpu-core h-7 w-7 text-white" />
                  </div>
                  <h3 class="mb-1 font-bold text-white text-lg">Medium</h3>
                  <p class="text-sm text-purple-200/70">Reduced animations</p>
                  <p class="text-xs text-purple-200/50 mt-1">Balanced experience</p>
                </div>

                {/* High End */}
                <div
                  class={`performance-card cursor-pointer rounded-2xl border-2 p-5 text-center ${
                    selectedPerformance() === "high" ? 'selected border-glow' : 'border-white/10 bg-white/5 hover:bg-white/10'
                  }`}
                  onClick={() => handlePerformanceSelect("high")}
                >
                  <div class="mb-3 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 mx-auto shadow-lg shadow-violet-500/20">
                    <div class="i-hugeicons:cpu-bolt h-7 w-7 text-white" />
                  </div>
                  <h3 class="mb-1 font-bold text-white text-lg">High End</h3>
                  <p class="text-sm text-purple-200/70">Full animations</p>
                  <p class="text-xs text-purple-200/50 mt-1">Best experience</p>
                </div>
              </div>

              <div class="flex gap-3">
                <Button
                  class="flex-1 !bg-white/5 hover:!bg-white/10 !text-white/70 hover:!text-white !border-white/10 transition-all duration-300"
                  onClick={handleSkipPerformance}
                >
                  Skip for Now
                </Button>
                <Button
                  class="flex-1 !bg-gradient-to-r !from-purple-600 !to-violet-600 hover:!from-purple-500 hover:!to-violet-500 !text-white !border-white/20 transition-all duration-300 hover:scale-105"
                  onClick={handleContinue}
                  disabled={!selectedPerformance()}
                >
                  <div class="flex items-center justify-center gap-2">
                    <span class="text-base font-semibold">Continue</span>
                    <div class="i-hugeicons:arrow-right-01 h-5 w-5" />
                  </div>
                </Button>
              </div>
            </div>
          </Show>

          {/* Main content after performance selection */}
          <Show when={!showPerformanceSelector()}>
            <div class={`transition-all duration-700 ${animationPhase() >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <p class="mb-4 text-xl text-purple-100">
                This launcher is made with ❤️ by
              </p>
              <div class="mb-6 inline-flex items-center gap-3 rounded-full bg-white/10 px-8 py-4 backdrop-blur-sm border border-white/20 border-glow">
                <div class="flex h-14 w-14 items-center justify-center rounded-full overflow-hidden shadow-lg shadow-violet-500/30">
                  <img 
                    src="data:image/png;base64,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" 
                    alt="Nokiatis" 
                    class="h-14 w-14 object-contain"
                  />
                </div>
                <span class="text-3xl font-bold text-white">Nokiatis Team</span>
              </div>
            </div>

            {/* Credits section */}
            <div class={`mb-6 transition-all duration-700 ${animationPhase() >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <p class="mb-4 text-sm font-medium text-purple-200/80 uppercase tracking-wider">
                Credits & Contributions
              </p>
              <div class="flex flex-wrap justify-center gap-3">
                <div class="glass-effect rounded-xl border border-white/10 px-5 py-3 text-left hover:bg-white/10 transition-all duration-300 hover:scale-105">
                  <div class="flex items-center gap-3">
                    <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-violet-600">
                      <div class="i-hugeicons:code h-5 w-5 text-white" />
                    </div>
                    <div>
                      <div class="text-sm font-semibold text-white">Lead Developer</div>
                      <div class="text-xs text-purple-200/70">Nokiatis Team</div>
                    </div>
                  </div>
                </div>
                <div class="glass-effect rounded-xl border border-white/10 px-5 py-3 text-left hover:bg-white/10 transition-all duration-300 hover:scale-105">
                  <div class="flex items-center gap-3">
                    <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600">
                      <div class="i-hugeicons:paint-brush-01 h-5 w-5 text-white" />
                    </div>
                    <div>
                      <div class="text-sm font-semibold text-white">UI/UX Design</div>
                      <div class="text-xs text-purple-200/70">Nokiatis Team</div>
                    </div>
                  </div>
                </div>
                <div class="glass-effect rounded-xl border border-white/10 px-5 py-3 text-left hover:bg-white/10 transition-all duration-300 hover:scale-105">
                  <div class="flex items-center gap-3">
                    <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600">
                      <div class="i-hugeicons:star h-5 w-5 text-white" />
                    </div>
                    <div>
                      <div class="text-sm font-semibold text-white">Project Manager</div>
                      <div class="text-xs text-purple-200/70">Nokiatis Team</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Discord Button */}
            <div class={`mb-6 transition-all duration-700 ${animationPhase() >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <a
                href={discordUrl}
                target="_blank"
                rel="noopener noreferrer"
                class="discord-btn inline-flex items-center gap-3 rounded-xl bg-[#5865F2]/20 border border-[#5865F2]/40 px-6 py-3 text-white hover:bg-[#5865F2]/30 cursor-pointer"
              >
                <div class="i-hugeicons:discord h-7 w-7" />
                <div class="text-left">
                  <div class="text-base font-semibold">Join our Discord Server!</div>
                  <div class="text-xs text-purple-200/70">Get help, share, and connect with the community</div>
                </div>
                <div class="i-hugeicons:arrow-right-01 h-5 w-5 ml-2" />
              </a>
            </div>

            {/* Features Grid */}
            <div class={`mb-8 transition-all duration-700 ${animationPhase() >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <p class="mb-4 text-sm font-medium text-purple-200/80 uppercase tracking-wider">
                Features
              </p>
              <div class="grid grid-cols-4 gap-2">
                <For each={features}>
                  {(feature, index) => (
                    <div
                      class={`feature-card rounded-lg bg-white/5 border border-white/10 p-3 text-center cursor-pointer hover:bg-white/10 ${
                        hoveredFeature() === index() ? 'bg-white/15' : ''
                      }`}
                      onMouseEnter={() => setHoveredFeature(index())}
                      onMouseLeave={() => setHoveredFeature(null)}
                      style={`animation-delay: ${index() * 0.05}s;`}
                    >
                      <div class={`flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br ${feature.color} mx-auto mb-2 shadow-lg`}>
                        <div class={`${feature.icon} h-4 w-4 text-white`} />
                      </div>
                      <div class="text-xs font-medium text-white truncate">{feature.title}</div>
                      <Show when={hoveredFeature() === index()}>
                        <div class="text-xs text-purple-200/70 mt-0.5 truncate">{feature.description}</div>
                      </Show>
                    </div>
                  )}
                </For>
              </div>
            </div>

            {/* Continue button */}
            <div class={`transition-all duration-700 ${animationPhase() >= 4 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <Button
                class="w-full !bg-gradient-to-r !from-purple-600 !to-violet-600 hover:!from-purple-500 hover:!to-violet-500 !text-white !border-white/20 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/30"
                onClick={handleContinue}
                loading={isSaving()}
                disabled={isSaving()}
              >
                <div class="flex items-center justify-center gap-2">
                  <span class="text-lg font-semibold">Start Your Adventure</span>
                  <div class="i-hugeicons:arrow-right-01 h-6 w-6" />
                </div>
              </Button>
            </div>

            {/* Footer */}
            <div class={`mt-6 transition-all duration-700 ${animationPhase() >= 4 ? 'opacity-100' : 'opacity-0'}`}>
              <p class="text-xs text-purple-200/60">
                © 2024 Nokiatis Team. All rights reserved.
              </p>
              <p class="mt-2 text-xs text-purple-200/40">
                Made with love for the Minecraft community
              </p>
            </div>
          </Show>
        </div>
      </div>
    </ModalLayout>
  )
}

export default NokiatisWelcome
