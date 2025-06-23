import React from "react"
import { Handle, Position } from "reactflow"
import { LuTriangleAlert } from "react-icons/lu"
import { Tooltip } from "flowbite-react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import rehypeRaw from "rehype-raw"
import { DATA } from "@/components/features/MITRE/CloudAttackTable"
import { CiShare1 } from "react-icons/ci"

// Helper: lookup attack info from DATA
function getAttackInfo(tacId: string, techId: string, subTechId: string) {
  const tactic = DATA.find((t) => t.id === tacId)
  const technique = tactic?.techniques.find((tech) => tech.id === techId)
  const subTechnique = technique?.subTechniques?.find(
    (st) => st.id === subTechId,
  )
  return {
    tacticName: tactic ? tactic.name : tacId,
    tacticDescription: tactic ? tactic.description : "",
    techniqueName: technique ? technique.name : techId,
    techniqueDescription: technique ? technique.description : "",
    subTechniqueName: subTechnique ? subTechnique.name : subTechId,
    subTechniqueDescription: subTechnique ? subTechnique.description : "",
  }
}

interface TTPNodeProps {
  data: {
    label: string
    tactic: string
    technique: string
    subTechnique: string
  }
}

const TTPNode: React.FC<TTPNodeProps> = ({ data }) => {
  const {
    tacticName,
    tacticDescription,
    techniqueName,
    techniqueDescription,
    subTechniqueName,
    subTechniqueDescription,
  } = getAttackInfo(data.tactic, data.technique, data.subTechnique)

  // Determine deepest ID: if subTechnique exists use it, otherwise technique.
  const deepestID = data.subTechnique ? data.subTechnique : data.technique

  // Update handleSetQuery to open URL in a new tab using window.open
  const handleSetQuery = () => {
    const url = data.subTechnique
      ? `/mitre-attack-matrix?q=${deepestID}`
      : `/mitre-attack-matrix?q=${deepestID}&verbose=true`
    window.open(url, "_blank", "noopener,noreferrer")
  }

  return (
    <div className="bg-blue-50 border-2 border-blue-500 rounded-lg shadow-lg p-5 min-w-[280px] relative transition-transform duration-200 hover:scale-105">
      <div className="flex items-center gap-3 mb-4 w-full">
        <div className="p-2 bg-blue-100 rounded-lg">
          <LuTriangleAlert className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <span className="font-semibold text-lg text-gray-900">TTPs</span>
          <div className="w-8 h-0.5 bg-blue-500 rounded-full"></div>
        </div>
        <div className="ml-auto cursor-pointer">
          <div onClick={handleSetQuery} className="p-2 bg-blue-200 rounded-lg">
            <CiShare1 className="w-5 h-5 text-blue-600" />
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {data.tactic && (
          <Tooltip
            content={
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
              >
                {tacticDescription}
              </ReactMarkdown>
            }
            placement="top"
            style="light"
            className="z-50 max-w-[752px] font-medium text-slate-600"
          >
            <div className="bg-blue-50 rounded-md p-3 border-2 border-blue-200 cursor-pointer">
              <p className="text-xs text-blue-600 font-medium uppercase tracking-wide mb-1">
                Tactic
              </p>
              <p className="text-sm font-mono text-blue-900">{`${data.tactic} - ${tacticName}`}</p>
            </div>
          </Tooltip>
        )}
        {data.technique && (
          <Tooltip
            content={
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
              >
                {techniqueDescription}
              </ReactMarkdown>
            }
            placement="top"
            style="light"
            className="z-50 max-w-[752px] font-medium text-slate-600"
          >
            <div className="bg-blue-50 rounded-md p-3 border-2 border-blue-200 cursor-pointer">
              <p className="text-xs text-blue-600 font-medium uppercase tracking-wide mb-1">
                Technique
              </p>
              <p className="text-sm font-mono text-blue-900">
                {`${data.technique} - ${techniqueName}`}
              </p>
            </div>
          </Tooltip>
        )}
        {data.subTechnique && (
          <Tooltip
            content={
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
              >
                {subTechniqueDescription}
              </ReactMarkdown>
            }
            placement="top"
            style="light"
            className="z-50 max-w-[752px] font-medium text-slate-600"
          >
            <div className="bg-blue-50 rounded-md p-3 border-2 border-blue-200 cursor-pointer">
              <p className="text-xs text-blue-600 font-medium uppercase tracking-wide mb-1">
                Sub-technique
              </p>
              <p className="text-sm font-mono text-blue-900">
                {`${data.subTechnique} - ${subTechniqueName}`}
              </p>
            </div>
          </Tooltip>
        )}
      </div>

      <Handle type="target" position={Position.Top} />
    </div>
  )
}

export default TTPNode
