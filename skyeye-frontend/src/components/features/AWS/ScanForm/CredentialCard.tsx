import { RHFCheckbox } from "@/components/ui/Form/FormInputs/RHFCheckbox"
import { RHFText } from "@/components/ui/Form/FormInputs/RHFText"
import { useFormContext } from "react-hook-form"
import { FaMinus } from "react-icons/fa"

export const CredentialCard: React.FC<{
  index?: number
  onRemove?: () => void
  disabled?: boolean
}> = ({ index, onRemove, disabled }) => {
  const {
    formState: { errors },
  } = useFormContext()
  const credErrors =
    errors.credentials && Array.isArray(errors.credentials)
      ? (errors.credentials[index !== undefined ? index : 0] as
          | Record<string, { message?: string }>
          | undefined)
      : undefined

  const getError = (field: string) => credErrors?.[field]?.message
  const prefix = `credentials.${index ? index : 0}` as const

  return (
    <div className="border rounded-lg p-5 bg-white shadow-sm mb-5 transition-all hover:shadow-md">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          {index !== undefined && (
            <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-xs font-semibold text-primary">
                {index + 1}
              </span>
            </div>
          )}
          <h3 className="font-medium">AWS Credential</h3>
        </div>
        {index !== undefined && index > 1 && (
          <button
            type="button"
            onClick={onRemove}
            disabled={disabled}
            className="text-muted-foreground hover:text-destructive p-1 rounded-full hover:bg-destructive/10 transition-colors"
          >
            <span className="sr-only">Remove credential</span>
            <FaMinus className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <RHFText
          name={`${prefix}.accessKey`}
          label="Access Key"
          placeholder="AKIA..."
          error={getError("accessKey")}
          disabled={disabled}
        />
        <RHFText
          name={`${prefix}.secretKey`}
          label="Secret Key"
          placeholder="Your secret key"
          type="password"
          error={getError("secretKey")}
          disabled={disabled}
        />
        <RHFText
          name={`${prefix}.sessionToken`}
          label="Session Token (optional)"
          placeholder="Optional session token"
          className="md:col-span-2"
          error={getError("sessionToken")}
          disabled={disabled}
        />
        <RHFText
          name={`${prefix}.region`}
          label="Region"
          placeholder="us-east-1"
          error={getError("region")}
          disabled={disabled}
        />
      </div>
    </div>
  )
}
