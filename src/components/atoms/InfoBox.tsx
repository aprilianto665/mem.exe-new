import { InformationCircleIcon } from '@heroicons/react/24/solid';
import { ExclamationTriangleIcon } from '@heroicons/react/24/solid';
import type { InfoBoxProps } from '../../types/infoBox.types';

export const InfoBox = ({
  variant = 'info',
  title,
  children,
  className = '',
  noBackground = false,
  customIconColor,
  customTextColor,
  fontWeight = 'semibold',
}: InfoBoxProps) => {
  const variantStyles = {
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    warning: 'bg-[#FFFDFA] border-orange-200',
  };

  const Icon = variant === 'info' ? InformationCircleIcon : ExclamationTriangleIcon;
  
  const defaultIconColor = variant === 'info' ? 'text-blue-500' : 'text-[#EA590D]';
  const iconColorClass = customIconColor 
    ? (customIconColor.startsWith('#') ? '' : `text-${customIconColor}`)
    : defaultIconColor;
  
  const defaultTextColor = variant === 'warning' ? 'text-[#EA590D]' : '';
  const textColorClass = customTextColor 
    ? (customTextColor.startsWith('#') ? '' : `text-${customTextColor}`)
    : defaultTextColor;
  
  const weightClass = fontWeight === 'normal' ? 'font-normal' : 'font-semibold';
  
  const containerClass = noBackground
    ? 'p-0'
    : `rounded-2xl border p-4 ${variantStyles[variant]}`;

  const iconStyle = customIconColor && customIconColor.startsWith('#') 
    ? { color: customIconColor } 
    : {};
  const textStyle = customTextColor && customTextColor.startsWith('#') 
    ? { color: customTextColor } 
    : {};

  return (
    <div className={`${containerClass} ${className}`}>
      <div className="flex gap-3">
        <div className="flex-1">
          <div className="flex gap-2 items-center">
            <Icon 
              className={`w-5 h-5 flex-shrink-0 ${iconColorClass}`}
              style={iconStyle}
            />
            {title && (
              <span 
                className={`${weightClass} text-sm ${textColorClass}`}
                style={textStyle}
              >
                {title}
              </span>
            )}
          </div>
          {children && <div className="text-sm">{children}</div>}
        </div>
      </div>
    </div>
  );
};
