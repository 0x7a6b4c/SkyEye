export type RequestMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH"

export interface PaginationData<T> {
  records: T[]
  page: number
  limit: number
  total: number
}

export interface ApiResponse<T> {
  status: boolean
  data: T
  message?: string
  errors?: {
    [key: string]: string
  }
}

export interface RequestError {
  message?: string
  code?: string
  errors?: {
    [key: string]: string
  }
}

export interface FilterParams {
  q?: string
  page?: number
  limit?: number
  sort?: string
  order?: OrderType
  reseller_brand_id?: string
  [key: string]: string | number | undefined | number[] | string[]
}

export type CreateParams<T> = Omit<T, "id">

export type UpdateParams<T> = Partial<Omit<T, "id">>

export type LoadingStatus = "idle" | "pending" | "succeeded" | "failed"

export type OrderType = "asc" | "desc"
