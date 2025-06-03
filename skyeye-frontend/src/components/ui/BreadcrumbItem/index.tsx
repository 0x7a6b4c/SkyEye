import LinkElement from '@/components/ui/LinkElement'

export interface BreadcrumbItemProps {
  title: string
  className?: string
  href?: string
  onlyTitle?: boolean
}

export default function BreadcrumbItem({
  title,
  className = '',
  href = undefined,
  onlyTitle = false,
}: BreadcrumbItemProps) {
  return (
    <li className={className}>
      {href && !onlyTitle ? (
        <LinkElement className="text-blue-600" href={href}>
          {title}
        </LinkElement>
      ) : (
        title
      )}
    </li>
  )
}
