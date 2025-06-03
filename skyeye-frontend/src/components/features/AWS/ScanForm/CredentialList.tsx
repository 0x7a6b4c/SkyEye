import { useFieldArray, useFormContext } from "react-hook-form"
import { CredentialCard } from "./CredentialCard"
import { FormValues } from "./ScanForm"
import { FaPlus } from "react-icons/fa"

export const CredentialsList = ({ disabled }: { disabled: boolean }) => {
  const { control } = useFormContext<FormValues>()
  const { fields, append, remove } = useFieldArray({
    control,
    name: "credentials",
  })

  return (
    <div>
      {fields.map((field, idx) => (
        <CredentialCard
          key={field.id}
          index={idx}
          onRemove={() => remove(idx)}
          disabled={disabled}
        />
      ))}

      <div className="flex gap-2">
        <button
          type="button"
          className="btn flex gap-2 items-center"
          disabled={disabled}
          onClick={() => append({ accessKey: "", secretKey: "", region: "" })}
        >
          <FaPlus className="h-4 w-4" />
          Add credential
        </button>
      </div>
    </div>
  )
}
