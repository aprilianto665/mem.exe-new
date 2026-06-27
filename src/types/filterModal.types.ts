export interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCommitmentType: string;
  setSelectedCommitmentType: (value: string) => void;
  selectedStatus: string;
  setSelectedStatus: (value: string) => void;
}

