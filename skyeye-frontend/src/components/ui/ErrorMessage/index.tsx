import classNames from "classnames"

interface ErrorMessageProps {
  className?: string
  message?: string
}

export default function ErrorMessage({
  className = "",
  message,
}: ErrorMessageProps) {
  return message ? (
    <p className={classNames("text-sm text-red-600", className)}>{message}</p>
  ) : null
}
