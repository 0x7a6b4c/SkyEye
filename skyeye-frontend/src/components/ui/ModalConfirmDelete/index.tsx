import { Button, Modal } from "flowbite-react"
import { ReactNode } from "react"

import NonSSRWrapper from "@/components/ui/NonSSRWrapper"

interface ModalConfirmDeleteProps {
  onDelete: () => void
  className?: string
  onClose?: () => void
  isShow?: boolean
  content?: ReactNode
}

export default function ModalConfirmDelete({
  onDelete,
  className = "",
  onClose = undefined,
  isShow = undefined,
  content = undefined,
}: ModalConfirmDeleteProps) {
  return (
    <NonSSRWrapper>
      <Modal
        className={className}
        show={!!isShow}
        size="lg"
        onClose={onClose}
        popup
        dismissible
      >
        <Modal.Header />
        <Modal.Body>
          <div className="text-center">
            {content || (
              <h3 className="mb-5 whitespace-pre-line text-lg font-normal text-gray-500 dark:text-gray-400">
                {"Are you sure you want to delete the selected records?"}
              </h3>
            )}
            <div className="flex justify-center gap-4">
              <Button className="w-1/3" color="gray" onClick={onClose}>
                {"No"}
              </Button>
              <Button className="w-1/3" color="failure" onClick={onDelete}>
                {"Yes"}
              </Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </NonSSRWrapper>
  )
}
