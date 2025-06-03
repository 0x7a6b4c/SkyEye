import { cn } from "@/libs/utils"
import { useFormContext } from "react-hook-form"
import FormError from "./FormError"

export const RHFGroupCheckbox: React.FC<
  CommonProps & {
    options: { value: string; label: string }[]
  }
> = ({ name, label, options = [], className, error, ...rest }) => {
  const { register } = useFormContext()
  return (
    <div>
      {/* group label */}
      {label && <p className="font-medium mb-4">{label}</p>}
      <div className="flex flex-col gap-2">
        {options.map((opt) => (
          <div key={opt.value} className="flex items-center gap-4">
            <input
              id={`${name}-${opt.value}`}
              type="checkbox"
              value={opt.value}
              {...register(name)}
              {...rest}
              className={cn(
                "h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary",
                className,
              )}
            />
            <label htmlFor={`${name}-${opt.value}`} className="text-sm">
              {opt.label}
            </label>
          </div>
        ))}
      </div>
      <FormError message={error} />
    </div>
  )
}
