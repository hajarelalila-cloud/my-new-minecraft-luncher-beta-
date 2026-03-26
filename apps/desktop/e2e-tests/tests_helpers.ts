export const getActualUrl = (url: string) => {
  const split = url.split("index.html#")
  const { pathname, search } = new URL(`http://bruh.nokiatis-launcher.com${split[1]}`)
  return `${pathname}${search}`
}
