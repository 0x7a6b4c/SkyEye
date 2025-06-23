export type OptionType = {
  value: number | string
  label: number | string
}

export type SelectedOption = {
  label: string
  value: string
}

export type ValueType =
  | number
  | string
  | number[]
  | string[]
  | undefined
  | SelectedOption
