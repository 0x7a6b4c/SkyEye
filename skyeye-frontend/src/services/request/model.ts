import client from "@/services/request/client"
import {
  CreateParams,
  FilterParams,
  PaginationData,
  RequestError,
  UpdateParams,
} from "@/types/request/index"

export default abstract class Model<T, F = unknown> {
  protected abstract url: string

  create = (
    data: CreateParams<T>,
  ): Promise<[T | undefined, RequestError | undefined]> => {
    return client.post(this.url, data)
  }

  getOne = (
    id?: string,
    params?: FilterParams,
  ): Promise<[T | undefined, RequestError | undefined]> => {
    return client.get(`${this.url}${id ? `/${id}` : ""}`, params)
  }

  getAll = (
    params?: F,
  ): Promise<[PaginationData<T> | undefined, RequestError | undefined]> => {
    return client.get(this.url, params)
  }

  getAllNoPaginate = (
    params?: F,
  ): Promise<[T[] | undefined, RequestError | undefined]> => {
    return client.get(`${this.url}/all`, params)
  }

  update = (
    data: UpdateParams<T>,
    id?: string,
  ): Promise<[T | undefined, RequestError | undefined]> => {
    return client.put(`${this.url}${id ? `/${id}` : ""}`, data)
  }

  delete = (id: string): Promise<[undefined, RequestError | undefined]> => {
    return client.delete(`${this.url}/${id}`)
  }

  deleteMany = (
    ids: string[],
  ): Promise<[undefined, RequestError | undefined]> => {
    const query = ids.join(",")
    return client.delete(`${this.url}?ids=${query}`)
  }
}
