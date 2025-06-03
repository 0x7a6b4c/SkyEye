import { useFormContext } from "react-hook-form"
import FormError from "./FormError"

export const RHFRadioGroup: React.FC<
  CommonProps & { options: RadioOption[]; disabled?: boolean }
> = ({ name, label, options, error, disabled }) => {
  const { register } = useFormContext()
  return (
    <div className="space-y-2">
      {label && <p className="text-sm font-medium">{label}</p>}
      <div className="flex gap-6">
        {options.map((opt) => (
          <label
            key={opt.value}
            className="flex items-center gap-2 cursor-pointer"
          >
            <input
              type="radio"
              value={opt.value}
              {...register(name)}
              disabled={disabled}
              className="h-4 w-4 border-gray-300 text-primary focus:ring-primary"
            />
            <span className="text-sm">{opt.label}</span>
          </label>
        ))}
      </div>
      <FormError message={error} />
    </div>
  )
}
