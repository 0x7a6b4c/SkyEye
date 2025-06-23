import Router from "next/router"

export const redirect = (uri: string) => {
  Router.push(uri, uri, { unstable_skipClientCache: true })
}
