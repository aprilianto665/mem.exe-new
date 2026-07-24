import type { ButtonProps } from '../../types/button.types';

export const Button = ({
  variant = 'primary',
  children,
  className = '',
  ...props
}: ButtonProps) => {
  const baseStyles =
    'px-4 py-3 rounded-2xl font-medium text-base transition-colors duration-200 cursor-pointer focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2';

  const variantStyles = {
    primary:
      'text-white bg-[#7DB8E0] hover:bg-[#6BA8D0]',
    secondary:
      'bg-gray-200 text-gray-800 hover:bg-gray-300',
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

