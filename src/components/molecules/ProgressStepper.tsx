import type { ProgressStepperProps } from '../../types/progressStepper.types';

export const ProgressStepper = ({
  currentStep,
  steps,
}: ProgressStepperProps) => {
  return (
    <div className="flex items-center justify-center mb-8">
      {steps.map((step, index) => {
        const stepNumber = index + 1;
        const isActive = stepNumber === currentStep;
        const isCompleted = stepNumber < currentStep;

        return (
          <div key={step} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm ${
                  isActive
                    ? 'bg-[#7DB8E0] text-white'
                    : isCompleted
                    ? 'bg-[#7DB8E0] text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {stepNumber}
              </div>
              <span
                className={`text-xs font-semibold mt-2 uppercase tracking-wide ${
                  isActive ? 'text-[#7DB8E0]' : 'text-gray-500'
                }`}
              >
                {step}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`w-16 h-0.5 mx-2 ${
                  isCompleted ? 'bg-[#7DB8E0]' : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

