/* eslint-disable @typescript-eslint/no-explicit-any */
import classNames from "classnames"
import { HTMLInputTypeAttribute } from "react"
import { UseFormRegister } from "react-hook-form"

import ErrorMessage from "@/components/ui/ErrorMessage"
import TextInput, { TextInputProps } from "../TextInput"

type FormTextInputProps = TextInputProps & {
  register: UseFormRegister<any>
  name: string
  step?: string
  type?: HTMLInputTypeAttribute
  error?: string
  inputWrapperClassName?: string
  inputContainerClassName?: string
  inputClassName?: string
  allowNegativeNumber?: boolean
}

export default function FormTextInput({
  register,
  name,
  type = "text",
  step,
  error,
  inputWrapperClassName,
  inputContainerClassName,
  inputClassName,
  allowNegativeNumber = true,
  ...otherProps
}: FormTextInputProps) {
  return (
    <div
      className={classNames(
        "w-full min-w-[150px] sm:max-w-xs",
        inputContainerClassName,
      )}
    >
      <TextInput
        className={inputClassName}
        id={name}
        type={type}
        step={step}
        color={error ? "failure" : undefined}
        onKeyPress={(event: React.KeyboardEvent<HTMLInputElement>) => {
          if (
            !allowNegativeNumber &&
            type === "number" &&
            event.charCode < 48
          ) {
            event.preventDefault()
          }
        }}
        {...register(name)}
        {...otherProps}
      />
      {error && <ErrorMessage message={error} />}
    </div>
  )
}
