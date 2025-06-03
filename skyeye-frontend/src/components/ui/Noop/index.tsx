interface NoopProps {
  children: React.ReactNode
}

export default function Noop({ children }: NoopProps) {
  return children
}
