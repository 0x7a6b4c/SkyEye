import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { FormProvider, useForm } from "react-hook-form"
import { RHFRadioGroup } from "@/components/ui/Form/FormInputs/RHFRadioGroup"
import { RHFNumber } from "@/components/ui/Form/FormInputs/RHFNumber"
import { FaRegCheckCircle } from "react-icons/fa"
import { useEffect, useRef, useState } from "react"
import { useScanHistory } from "@/libs/context/ScanHistoryContext"
import { useRouter } from "next/router"
import { credentialSchema } from "./ScanForm"
import { CredentialCard } from "./CredentialCard"
import { RHFCheckbox } from "@/components/ui/Form/FormInputs/RHFCheckbox"
import { useApi } from "@/hooks/useApi"
import { toast } from "react-toastify"
import ProgressBar from "@/components/ui/ProgressBar/ProgressBar"
import ScanLog from "@/components/ui/ScanLog/ScanLog"
import useScanLogs from "@/libs/hooks/useScanLog"
import { useOnlineStatus } from "@/libs/hooks/useOnlineStatus"

export const formSchema = z.object({
  credsFromFile: z.any().optional(),
  scanningMode: z.enum(["cross", "separate"]),
  threads: z.number().min(1, "Minimum 1 thread").max(64, "Maximum 64 threads"),
  credentials: z
    .array(credentialSchema)
    .min(1, "At least one credential is required")
    .max(1, "Only one credential is allowed in this mode"),
  fuzz: z.boolean().optional(),
})

export type FormValues = z.infer<typeof formSchema>
export const SingleForm = ({
  setIsDisabled,
}: {
  setIsDisabled: React.Dispatch<React.SetStateAction<boolean>>
}) => {
  const { addSession, refresh } = useScanHistory()
  const router = useRouter()
  const { startScan, getStatus } = useApi()
  const methods = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      scanningMode: "separate",
      threads: 5,
      credentials: [{ accessKey: "", secretKey: "", region: "" }],
      fuzz: false,
    },
  })
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [status, setStatus] = useState<
    "running" | "completed" | "failed" | null
  >(null)
  const [progress, setProgress] = useState(0)
  const isOnline = useOnlineStatus()
  const { logs, logEndRef, setLogs } = useScanLogs(sessionId)
  const startRef = useRef(0)

  const {
    formState: { errors, isSubmitting },
  } = methods

  const onSubmit = async (data: FormValues) => {
    try {
      setIsDisabled(true)
      const mode =
        data.scanningMode === "cross" ? "cross-entity" : "separate-entity"
      const payload = {
        credentials: data.credentials.map((c) => ({
          AccessKey: c.accessKey,
          SecretKey: c.secretKey,
          SessionToken: c.sessionToken || "",
          Region: c.region || "us-east-1",
        })),
        mode,
        thread: data.threads,
        fuzz: data.fuzz,
      }
      const session_id = await startScan(payload)
      if (!session_id) return
      addSession(session_id)
      setSessionId(session_id)
      setStatus("running")
      setLogs([])
      startRef.current = Date.now()
    } catch (err) {
      toast.error(
        "Failed to start scan. Please check your credentials and try again.",
      )
    }
  }

  // Poll for status and update progress
  useEffect(() => {
    if (!sessionId) return
    const interval = setInterval(async () => {
      try {
        const statusResp = await getStatus(sessionId)
        if (!statusResp) return
        if (statusResp === "completed") {
          setProgress(100)
          setStatus("completed")
          setIsDisabled(false)
          refresh()
          clearInterval(interval)
          router.push(`/aws/history/${sessionId}`)
        } else if (statusResp === "failed") {
          clearInterval(interval)
          setStatus("failed")
          toast.error(`Scan ${sessionId} failed`)
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
  }, [sessionId])

  // Show failure UI if scan failed
  if (sessionId && status === "failed") {
    return (
      <div className="w-full mx-auto p-5">
        <h3 className="text-lg mb-4 text-red-600">Scan failed</h3>
        <p className="mb-4">
          An error occurred during the scan. Please try again.
        </p>
        <button
          onClick={() => {
            setSessionId(null)
            setStatus(null)
            setProgress(0)
            setLogs([])
            setIsDisabled(false)
          }}
          className="btn btn-primary"
        >
          Try again
        </button>
      </div>
    )
  }

  // If scan started, show progress
  if (
    sessionId &&
    status &&
    ["running", "fuzzing", "completed"].includes(status)
  ) {
    return (
      <div className="w-full mx-auto p-5 space-y-4">
        <ProgressBar progress={progress} />
        <ScanLog logs={logs} logEndRef={logEndRef} />
      </div>
    )
  }

  return (
    <div className="w-full mx-auto">
      <div className="bg-white rounded-lg shadow-lg border p-1">
        <FormProvider {...methods}>
          <form
            onSubmit={methods.handleSubmit(onSubmit)}
            className="space-y-6 p-5"
          >
            {/* Top‑level options */}
            <fieldset className="border rounded-lg p-5 bg-white/50 space-y-5">
              <legend className="px-2 font-medium text-base">
                Input Options
              </legend>

              <RHFRadioGroup
                name="scanningMode"
                label="Scanning mode"
                disabled={!isOnline}
                options={[{ value: "separate", label: "Separate entities" }]}
                error={errors.scanningMode?.message}
              />

              <RHFNumber
                name="threads"
                label="Threads to use"
                min={1}
                max={64}
                className="w-32"
                disabled={!isOnline}
              />
              <RHFCheckbox
                name="fuzz"
                label="Enable IAM fuzzing"
                error={errors.fuzz?.message}
                disabled={!isOnline}
              />
            </fieldset>

            {/* Credential */}
            <CredentialCard disabled={!isOnline} />

            <button
              type="submit"
              className="btn btn-primary w-full flex items-center justify-center gap-2"
              disabled={isSubmitting || !isOnline}
            >
              {isSubmitting ? (
                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <FaRegCheckCircle className="h-5 w-5" />
                  Start AWS Security Scan
                </>
              )}
            </button>
          </form>
        </FormProvider>
      </div>
    </div>
  )
}

export default SingleForm
