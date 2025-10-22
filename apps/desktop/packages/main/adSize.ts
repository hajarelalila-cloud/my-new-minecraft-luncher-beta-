import { screen, Display } from "electron"

export default function getAdSize(display?: Display) {
  // Showcase mode - 4:3 aspect ratio with no ads
  if (__SHOWCASE_MODE__) {
    return {
      minWidth: 1280,
      minHeight: 960,
      width: 1280,
      height: 960,
      adSize: {
        useFallbackAd: false,
        useVertical: false,
        width: 0,
        height: 0,
        shouldShow: false
      }
    }
  }

  const primaryDisplay = display || screen.getPrimaryDisplay()
  const { width, height } = primaryDisplay.size

  if (width < 1920 || height < 1080) {
    return {
      minWidth: width < 1024 ? width - 100 : 1024,
      minHeight: height < 790 ? height - 100 : 790,
      width: width < 1024 ? width - 100 : 1024,
      height: height < 790 ? height - 100 : 790,
      adSize: {
        useFallbackAd: false,
        useVertical: true,
        width: 160,
        height: 600,
        shouldShow: true
      }
    }
  } else {
    return {
      minWidth: 1280,
      minHeight: 790,
      width: 1600,
      height: 790,
      adSize: {
        useFallbackAd: false,
        useVertical: false,
        width: 400,
        height: 600,
        shouldShow: true
      }
    }
  }
}
