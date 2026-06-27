export type CommitmentType = 'daily-habit' | 'challenge';

export interface CommitmentTypeSelectorProps {
  value: CommitmentType;
  onChange: (value: CommitmentType) => void;
}

