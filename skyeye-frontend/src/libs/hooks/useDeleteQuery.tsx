import { useState } from "react"

import { toastError, toastSuccess } from "@/libs/helpers/toast"
import { LoadingStatus, RequestError } from "@/types/request"

const useDeleteQuery = (
  deleteHandler: (id: string) => Promise<[undefined, RequestError | undefined]>,
) => {
  const [loadingStatus, setLoadingStatus] = useState<LoadingStatus>("idle")
  const [errors, setErrors] = useState<RequestError | undefined>()

  const deleteOne = async (
    id: string,
  ): Promise<[undefined, RequestError | undefined]> => {
    setLoadingStatus("pending")
    const [responseData, responseErrors] = await deleteHandler(id)

    if (responseErrors) {
      setErrors(responseErrors)
      setLoadingStatus("failed")
      if (responseErrors?.code !== "403") {
        toastError(responseErrors.message)
      }
    } else {
      setLoadingStatus("succeeded")
      toastSuccess("Delete successful!")
    }

    return [responseData, responseErrors]
  }

  return { deleteOne, loadingStatus, errors }
}

export default useDeleteQuery
