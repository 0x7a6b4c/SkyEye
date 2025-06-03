/* eslint-disable eqeqeq */
import classNames from "classnames"
import { useEffect, useRef, useState } from "react"
import { UseFormSetValue } from "react-hook-form"
import { HiChevronDown } from "react-icons/hi"

import { OptionType } from "@/types/select"

interface SelectCustomProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setValue?: UseFormSetValue<any>
  name: string
  selected?: string | number
  onChange?: (value: string | number) => void
  wrapperClassName?: string
  inputClassName?: string
  menuClassName?: string
  iconClassName?: string
  placeholder?: string
  options: OptionType[]
  disabled?: boolean
  scrollToView?: boolean
  defaultPosition?: string
  isBulkEdit?: boolean
}

function SelectCustom({
  name,
  setValue,
  onChange,
  selected,
  wrapperClassName,
  inputClassName,
  menuClassName,
  iconClassName,
  options,
  placeholder,
  disabled = false,
  scrollToView = false,
  defaultPosition = "bottom",
}: SelectCustomProps) {
  const [optionActive, setOptionActive] = useState<OptionType | undefined>(
    () => {
      if (selected) {
        // eslint-disable-next-line eqeqeq
        return options.find((item) => item.value == selected)
      }

      return undefined
    },
  )

  const [active, setActive] = useState(false)
  const [isShow, setIsShow] = useState(false)
  const [positionContent, setPosition] = useState("bottom")
  const elementRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (selected && scrollToView) {
      const selectedOptionIndex = options.findIndex(
        (option) => option.value === selected,
      )
      if (selectedOptionIndex > -1) {
        setTimeout(() => {
          const optionElement = document.getElementById(
            `option-${selectedOptionIndex}`,
          )
          if (optionElement) {
            optionElement.scrollIntoView()
          }
        }, 10)
      }
    }

    if (elementRef.current) {
      const buttonElement = elementRef.current.getBoundingClientRect()
      const distanceTop = buttonElement.top
      const distanceBottom = window.innerHeight - buttonElement.bottom

      if (distanceTop > 300) {
        setPosition("top")
        setIsShow(true)
        return
      }

      if (distanceTop < 200) {
        setPosition("bottom")
        setIsShow(true)
        return
      }

      if (distanceBottom < 200) {
        setPosition("top")
        setIsShow(true)
        return
      }

      setPosition(defaultPosition)
      setIsShow(true)
    }
  }, [active])

  useEffect(() => {
    setOptionActive(() => {
      if (selected) {
        // eslint-disable-next-line eqeqeq
        return options.find((item) => item.value == selected)
      }

      return undefined
    })
  }, [selected, options])

  const handleActive = (isActive: boolean) => {
    setActive(isActive)
    setIsShow(false)
  }

  const handleChangeValue = (option: OptionType) => {
    setValue?.(name, option.value)
    setOptionActive(option)
    onChange?.(option.value)
  }

  return (
    <div className={classNames("relative", wrapperClassName)}>
      <button
        type="button"
        onClick={() => handleActive(!active)}
        onBlur={() => handleActive(false)}
        ref={elementRef}
        className={classNames(
          "flex text-gray-900 w-full min-w-[65px] focus:border-[#2684FF] transition-all bg-gray-50 gap-2  items-center justify-between p-[9px] h-[42px] rounded-lg border-gray-300 border-[1px] border-solid px-2 py-1",
          inputClassName,
          { "cursor-not-allowed": disabled },
          { "hover:border-gray-400": !disabled },
        )}
        disabled={disabled}
      >
        <p className="w-full truncate text-sm">
          {optionActive?.label || placeholder || ""}
        </p>
        <div>
          <HiChevronDown
            className={classNames(
              "relative top-[1px] text-[1.3rem] text-gray-400",
              iconClassName,
            )}
          />
        </div>

        {active && isShow && (
          <div
            className={classNames(
              "absolute z-10 left-0 w-full overflow-y-auto max-h-[137px] rounded-lg border-[1px] border-solid border-gray-300 bg-gray-50",
              {
                "bottom-[calc(100%+7px)]": positionContent === "top",
                "top-[calc(100%+7px)]": positionContent === "bottom",
              },
              menuClassName,
            )}
            style={{
              boxShadow:
                "0 0 0 1px hsla(0, 0%, 0%, 0.1), 0 4px 11px hsla(0, 0%, 0%, 0.1)",
            }}
          >
            {options &&
              options.map((option, index) => (
                // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
                <div
                  id={`option-${index}`}
                  key={option.value}
                  className={classNames(
                    "cursor-pointer px-2 py-1 text-sm hover:bg-blue-500 hover:text-white",
                    {
                      "bg-blue-500": option.value == optionActive?.value,
                      "text-white": option.value == optionActive?.value,
                    },
                  )}
                  onClick={() => handleChangeValue(option)}
                >
                  {option.label}{" "}
                </div>
              ))}
          </div>
        )}
      </button>
    </div>
  )
}

export default SelectCustom
