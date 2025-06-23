import { useRouter } from 'next/router'
import { useEffect } from 'react'

interface ScrollTopProps {
  scrollTopId: string
}

export default function ScrollTop({ scrollTopId }: ScrollTopProps) {
  const { pathname } = useRouter()

  useEffect(() => {
    document.getElementById(scrollTopId)?.scrollTo(0, 0)
  }, [pathname])

  return null
}
