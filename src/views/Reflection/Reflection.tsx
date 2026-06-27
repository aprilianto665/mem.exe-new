import { PageTemplate } from '../../components/templates/PageTemplate';
import { Text } from '../../components/atoms/Text';

export const Reflection = () => {
  return (
    <PageTemplate>
      <div className="flex flex-col items-center justify-center" style={{ height: 'calc(100vh - 200px)' }}>
        <div className="mb-6">
          <img 
            src="/mem_icon.png" 
            alt="Mem Icon" 
            className="w-24 h-24 object-contain mx-auto"
            style={{ filter: 'grayscale(100%) brightness(0.25)' }}
          />
        </div>
        <Text size="2xl" weight="bold" className="text-gray-700 mb-4 text-center">
          Reflection
        </Text>
        <Text size="base" className="text-gray-600 text-center">
          This feature is under development
        </Text>
      </div>
    </PageTemplate>
  );
};

