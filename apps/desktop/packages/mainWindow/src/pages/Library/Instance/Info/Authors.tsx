import { Show, createMemo } from "solid-js"
import {
  CFFEModAuthor,
  FEModResponse,
  MRFEProject,
  MRFETeamMember
} from "@gd/core_module/bindings"
import { rspc } from "@/utils/rspcClient"
import AuthorAvatars, { Author } from "@/components/AuthorAvatars"
import { AuthorsSkeleton } from "@gd/ui"

interface Props {
  modpackDetails: FEModResponse | MRFEProject | undefined
  isCurseforge: boolean
  isModrinth: boolean
}

const Authors = (props: Props) => {
  const teamId = () => {
    if (props.isModrinth && props.modpackDetails) {
      return (props.modpackDetails as MRFEProject)?.team
    }
    return null
  }

  // Use rspc query hook for automatic caching and deduplication
  const modrinthTeam = rspc.createQuery(() => ({
    queryKey: ["modplatforms.modrinth.getTeam", teamId() ?? ""],
    enabled: teamId() !== null
  }))

  const getAuthors = () => {
    if (props.isCurseforge && props.modpackDetails) {
      const modpack = props.modpackDetails as FEModResponse
      return modpack.data?.authors
    } else if (props.isModrinth && modrinthTeam.data) {
      return modrinthTeam.data
    }

    return []
  }

  const isLoading = () => props.isModrinth && modrinthTeam.isLoading

  const normalizedAuthors = createMemo((): Author[] => {
    const rawAuthors = getAuthors()
    if (!rawAuthors) return []

    if (props.isCurseforge) {
      return (rawAuthors as CFFEModAuthor[]).map((author) => ({
        name: author.name,
        avatarUrl: author.avatarUrl,
        url: author.url,
        id: author.id,
        platform: "curseforge" as const
      }))
    } else if (props.isModrinth) {
      return (rawAuthors as MRFETeamMember[]).map((member) => ({
        name: member.user.name || member.user.username,
        avatarUrl: member.user.avatar_url,
        role: member.role,
        id: member.user.id,
        platform: "modrinth" as const
      }))
    }

    return []
  })

  return (
    <Show
      when={!isLoading() && normalizedAuthors().length > 0}
      fallback={
        <Show when={isLoading()}>
          <AuthorsSkeleton count={3} size="md" />
        </Show>
      }
    >
      <AuthorAvatars authors={normalizedAuthors()} maxDisplay={4} />
    </Show>
  )
}

export default Authors
