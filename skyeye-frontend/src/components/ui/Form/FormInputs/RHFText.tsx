import { cn } from "@/libs/utils"
import { useFormContext } from "react-hook-form"
import FormError from "./FormError"

export const RHFText: React.FC<
  CommonProps & React.InputHTMLAttributes<HTMLInputElement>
> = ({ name, label, className, error, ...rest }) => {
  const { register } = useFormContext()
  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={name} className="text-sm font-medium">
          {label}
        </label>
      )}
      <input
        id={name}
        {...register(name)}
        {...rest}
        className={cn(
          "input",
          error && "border-destructive focus-visible:ring-destructive",
          className,
        )}
      />
      <FormError message={error} />
    </div>
  )
}
