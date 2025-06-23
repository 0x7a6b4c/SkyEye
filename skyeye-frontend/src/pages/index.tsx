import { Card } from "flowbite-react"

import MainLayout from "@/components/layouts/Main/MainLayout"

export default function HomePage() {
  return (
    <img
      src="/images/banner/Banners-03.jpg"
      alt="Skyeye Banner"
      className="w-full h-auto mt-2"
    />
  )
}

HomePage.Layout = MainLayout
