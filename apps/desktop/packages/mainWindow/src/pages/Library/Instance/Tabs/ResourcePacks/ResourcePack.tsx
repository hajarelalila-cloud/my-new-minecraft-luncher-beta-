import { Checkbox, Switch } from "@gd/ui"

interface IResourcePack {
  title: string
  enabled: boolean
  mcversion: string
  modloaderVersion: string
  resourcePackVersion: string
}

interface Props {
  resourcePack: IResourcePack
}

const ResourcePack = (props: Props) => {
  return (
    <div class="box-border flex h-14 w-full items-center py-2">
      <div class="flex w-full items-center justify-between gap-4">
        <div class="flex items-center justify-between gap-4">
          <Checkbox checked={true} disabled={false} />
          <div class="flex items-center gap-2">
            <div class="h-10 w-10 rounded-xl bg-green-500" />
            <div class="flex flex-col">
              {props.resourcePack.title}
              <div class="flex gap-2">
                <p class="text-lightSlate-700 m-0 text-sm">
                  {props.resourcePack.resourcePackVersion}
                </p>
              </div>
            </div>
          </div>
        </div>
        <Switch />
      </div>
    </div>
  )
}

export default ResourcePack
