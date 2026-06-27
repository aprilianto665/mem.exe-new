import type { NavItemProps } from '../../types/navItem.types';
import { Text } from './Text';

export const NavItem = ({
  icon,
  label,
  isActive = false,
  onClick,
  variant = 'normal',
}: NavItemProps) => {
  if (variant === 'create') {
    return (
      <div className="w-22 h-22 rounded-full border-10 border-white">
        <button
          onClick={onClick}
          className="flex flex-col items-center justify-center w-full h-full rounded-full transition-transform duration-200 active:scale-95 cursor-pointer"
          style={{
            background: 'linear-gradient(135deg, #B1D6F4 0%, #DEC0F5 100%)',
          }}
          aria-label={label}
        >
          <div className="text-white">{icon}</div>
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center justify-center gap-1 transition-colors duration-200 active:opacity-70 cursor-pointer"
      aria-label={label}
    >
      <div className={isActive ? 'text-[#7DB8E0]' : 'text-gray-400'}>
        {icon}
      </div>
      <Text
        size="xs"
        className={isActive ? 'text-[#7DB8E0]' : 'text-gray-400'}
      >
        {label}
      </Text>
    </button>
  );
};

