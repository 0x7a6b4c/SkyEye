import AttackDictionary from "@/components/features/AWS/AttackDictionary/AttackDictionary"
import MainLayout from "@/components/layouts/Main/MainLayout"
import React from "react"

export default function AttackDictionaryPage() {
  return <div className="space-y-6 p-6 mt-3">{<AttackDictionary />}</div>
}

AttackDictionaryPage.Layout = MainLayout
