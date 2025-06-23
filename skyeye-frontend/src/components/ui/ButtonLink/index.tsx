import { Button, ButtonProps } from "flowbite-react"

import LinkElement from "@/components/ui/LinkElement"

type ButtonLinkProps = ButtonProps & {
  href: string
}

export default function ButtonLink({ href, ...otherProps }: ButtonLinkProps) {
  return (
    <LinkElement href={href} passHref legacyBehavior>
      <Button {...otherProps} />
    </LinkElement>
  )
}
