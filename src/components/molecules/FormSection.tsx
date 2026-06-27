import type { FormSectionProps } from '../../types/formSection.types';

export const FormSection = ({
  title,
  titleRight,
  children,
  className = '',
}: FormSectionProps) => {
  return (
    <div className={`bg-white rounded-3xl p-5 shadow-sm ${className}`}>
      {(title || titleRight) && (
        <div className="flex items-center justify-between mb-4">
          {title && (
            <h3 className="text-lg font-semibold text-gray-700 uppercase tracking-wide">
              {title}
            </h3>
          )}
          {titleRight && <div>{titleRight}</div>}
        </div>
      )}
      {children}
    </div>
  );
};
