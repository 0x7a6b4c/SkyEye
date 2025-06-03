/* eslint-disable @typescript-eslint/no-explicit-any */
import "@/styles/globals.css"
import "react-toastify/dist/ReactToastify.css"
import type { AppProps } from "next/app"
import Head from "next/head"
import { useRouter } from "next/router"
import { ToastContainer } from "react-toastify"

import Noop from "@/components/ui/Noop"
import { PageTitleConfig } from "@/configs/pageTitle"
import FlowbiteContext from "@/libs/context/FlowbiteContext"
import { UIProvider } from "@/libs/context/UIContext"
import { ReactFlowProvider } from "reactflow"
import { ScanHistoryProvider } from '@/libs/context/ScanHistoryContext';

export default function App({ Component, pageProps }: AppProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Layout = (Component as any).Layout || Noop

  const { LayoutConfigs } = Component as any
  const router = useRouter().route
  let title

  const currentTitleArr = PageTitleConfig.filter((item) => item.href === router)

  if (currentTitleArr && currentTitleArr.length > 0) {
    title = currentTitleArr[0].title
  }

  return (
    <>
      <FlowbiteContext>
        <ReactFlowProvider>
          <UIProvider>
            <ScanHistoryProvider>
              <Head>
                <title>{!title ? "" : `${title}`}</title>
              </Head>
              <Layout pageProps={pageProps} configs={LayoutConfigs}>
                <Component {...pageProps} />
              </Layout>
            </ScanHistoryProvider>
          </UIProvider>
        </ReactFlowProvider>
      </FlowbiteContext>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </>
  )
}
