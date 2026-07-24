export type FrequencyType = 'everyday' | 'custom';

export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface FrequencySelectorProps {
  value: FrequencyType;
  onChange: (value: FrequencyType) => void;
  selectedDays?: DayOfWeek[];
  onDaysChange?: (days: DayOfWeek[]) => void;
}
