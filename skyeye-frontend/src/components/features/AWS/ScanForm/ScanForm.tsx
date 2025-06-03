import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { FormProvider, useForm } from "react-hook-form"
import { RHFFile } from "@/components/ui/Form/FormInputs/RHFFile"
import { RHFRadioGroup } from "@/components/ui/Form/FormInputs/RHFRadioGroup"
import { RHFNumber } from "@/components/ui/Form/FormInputs/RHFNumber"
import { CredentialsList } from "./CredentialList"
import { FaRegCheckCircle } from "react-icons/fa"
import { useEffect, useState, useRef } from "react"
import { toast } from "react-toastify"
import { useScanHistory } from "@/libs/context/ScanHistoryContext"
import { useRouter } from "next/router"
import { useApi } from "@/hooks/useApi"
import useScanLogs from "@/libs/hooks/useScanLog"
import ScanLog from "@/components/ui/ScanLog/ScanLog"
import ProgressBar from "@/components/ui/ProgressBar/ProgressBar"
import { useOnlineStatus } from "@/libs/hooks/useOnlineStatus"

// ──────────────────────────────────────────────────────────────────────────────
// Validation Schemas
// ──────────────────────────────────────────────────────────────────────────────
export const credentialSchema = z.object({
  accessKey: z.string().min(1, "Access Key is required"),
  secretKey: z.string().min(1, "Secret Key is required"),
  sessionToken: z.string().optional(),
  region: z.string().min(1, "Region is required"),
})

export const formSchema = z.object({
  credsFromFile: z.any().optional(),
  scanningMode: z.enum(["cross", "separate"]),
  threads: z.number().min(1, "Minimum 1 thread").max(64, "Maximum 64 threads"),
  credentials: z
    .array(credentialSchema)
    .min(2, "At least two credentials are required in this mode"),
})
export type FormValues = z.infer<typeof formSchema>

// ──────────────────────────────────────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────────────────────────────────────
const AwsScanForm = ({
  setIsDisabled,
}: {
  setIsDisabled: React.Dispatch<React.SetStateAction<boolean>>
}) => {
  const { addSession, refresh } = useScanHistory()
  const router = useRouter()
  const { startScan, getStatus } = useApi()

  // React‑Hook‑Form setup
  const methods = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    criteriaMode: "all",
    defaultValues: {
      scanningMode: "cross",
      threads: 5,
      credentials: [
        { accessKey: "", secretKey: "", region: "" },
        { accessKey: "", secretKey: "", region: "" },
      ],
    },
  })

  const { watch, setValue } = methods

  // UI state
  const [fileError, setFileError] = useState<string | null>(null)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [status, setStatus] = useState<
    "running" | "fuzzing" | "completed" | "failed" | null
  >(null)
  const [progress, setProgress] = useState(0)
  const startRef = useRef(0)
  const isOnline = useOnlineStatus()
  const { logs, logEndRef, setLogs } = useScanLogs(sessionId)
  // ───────────────────────────────────────────────────────────────────────────
  // Auto‑scroll log viewer

  // ───────────────────────────────────────────────────────────────────────────
  // When user uploads JSON creds → populate form
  // ───────────────────────────────────────────────────────────────────────────
  const fileList = watch("credsFromFile")
  useEffect(() => {
    if (!fileList || fileList.length === 0) return
    const file = fileList[0] as File
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const text = e.target?.result as string
        const json = JSON.parse(text)
        if (!Array.isArray(json)) throw new Error("JSON root must be an array")

        const cleaned = json.map((c: any) => ({
          accessKey: c.AccessKey ?? "",
          secretKey: c.SecretKey ?? "",
          sessionToken: c.SessionToken ?? "",
          region: c.Region ?? "us-east-1",
        }))
        if (cleaned.length < 2) {
          throw new Error("At least two credentials are required")
        }
        setValue("credentials", cleaned, { shouldValidate: true })
        setFileError(null)
      } catch (err: any) {
        setFileError(err.message ?? "Invalid JSON file")
      }
    }
    reader.readAsText(file)
  }, [fileList, setValue])

  const {
    formState: { errors, isSubmitting },
  } = methods

  // ───────────────────────────────────────────────────────────────────────────
  // Kick off scan
  // ───────────────────────────────────────────────────────────────────────────
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
      }
      const session_id = await startScan(payload)
      if (!session_id) return
      addSession(session_id)
      setSessionId(session_id)
      setStatus("running")
      setProgress(0)
      setLogs([])
      startRef.current = Date.now()
    } catch (err: any) {
      toast.error(err.message ?? "Unable to start scan")
    }
  }

  // ───────────────────────────────────────────────────────────────────────────
  // Poll status & compute progress
  // ───────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!sessionId) return
    let cancelled = false

    const loop = async () => {
      try {
        const s = await getStatus(sessionId)
        if (cancelled || !s) return

        if (s === "completed") {
          setStatus("completed")
          setProgress(100)
          setIsDisabled(false)
          toast.success(`Scan ${sessionId} completed successfully`)
          refresh()
          router.push(`/aws/history/${sessionId}`)
        } else if (s === "failed") {
          setStatus("failed")
          toast.error(`Scan ${sessionId} failed`)
        } else {
          // running or fuzzing
          setStatus(s)
          const elapsed = (Date.now() - startRef.current) / 1000
          const pct = Math.min(95, Math.floor((elapsed / 120) * 100))
          setProgress(pct)
          setTimeout(loop, 3000)
        }
      } catch (err: any) {
        toast.error(err.message ?? "Status polling error")
      }
    }
    loop()
    return () => {
      cancelled = true
    }
  }, [sessionId])

  if (sessionId && status === "failed") {
    return (
      <div className="w-full mx-auto p-5 space-y-4">
        <h3 className="text-lg text-red-600 font-semibold">Scan failed</h3>
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

  // ───────────────────────────────────────────────────────────────────────────
  // UI: scanning in progress
  // ───────────────────────────────────────────────────────────────────────────
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

  // ───────────────────────────────────────────────────────────────────────────
  // UI: initial form
  // ───────────────────────────────────────────────────────────────────────────
  return (
    <div className="w-full mx-auto">
      <div className="bg-white rounded-lg shadow-lg border p-1">
        <FormProvider {...methods}>
          <form
            onSubmit={methods.handleSubmit(onSubmit)}
            className="space-y-6 p-5"
          >
            {!isOnline && (
              <div className="bg-yellow-100 text-yellow-800 border-l-4 border-yellow-500 p-2 rounded">
                You are offline. Form inputs are disabled until you regain
                connection.
              </div>
            )}
            {/* Input Options */}
            <fieldset className="border rounded-lg p-5 bg-white/50 space-y-5">
              <legend className="px-2 font-medium text-base">
                Input Options
              </legend>

              <RHFFile
                name="credsFromFile"
                label="Upload JSON credentials"
                accept="application/json"
                error={fileError || (errors.credsFromFile as any)?.message}
                disabled={!isOnline}
              />

              <RHFRadioGroup
                name="scanningMode"
                label="Scanning mode"
                options={[
                  { value: "cross", label: "Cross entities" },
                  { value: "separate", label: "Separate entities" },
                ]}
                error={errors.scanningMode?.message}
                disabled={!isOnline}
              />

              <RHFNumber
                name="threads"
                label="Threads to use"
                min={1}
                max={64}
                className="w-32"
                error={errors.threads?.message}
                disabled={!isOnline}
              />
            </fieldset>

            {/* Credentials list */}
            <fieldset className="border rounded-lg p-5 bg-white/50">
              <legend className="px-2 font-medium text-base">
                AWS Credentials
              </legend>
              <CredentialsList disabled={!isOnline} />
              {errors.credentials?.message && (
                <p className="mt-2 text-sm text-destructive">
                  {errors.credentials.message}
                </p>
              )}
            </fieldset>

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

export default AwsScanForm
