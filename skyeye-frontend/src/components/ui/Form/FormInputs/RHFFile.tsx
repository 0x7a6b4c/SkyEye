import { cn } from "@/libs/utils"
import { useFormContext } from "react-hook-form"
import FormError from "./FormError"
import { FiUpload } from "react-icons/fi"

export const RHFFile: React.FC<
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
      <div className="flex items-center gap-2">
        <FiUpload className="h-5 w-5 text-muted-foreground" />
        <input
          id={name}
          type="file"
          {...register(name)}
          {...rest}
          className={cn(className)}
        />
      </div>
      <FormError message={error} />
    </div>
  )
}
