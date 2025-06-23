import { Id, toast, ToastContent, ToastOptions } from "react-toastify"

const defaultOptions = {
  delay: 100,
}

export const toastSuccess: <TData = unknown>(
  content: ToastContent<TData>,
  options?: ToastOptions<TData>,
) => Id = (content, options = {}) => {
  return toast(content, {
    ...defaultOptions,
    autoClose: 10000,
    ...options,
    type: "success",
  })
}

export const toastInfo: <TData = unknown>(
  content: ToastContent<TData>,
  options?: ToastOptions<TData>,
) => Id = (content, options = {}) => {
  return toast(content, { ...defaultOptions, ...options, type: "info" })
}

export const toastWarning: <TData = unknown>(
  content: ToastContent<TData>,
  options?: ToastOptions<TData>,
) => Id = (content, options = {}) => {
  return toast(content, { ...defaultOptions, ...options, type: "warning" })
}

export const toastError: <TData = unknown>(
  content: ToastContent<TData>,
  options?: ToastOptions<TData>,
) => Id = (content, options = {}) => {
  return toast(content, { ...defaultOptions, ...options, type: "error" })
}
