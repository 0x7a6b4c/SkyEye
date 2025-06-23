import { Flowbite, ThemeProps } from 'flowbite-react'
import { PropsWithChildren } from 'react'

import flowbiteTheme from '@/configs/theme'

const FlowbiteContext = ({ children = undefined }: PropsWithChildren) => {
  return (
    <Flowbite theme={{ theme: flowbiteTheme } as ThemeProps}>
      {children}
    </Flowbite>
  )
}

export default FlowbiteContext
