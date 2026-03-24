interface Props {
  children: any
}
const ModpackBrowserWrapper = (props: Props) => {
  return (
    <div class="text-lightSlate-50 bg-darkSlate-700 box-border flex h-full max-h-full w-full flex-1 justify-center p-5 pb-0">
      <div class="bg-darkSlate-800 relative box-border h-full w-full overflow-hidden rounded-2xl rounded-b-none">
        {props.children}
      </div>
    </div>
  )
}

export default ModpackBrowserWrapper
