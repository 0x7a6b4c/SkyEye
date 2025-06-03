import axios, {
  AxiosError,
  AxiosRequestConfig,
  AxiosRequestHeaders,
} from "axios"
import { getCookie } from "cookies-next"
import process from "process"
import { redirect } from "@/libs/helpers/router"
import { toastError } from "@/libs/helpers/toast"
import {
  ApiResponse,
  FilterParams,
  RequestError,
  RequestMethod,
} from "@/types/request"

const REQUEST_TIMEOUT = 30000

const instance = axios.create({
  timeout: REQUEST_TIMEOUT,
})

const getRequestHeaders = (): AxiosRequestHeaders => {
  const headers: { [key: string]: string } = {}
  const accessToken = getCookie("access_token")
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`
  }
  return headers as AxiosRequestHeaders
}

instance.interceptors.request.use(
  async (config) => {
    return {
      ...config,
      headers: {
        ...config.headers,
        ...getRequestHeaders(),
      } as AxiosRequestHeaders,
    }
  },
  (error) => Promise.reject(error),
)

instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error?.response?.status
    const errorData = error.response?.data

    if (status === 403) {
      toastError(errorData?.message)
      redirect("/dashboard")
    }

    return Promise.reject(error)
  },
)

const formatRequestParams = (params: FilterParams = {}) => {
  if (params === null) return params
  const { page, limit, order, sort, ...otherParams } = params
  return {
    _page: page,
    _limit: limit,
    _order: order,
    _sort: sort,
    ...Object.keys(otherParams)
      .filter(
        (key) =>
          otherParams[key] !== null &&
          otherParams[key] !== undefined &&
          otherParams[key] !== "",
      )
      .reduce((obj: FilterParams, key) => {
        // eslint-disable-next-line no-param-reassign
        obj[key] = otherParams[key]
        return obj
      }, {}),
  }
}

const baseRequest = async (
  url: string,
  method: RequestMethod,
  data: unknown = null,
  configs: AxiosRequestConfig = {},
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<[any, RequestError | undefined]> => {
  try {
    const baseUrl =
      process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_MOCK_API_URL

    const newConfigs = {
      ...configs,
      url: baseUrl + url,
      method,
    }

    if (method === "GET") {
      newConfigs.params = formatRequestParams(data as FilterParams)
    } else {
      newConfigs.data = data
    }

    const res = await instance.request(newConfigs)
    return [res.data.data || res.data, undefined]
  } catch (error) {
    const err = error as AxiosError
    const requestError: RequestError = {}

    if (err.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx

      const responseData = err.response.data as ApiResponse<unknown>
      requestError.message = responseData.message
      requestError.code = String(err.response.status)
      requestError.errors = responseData.errors
    } else if (err.request) {
      // The request was made but no response was received
      // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
      // http.ClientRequest in node.js
      requestError.message = err.message
    } else {
      // Something happened in setting up the request that triggered an Error
      requestError.message = err.message
    }

    return [undefined, requestError]
  }
}

export default baseRequest
