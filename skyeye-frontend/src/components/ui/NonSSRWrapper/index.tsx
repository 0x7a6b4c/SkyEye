import dynamic from 'next/dynamic'

interface NonSSRWrapperProps {
  children: React.ReactElement
}

function NonSSRWrapper({ children }: NonSSRWrapperProps) {
  return children
}

export default dynamic(() => Promise.resolve(NonSSRWrapper), {
  ssr: false,
})
