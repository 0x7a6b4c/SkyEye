import CloudAttackTable from "@/components/features/MITRE/CloudAttackTable"
import MainLayout from "@/components/layouts/Main/MainLayout"
import React from "react"

export default function MitreAttackPage() {
  return (
    <div className="flex justify-center mb-10">
      <CloudAttackTable />
    </div>
  )
}

MitreAttackPage.Layout = MainLayout
