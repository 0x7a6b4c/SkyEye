import { useState } from "react"

import { toastError, toastSuccess } from "@/libs/helpers/toast"
import { LoadingStatus, RequestError } from "@/types/request"

const useDeleteManyQuery = (
  deleteManyHandler: (
    ids: string[],
  ) => Promise<[undefined, RequestError | undefined]>,
) => {
  const [loadingStatus, setLoadingStatus] = useState<LoadingStatus>("idle")
  const [errors, setErrors] = useState<RequestError | undefined>()

  const deleteMany = async (
    ids: string[],
  ): Promise<[undefined, RequestError | undefined]> => {
    setLoadingStatus("pending")
    const [responseData, responseErrors] = await deleteManyHandler(ids)

    if (responseErrors) {
      setErrors(responseErrors)
      setLoadingStatus("failed")
      if (responseErrors?.code !== "403") {
        toastError(responseErrors.message)
      }
    } else {
      setLoadingStatus("succeeded")
      toastSuccess("Successfully deleted!")
    }

    return [responseData, responseErrors]
  }

  return { deleteMany, loadingStatus, errors }
}

export default useDeleteManyQuery
