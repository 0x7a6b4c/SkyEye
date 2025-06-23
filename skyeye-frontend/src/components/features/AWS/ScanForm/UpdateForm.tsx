import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { FormProvider, useForm } from "react-hook-form"
import { RHFGroupCheckbox } from "@/components/ui/Form/FormInputs/RHFGroupCheckbox"
import { useEffect, useRef, useState } from "react"
import { useApi } from "@/hooks/useApi"
import { toast } from "react-toastify"
import ProgressBar from "@/components/ui/ProgressBar/ProgressBar"
import ScanLog from "@/components/ui/ScanLog/ScanLog"
import useScanLogs from "@/libs/hooks/useScanLog"
import { MdBrowserUpdated } from "react-icons/md"
import { RHFNumber } from "@/components/ui/Form/FormInputs/RHFNumber"
import { useOnlineStatus } from "@/libs/hooks/useOnlineStatus"

const formSchema = z.object({
  threads: z.number().min(1, "Minimum 1 thread").max(64, "Maximum 64 threads"),
  updates: z
    .array(
      z.enum(["mitre-attack-cloud", "aws-actions", "aws-managed-policies"]),
    )
    .min(1, "Select at least one update"),
})

export type UpdateFormValues = z.infer<typeof formSchema>

const UpdateForm = ({
  setActiveTab,
}: {
  setActiveTab: React.Dispatch<React.SetStateAction<string>>
}) => {
  const methods = useForm<UpdateFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      updates: [],
      threads: 5,
    },
  })

  const { triggerUpdate, getUpdateStatus } = useApi()
  const [updateId, setUpdateId] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState<
    "running" | "completed" | "failed" | null
  >(null)
  const isOnline = useOnlineStatus()
  const { logs, logEndRef, setLogs } = useScanLogs(updateId, true)
  const startRef = useRef(0)

  const onSubmit = async (data: UpdateFormValues) => {
    try {
      const update_id = await triggerUpdate({
        types: data.updates,
        thread: data.threads,
      })
      if (!update_id) return
      setUpdateId(update_id)
      setStatus("running")
      setLogs([])
      startRef.current = Date.now()
    } catch (err) {
      toast.error("Failed to initiate update.")
    }
  }

  useEffect(() => {
    if (!updateId) return
    const interval = setInterval(async () => {
      try {
        const updateStatus = await getUpdateStatus(updateId)
        if (!updateStatus) return
        if (updateStatus === "completed") {
          setProgress(100)
          setStatus("completed")
          clearInterval(interval)
          toast.success("Update completed successfully!")
          setActiveTab("multi")
        } else if (updateStatus === "failed") {
          clearInterval(interval)
          setStatus("failed")
          toast.error("Update failed.")
        } else {
          const elapsed = (Date.now() - startRef.current) / 1000
          const pct = Math.min(90, Math.floor((elapsed / 90) * 100))
          setProgress(pct)
        }
      } catch {
        // ignore polling errors
      }
    }, 2000)
    return () => clearInterval(interval)
  }, [updateId])

  return (
    <div className="w-full mx-auto p-5 space-y-4">
      {updateId && status ? (
        <>
          <ProgressBar progress={progress} />
          <ScanLog logs={logs} logEndRef={logEndRef} />
        </>
      ) : (
        <FormProvider {...methods}>
          <form
            onSubmit={methods.handleSubmit(onSubmit)}
            className="space-y-6 p-5 bg-white rounded shadow"
          >
            <RHFNumber
              name="threads"
              label="Threads to use"
              min={1}
              max={64}
              className="w-32"
              disabled={!isOnline}
            />
            <RHFGroupCheckbox
              name="updates"
              label="Select updates to perform"
              options={[
                { label: "Mitre Attack Cloud", value: "mitre-attack-cloud" },
                { label: "AWS Actions", value: "aws-actions" },
                {
                  label: "AWS Managed Policies",
                  value: "aws-managed-policies",
                },
              ]}
              error={methods.formState.errors.updates?.message}
            />
            <button type="submit" className="btn btn-primary w-[180px]">
              <MdBrowserUpdated className="h-5 w-5 mr-2" />
              Start Update
            </button>
          </form>
        </FormProvider>
      )}
    </div>
  )
}

export default UpdateForm
