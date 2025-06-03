import React from "react"

const LogoNode: React.FC<any> = () => {
  return (
    <div className="pointer-events-none opacity-25 z-0">
      <img
        src={"/images/logo/SkyEye_RoyalBlue_PNG.png"} // updated path to public/logo folder
        alt="Logo"
        style={{ width: "700px" }}
      />
    </div>
  )
}

export default LogoNode
