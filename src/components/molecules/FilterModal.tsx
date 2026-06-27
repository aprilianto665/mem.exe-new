import type { FilterModalProps } from "../../types/filterModal.types";
import { Modal } from "../atoms/Modal";
import { Text } from "../atoms/Text";
import { CapsuleButton } from "../atoms/CapsuleButton";

export const FilterModal = ({
  isOpen,
  onClose,
  selectedCommitmentType,
  setSelectedCommitmentType,
  selectedStatus,
  setSelectedStatus,
}: FilterModalProps) => {

  const commitmentTypeOptions = [
    { id: "all", label: "All" },
    { id: "daily_habit", label: "Daily Habit" },
    { id: "challenge", label: "Challenge" },
  ];

  const statusOptions = [
    { id: "all", label: "All" },
    { id: "active", label: "Active" },
    { id: "completed", label: "Completed" },
    { id: "cancelled", label: "Cancelled" },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-6 pb-8">
        {/* Title */}
        <Text size="xl" weight="bold" className="text-gray-700 mb-6">
          Filter
        </Text>

        {/* Commitment Type Filter Section */}
        <div className="mb-6">
          <Text size="base" weight="semibold" className="text-gray-700 mb-3">
            Commitment Type
          </Text>
          <div className="flex gap-2 flex-wrap">
            {commitmentTypeOptions.map((option) => (
              <CapsuleButton
                key={option.id}
                active={selectedCommitmentType === option.id}
                onClick={() => setSelectedCommitmentType(option.id)}
              >
                {option.label}
              </CapsuleButton>
            ))}
          </div>
        </div>

        {/* Status Filter Section */}
        <div>
          <Text size="base" weight="semibold" className="text-gray-700 mb-3">
            Status
          </Text>
          <div className="flex gap-2 flex-wrap">
            {statusOptions.map((option) => (
              <CapsuleButton
                key={option.id}
                active={selectedStatus === option.id}
                onClick={() => setSelectedStatus(option.id)}
              >
                {option.label}
              </CapsuleButton>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
};
