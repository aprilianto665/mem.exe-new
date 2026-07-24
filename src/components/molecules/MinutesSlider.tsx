import { Slider } from '../atoms/Slider';
import { InfoBox } from '../atoms/InfoBox';

export interface MinutesSliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
}

export const MinutesSlider = ({
  value,
  onChange,
  min = 15,
  max = 240,
  step = 5,
}: MinutesSliderProps) => {
  const formatMinutes = (minutes: number) => `${minutes}m`;
  const isWarning = value > 180;
  const warningColor = isWarning ? '#F6657E' : undefined;

  return (
    <div className="space-y-4">
      <Slider
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={onChange}
        formatValue={formatMinutes}
        warningColor={warningColor}
      />
      <div className="flex items-center justify-between text-sm text-gray-600">
        <span className="text-xs">{formatMinutes(min)}</span>
        <span className="text-xs">{formatMinutes(120)}</span>
        <span className="text-xs">{formatMinutes(max)}</span>
      </div>
      <div className="space-y-2">
        <InfoBox
          variant="info"
          title="Recommended: 30-120 minutes"
          noBackground
          customIconColor="gray-500"
          customTextColor="gray-600"
          fontWeight="normal"
        >
          {null}
        </InfoBox>
        {value > 180 && (
          <InfoBox
            variant="warning"
            title="Over 180 minutes may increase failure risk"
            noBackground
            customIconColor="#F6657E"
            customTextColor="#F6657E"
            fontWeight="normal"
          >
            {null}
          </InfoBox>
        )}
      </div>
    </div>
  );
};

