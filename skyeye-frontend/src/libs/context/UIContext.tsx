import classNames from "classnames"
import { Spinner } from "flowbite-react"
import { useRouter } from "next/router"
import React, {
  createContext,
  PropsWithChildren,
  ReactElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"

import NonSSRWrapper from "@/components/ui/NonSSRWrapper"

interface UIContextProps {
  showModal: (modal: ReactElement) => void
  hideModal: () => void
  showLoading: () => void
  hideLoading: () => void
}

const UIContext = createContext<UIContextProps | undefined>(undefined)

export const useUIProvider = (): UIContextProps => {
  const data = useContext<UIContextProps | undefined>(UIContext)
  if (data === undefined) {
    throw new Error("useUIProvider must be used within a UIProvider tag")
  }
  return data
}

export function UIProvider({ children }: PropsWithChildren) {
  const [modal, showModal] = useState<ReactElement | undefined>()
  const router = useRouter().route
  const [isLoading, showIsLoading] = useState(false)

  const hideModal = useCallback(() => {
    showModal(undefined)
  }, [showModal])

  const showLoading = useCallback(() => {
    showIsLoading(true)
  }, [showIsLoading])

  const hideLoading = useCallback(() => {
    showIsLoading(false)
  }, [showIsLoading])

  const uiProviderValue = useMemo(
    () => ({
      showModal,
      hideModal,
      showLoading,
      hideLoading,
    }),
    [showModal, hideModal, isLoading],
  )

  useEffect(() => {
    hideModal()
  }, [router])

  useEffect(() => {
    const body = document.querySelector("body")
    if (!modal && body) {
      body.style.overflow = "auto"
    }
  }, [modal])

  return (
    <UIContext.Provider value={uiProviderValue}>
      {children}
      {!!modal && <NonSSRWrapper>{modal}</NonSSRWrapper>}
      {isLoading && (
        <div
          className={classNames(
            "fixed top-0 left-0 z-[99999] flex h-full w-full items-center justify-center bg-[#0000004d]",
          )}
        >
          <Spinner className="flex w-full justify-center" />
        </div>
      )}
    </UIContext.Provider>
  )
}
