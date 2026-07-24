export type CommitmentLevel = 'normal' | 'hard' | 'extreme';

export interface CommitmentLevelSelectorProps {
  value: CommitmentLevel;
  onChange: (value: CommitmentLevel) => void;
}
