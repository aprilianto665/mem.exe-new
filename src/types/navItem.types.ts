export type NavItemVariant = 'normal' | 'create';

export interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  isActive?: boolean;
  onClick?: () => void;
  variant?: NavItemVariant;
}

