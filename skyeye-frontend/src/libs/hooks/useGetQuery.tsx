import { useEffect, useState } from "react"

import { LoadingStatus, RequestError } from "@/types/request"

const useGetQuery = <TP, TR>(
  getHandler: (
    params: TP,
  ) => Promise<[TR | undefined, RequestError | undefined]>,
  params: TP,
) => {
  const [loadingStatus, setLoadingStatus] = useState<LoadingStatus>("idle")
  const [data, setData] = useState<TR | undefined>()
  const [errors, setErrors] = useState<RequestError | undefined>()

  const fetchData = async () => {
    setLoadingStatus("pending")
    const [responseData, responseErrors] = await getHandler(params)

    if (responseErrors) {
      setErrors(responseErrors)
      setLoadingStatus("failed")
    } else {
      setData(responseData)
      setLoadingStatus("succeeded")
    }
  }

  useEffect(() => {
    fetchData()
  }, [params])

  return { loadingStatus, data, errors, fetchData }
}

export default useGetQuery
