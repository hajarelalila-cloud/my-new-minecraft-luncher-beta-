import { createFileRoute } from "@tanstack/solid-router"
import { createSignal, For } from "solid-js"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem
} from "../../../../src"
import ComponentDemo from "../../components/ComponentDemo"

export const Route = createFileRoute("/components/dropdown")({
  component: DropdownPage
})

function DropdownPage() {
  const basicOptions = [
    { label: "Option 1", key: "1" },
    { label: "Option 2", key: "2" },
    { label: "Option 3", key: "3" }
  ]

  const fruitOptions = [
    { label: "Apple", key: "apple" },
    { label: "Banana", key: "banana" },
    { label: "Orange", key: "orange" },
    { label: "Grape", key: "grape" },
    { label: "Strawberry", key: "strawberry" }
  ]

  const [selectedValue, setSelectedValue] = createSignal("apple")

  return (
    <div class="max-w-4xl">
      <div class="mb-8">
        <h1 class="text-4xl font-bold text-gray-900 mb-4">Dropdown</h1>
        <p class="text-xl text-gray-600">
          Interactive dropdown component with various configurations and
          options.
        </p>
      </div>

      <ComponentDemo
        title="Basic Dropdown"
        description="Simple dropdown with basic options"
      >
        <DropdownMenu>
          <DropdownMenuTrigger>Select an option</DropdownMenuTrigger>
          <DropdownMenuContent>
            <For each={basicOptions}>
              {(option) => <DropdownMenuItem>{option.label}</DropdownMenuItem>}
            </For>
          </DropdownMenuContent>
        </DropdownMenu>
      </ComponentDemo>

      <ComponentDemo
        title="Dropdown with Selection"
        description="Dropdown with selected value display"
      >
        <div class="space-y-4">
          <DropdownMenu>
            <DropdownMenuTrigger>
              {selectedValue() || "Select a fruit..."}
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <For each={fruitOptions}>
                {(option) => (
                  <DropdownMenuItem
                    onSelect={() => setSelectedValue(option.key)}
                  >
                    {option.label}
                  </DropdownMenuItem>
                )}
              </For>
            </DropdownMenuContent>
          </DropdownMenu>
          <div class="text-gray-600">Selected: {selectedValue()}</div>
        </div>
      </ComponentDemo>
    </div>
  )
}
