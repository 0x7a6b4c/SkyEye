import { Navbar } from "flowbite-react"

import Link from "next/link"
import LogoTextWithSub from "@/components/icons/LogoTextWithSub"
import { cn } from "@/libs/utils"

export default function MainNavbar() {
  return (
    <Navbar
      className="py-1.5 fixed top-0 z-50 w-full border-b [&>div]:flex-nowrap"
      fluid
    >
      <div className="mr-2 flex items-center">
        <Navbar.Brand
          href="/"
          as={Link}
          className={cn("ml-0 w-fit flex gap-1")}
        >
          <div className="h-[45px] w-[45px] rounded-md bg-primary relative">
            <img
              src="/images/logo/skyeye_standalone_logo_white.png"
              alt="Skyeye logo"
              className="absolute scale-125 top-[-1px] left-[0px]"
            />
          </div>
          <img
            src="/images/logo/logo-text.png"
            alt="Skyeye logo"
            className="ml-[2px] h-[55px]"
          />
        </Navbar.Brand>
      </div>
      <div className="btn-primary w-full max-w-[280px] rounded-md border border-gray-200 p-2">
        <a
          href="/mitre-attack-matrix"
          className="block text-center font-semibold text-white"
          rel="noopener noreferrer"
        >
          MITRE ATT&CK® Matrix - Cloud
        </a>
      </div>
    </Navbar>
  )
}
