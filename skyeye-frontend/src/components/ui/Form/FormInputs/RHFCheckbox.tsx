import { cn } from "@/libs/utils"
import { useFormContext } from "react-hook-form"
import FormError from "./FormError"

export const RHFCheckbox: React.FC<
  CommonProps & React.InputHTMLAttributes<HTMLInputElement>
> = ({ name, label, className, error, ...rest }) => {
  const { register } = useFormContext()
  return (
    <div>
      <div className="flex items-center gap-2">
        <input
          id={name}
          type="checkbox"
          {...register(name)}
          {...rest}
          className={cn(
            "h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary",
            className,
          )}
        />
        <label htmlFor={name} className="text-sm">
          {label}
        </label>
      </div>
      <FormError message={error} />
    </div>
  )
}
