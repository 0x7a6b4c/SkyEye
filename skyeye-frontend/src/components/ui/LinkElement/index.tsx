import Link, { LinkProps } from 'next/link'

type LinkElementProps = Omit<
  React.AnchorHTMLAttributes<HTMLAnchorElement>,
  keyof LinkProps
> &
  LinkProps & {
    children?: React.ReactNode
  } & React.RefAttributes<HTMLAnchorElement>

export default function LinkElement(props: LinkElementProps) {
  return <Link {...props} locale={false} />
}
