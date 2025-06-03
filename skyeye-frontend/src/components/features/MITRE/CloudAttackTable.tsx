import React, { useEffect, useMemo, useState } from "react"
import { CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { FaChevronDown, FaChevronRight } from "react-icons/fa6"
import { LuEye, LuEyeOff, LuSearch, LuX } from "react-icons/lu"
import { GoAlert } from "react-icons/go"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import rehypeRaw from "rehype-raw"
import { useRouter } from "next/router"

/* adjust path to your JSON */
import attackJson from "@/data/mitre_attack_reference_table.json"
import { Tooltip } from "flowbite-react"
import Markdown from "react-markdown"

/* ───────── types ───────── */
interface SubTechnique {
  id: string
  name: string
  description: string
  ref: string
}
interface Technique {
  id: string
  name: string
  description: string
  ref: string
  subTechniques: SubTechnique[]
  _hadSubMatch?: boolean
}
interface Tactic {
  id: string
  name: string
  description: string
  ref: string
  techniques: Technique[]
}

function withCitations(raw: string): string {
  let n = 1
  return raw.replace(/\(Citation:\s*([^\)]+?)\s*\)/g, (_full, cite: string) => {
    const escaped = cite.replace(/"/g, "&quot;")
    return `<sup style="color:blue; cursor: pointer" title="${escaped}">[${n++}]</sup>`
  })
}

/* ──────── parse & sort once ──────── */
function parseATTCK(json: any): Tactic[] {
  return Object.entries<any>(json).map(([tacId, tac]) => ({
    id: tacId,
    name: tac.name,
    description: withCitations(tac.description),
    ref: tac.Reference,
    techniques: Object.entries<any>(tac.techniques).map(([techId, tech]) => ({
      id: techId,
      name: tech.name,
      description: withCitations(tech.description),
      ref: tech.Reference,
      subTechniques: Object.entries<any>(tech.sub_techniques ?? {})
        .sort(([a], [b]) => +a.split(".").pop()! - +b.split(".").pop()!)
        .map(([id, st]) => ({
          id,
          name: st.name,
          description: withCitations(st.description),
          ref: st.Reference,
        })),
    })),
  }))
}
export const DATA: Tactic[] = parseATTCK(attackJson)
const keyTech = (t: string, te: string) => `${t}::${te}`

/* ───────── component ───────── */
export default function CloudAttackTable() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [query, setQuery] = useState("")
  const [openTac, setOpenTac] = useState<Set<string>>(new Set())
  const [openTech, setOpenTech] = useState<Set<string>>(new Set())
  const [isVerbose, setIsVerbose] = useState<boolean>(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  /* -------- filtering -------- */
  const filtered = useMemo<Tactic[]>(() => {
    const term = query.trim().toLowerCase()
    if (!term) return DATA

    return DATA.map((t) => {
      const tacHit =
        t.id.toLowerCase().includes(term) || t.name.toLowerCase().includes(term)

      const techniques = t.techniques
        .map((tech) => {
          const techHit =
            tech.id.toLowerCase().includes(term) ||
            tech.name.toLowerCase().includes(term)

          const subMatches = tech.subTechniques.filter(
            (s) =>
              s.id.toLowerCase().includes(term) ||
              s.name.toLowerCase().includes(term),
          )

          if (tacHit) return tech
          if (techHit) return { ...tech, _hadSubMatch: false }
          if (subMatches.length)
            return { ...tech, subTechniques: subMatches, _hadSubMatch: true }
          return null
        })
        .filter(Boolean) as Technique[]

      return tacHit || techniques.length ? { ...t, techniques } : null
    }).filter(Boolean) as Tactic[]
  }, [query])

  /* --- auto-expand on search --- */
  useEffect(() => {
    if (!query.trim()) {
      setOpenTac(new Set())
      setOpenTech(new Set())
      return
    }
    const tacSet = new Set<string>()
    const techSet = new Set<string>()
    filtered.forEach((t) => {
      const tacHit =
        t.id.toLowerCase().includes(query.toLowerCase()) ||
        t.name.toLowerCase().includes(query.toLowerCase())
      if (tacHit) tacSet.add(t.id)

      t.techniques.forEach((tech) => {
        const techHit =
          tech.id.toLowerCase().includes(query.toLowerCase()) ||
          tech.name.toLowerCase().includes(query.toLowerCase())
        if (techHit || tech._hadSubMatch) {
          tacSet.add(t.id)
          if (tech.subTechniques.length) techSet.add(keyTech(t.id, tech.id))
        }
      })
    })
    setOpenTac(tacSet)
    setOpenTech(techSet)
  }, [query, filtered])

  // NEW: Set query from URL if the "q" parameter exists
  useEffect(() => {
    if (router.query.q) {
      setQuery(router.query.q as string)
    }
    if (router.query.verbose === "true") {
      setIsVerbose(true)
    }
  }, [router.query.q])

  useEffect(() => {
    const handleUserInteraction = () => {
      if (router.query.verbose === "true") {
        setIsVerbose(false)
      }
    }
    document.addEventListener("mousedown", handleUserInteraction)
    document.addEventListener("touchstart", handleUserInteraction)
    return () => {
      document.removeEventListener("mousedown", handleUserInteraction)
      document.removeEventListener("touchstart", handleUserInteraction)
    }
  }, [router.query.verbose, router])

  /* helpers */
  const toggleTac = (id: string) =>
    setOpenTac((s) => {
      const n = new Set(s)
      n.has(id) ? n.delete(id) : n.add(id)
      return n
    })
  const toggleTech = (tac: string, tech: string) =>
    setOpenTech((s) => {
      const k = keyTech(tac, tech)
      const n = new Set(s)
      n.has(k) ? n.delete(k) : n.add(k)
      return n
    })
  const expandAll = () => {
    setOpenTac(
      new Set(DATA.filter((t) => t.techniques.length).map((t) => t.id)),
    )
    setOpenTech(
      new Set(
        DATA.flatMap((t) =>
          t.techniques
            .filter((te) => te.subTechniques.length)
            .map((te) => keyTech(t.id, te.id)),
        ),
      ),
    )
  }
  const collapseAll = () => {
    setOpenTac(new Set())
    setOpenTech(new Set())
  }

  const IdCell = ({ id, href }: { id: string; href?: string }) =>
    href ? (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()} // don’t toggle row when link clicked
      >
        {id}
      </a>
    ) : (
      <span className="font-mono text-blue-600 text-sm">{id}</span>
    )
  /* ───────── render ───────── */
  if (!mounted) {
    return <div className="min-h-[300px]"></div>
  }

  return (
    <div className="w-full mx-auto bg-gray-50 rounded-lg shadow-lg mt-3 border p-1">
      <CardContent className="p-6">
        {/* toolbar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />

            <Input
              placeholder="Filter by ID or name…"
              value={query} // or filterText, depending on your state
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10 pr-10" /* ⇠ add right-padding so the X isn’t on text */
            />

            {query /* show only when something is typed */ && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <LuX className="h-4 w-4" />
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={expandAll}>
              <LuEye className="h-4 w-4 mr-1" /> Expand All
            </Button>
            <Button variant="outline" size="sm" onClick={collapseAll}>
              <LuEyeOff className="h-4 w-4 mr-1" /> Collapse All
            </Button>
          </div>
        </div>

        {/* table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-primary border-b text-white">
              <tr>
                <th className="px-6 py-4 w-16" />
                <th className="px-6 py-4 text-left text-sm font-semibold">
                  ID
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold">
                  Name
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold">
                  Description
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold">
                  Count
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filtered.map((tac) => {
                const tacOpen = openTac.has(tac.id)
                const tacHasChildren = tac.techniques.length > 0

                return (
                  <React.Fragment key={tac.id}>
                    {/* Tactic row */}
                    <tr
                      className="bg-gray-100"
                      onClick={() => toggleTac(tac.id)}
                    >
                      <td className="px-6 py-3">
                        {tacHasChildren ? (
                          <button>
                            {tacOpen ? (
                              <FaChevronDown className="h-3 w-3" />
                            ) : (
                              <FaChevronRight className="h-3 w-3" />
                            )}
                          </button>
                        ) : (
                          <span className="inline-block w-4" />
                        )}
                      </td>
                      <td className="px-6 py-3 font-mono font-medium text-cyan-700">
                        <IdCell id={tac.id} href={tac.ref} />
                      </td>
                      <td className="px-6 py-3 font-semibold">{tac.name}</td>
                      <Tooltip
                        content={
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            rehypePlugins={[rehypeRaw]}
                          >
                            {tac.description}
                          </ReactMarkdown>
                        }
                        placement="top"
                        style="light"
                        className="z-50 max-w-[500px] font-medium text-slate-600"
                      >
                        <td className="px-6 py-3 text-sm text-gray-700 max-w-[800px] whitespace-nowrap overflow-hidden text-ellipsis">
                          {tac.description}
                        </td>
                      </Tooltip>
                      <td className="px-6 py-3 text-sm text-gray-700">
                        {tac.techniques.length}
                      </td>
                    </tr>

                    {tacOpen &&
                      tac.techniques.map((tech) => {
                        const k = keyTech(tac.id, tech.id)
                        const techOpen = openTech.has(k)
                        const hasSubs = tech.subTechniques.length > 0

                        return (
                          <React.Fragment key={k}>
                            {/* technique row */}
                            <tr
                              className={hasSubs ? "hover:bg-gray-50" : ""}
                              onClick={() =>
                                hasSubs && toggleTech(tac.id, tech.id)
                              }
                            >
                              <td className="pl-12 pr-4 py-3">
                                {hasSubs ? (
                                  <button>
                                    {techOpen ? (
                                      <FaChevronDown className="h-3 w-3" />
                                    ) : (
                                      <FaChevronRight className="h-3 w-3" />
                                    )}
                                  </button>
                                ) : (
                                  <span className="inline-block w-4" />
                                )}
                              </td>
                              <td className="px-6 py-3 font-mono text-blue-600 text-sm">
                                <IdCell id={tech.id} href={tech.ref} />
                              </td>
                              <td className="px-6 py-3 text-sm font-semibold">
                                {tech.name}
                              </td>
                              <Tooltip
                                content={
                                  <ReactMarkdown
                                    remarkPlugins={[remarkGfm]}
                                    rehypePlugins={[rehypeRaw]}
                                  >
                                    {tech.description}
                                  </ReactMarkdown>
                                }
                                placement="top"
                                style="light"
                                className="z-50 max-w-[752px] font-medium text-slate-600"
                              >
                                <td className="px-6 py-3 text-sm text-gray-700 whitespace-nowrap overflow-hidden text-ellipsis max-w-[800px]">
                                  {tech.description}
                                </td>
                              </Tooltip>
                              <td className="px-6 py-3 text-sm text-gray-700">
                                {tech.subTechniques.length}
                              </td>
                            </tr>
                            {isVerbose && (
                              <tr>
                                <td colSpan={5} className="p-0">
                                  <div className="bg-blue-50 border-l-4 border-blue-400">
                                    <div className="px-8 py-4">
                                      <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                                        <GoAlert className="h-4 w-4 text-blue-600" />
                                        {tech.name}
                                      </h4>
                                      <div className="grid gap-3">
                                        <div
                                          key={tech.id}
                                          className="bg-white p-4 rounded-lg border border-blue-200 shadow-sm hover:shadow-md"
                                        >
                                          <div className="flex justify-between mb-2">
                                            <span className="font-mono text-blue-700 text-sm">
                                              <IdCell
                                                id={tech.id}
                                                href={tech.ref}
                                              />
                                            </span>
                                            <span className="font-semibold text-sm">
                                              {tech.name}
                                            </span>
                                          </div>
                                          <Markdown
                                            remarkPlugins={[remarkGfm]}
                                            rehypePlugins={[rehypeRaw]}
                                          >
                                            {tech.description}
                                          </Markdown>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                            {/* sub-techniques */}
                            {techOpen && hasSubs && (
                              <tr>
                                {/* +1 for chevron col */}
                                <td colSpan={5} className="p-0">
                                  <div className="bg-blue-50 border-l-4 border-blue-400">
                                    <div className="px-8 py-4">
                                      <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                                        <GoAlert className="h-4 w-4 text-blue-600" />
                                        Sub-techniques for {tech.name}
                                      </h4>
                                      <div className="grid gap-3">
                                        {tech.subTechniques.map((sub) => (
                                          <div
                                            key={sub.id}
                                            className="bg-white p-4 rounded-lg border border-blue-200 shadow-sm hover:shadow-md"
                                          >
                                            <div className="flex justify-between mb-2">
                                              <span className="font-mono text-blue-700 text-sm">
                                                <IdCell
                                                  id={sub.id}
                                                  href={sub.ref}
                                                />
                                              </span>
                                              <span className="font-semibold text-sm">
                                                {sub.name}
                                              </span>
                                            </div>
                                            <Markdown
                                              remarkPlugins={[remarkGfm]}
                                              rehypePlugins={[rehypeRaw]}
                                            >
                                              {sub.description}
                                            </Markdown>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        )
                      })}
                  </React.Fragment>
                )
              })}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <LuSearch className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No tactic, technique, or sub-technique matches your search.</p>
          </div>
        )}
      </CardContent>
    </div>
  )
}
export { CloudAttackTable }
