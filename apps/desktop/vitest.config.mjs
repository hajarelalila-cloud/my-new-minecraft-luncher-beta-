import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    globals: true,
    include: ["packages/**/*.{test,spec}.{ts,tsx}"],
    exclude: [
      "**/node_modules/**",
      "**/dist/**",
      "e2e-tests/**",
      "**/playwright-report/**",
      "**/test-results/**"
    ]
  }
})
