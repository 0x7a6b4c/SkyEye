import classNames from "classnames"
import { Alert, Spinner } from "flowbite-react"
import { PropsWithChildren, ReactNode } from "react"
import { HiInformationCircle } from "react-icons/hi"

import { LoadingStatus, RequestError } from "@/types/request"

type LoadHandlerProps = PropsWithChildren<{
  className?: string
  status?: LoadingStatus
  errors?: RequestError
  skeleton?: ReactNode
}>

export default function LoadHandler({
  children = undefined,
  className = "",
  errors = {},
  status,
  skeleton,
}: LoadHandlerProps) {
  return (
    <div
      className={classNames("w-full relative", className, {
        "animate-pulse pointer-events-none select-none": status === "pending",
      })}
    >
      {status === "failed" && (
        <Alert color="failure" icon={HiInformationCircle}>
          <span className="font-medium">{errors.message}</span>
        </Alert>
      )}
      {status !== "failed" && children}
      {status === "pending" &&
        (skeleton ? (
          <div>{skeleton}</div>
        ) : (
          <Spinner
            className="absolute top-2/4 left-[105px]"
            color={"gray"}
            aria-label="Loading"
          />
        ))}
    </div>
  )
}
