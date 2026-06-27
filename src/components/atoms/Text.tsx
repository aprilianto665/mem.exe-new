import type { TextProps } from '../../types/text.types';

export const Text = ({
  size = 'base',
  weight = 'normal',
  as: Component = 'p',
  children,
  className = '',
  ...props
}: TextProps) => {
  const sizeStyles = {
    xs: 'text-xs',
    sm: 'text-sm',
    base: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
    '2xl': 'text-2xl',
    '3xl': 'text-3xl',
  };

  const weightStyles = {
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold',
  };

  return (
    <Component
      className={`${sizeStyles[size]} ${weightStyles[weight]} ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
};

