export type PageTitleInterface = {
  href: string
  title: string
}

export const PageTitleConfig: PageTitleInterface[] = [
  {
    href: "/login",
    title: "Login",
  },
  {
    href: "/mitre-attack-matrix",
    title: "MITRE ATT&CK Matrix",
  },
  { href: "/scan", title: "Scan IAM resources" },
  { href: "/history", title: "Scan history" },
  { href: "/aws/scan", title: "Scan IAM resources" },
  { href: "/aws/history", title: "Scan history" },
]
