export type InfoBoxVariant = 'info' | 'warning';

export interface InfoBoxProps {
  variant?: InfoBoxVariant;
  title?: string;
  children: React.ReactNode;
  className?: string;
  noBackground?: boolean;
  customIconColor?: string;
  customTextColor?: string;
  fontWeight?: 'normal' | 'semibold';
}

