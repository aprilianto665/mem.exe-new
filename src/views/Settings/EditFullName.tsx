"use client";

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { PageTemplate } from '../../components/templates/PageTemplate';
import { Text } from '../../components/atoms/Text';
import { Button } from '../../components/atoms/Button';
import { Input } from '../../components/atoms/Input';
import { FormSection } from '../../components/molecules/FormSection';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export const EditFullName = () => {
  const router = useRouter();
  const [fullName, setFullName] = useState('Cyrene');

  return (
    <PageTemplate>
      <div className="flex flex-col h-full pb-32">
        {/* Header */}
        <div className="flex-shrink-0 mb-6 relative flex items-center justify-center">
          <button
            onClick={() => router.push('/settings/profile')}
            className="absolute left-0 flex items-center gap-1.5 text-gray-600 hover:text-gray-800 cursor-pointer px-2 py-1 rounded-xl hover:bg-white/50"
          >
            <ArrowLeftIcon strokeWidth={2.5} className="w-5 h-5" />
            <Text size="sm" weight="semibold">Back</Text>
          </button>
          
          <Text size="2xl" weight="bold" className="text-gray-800">
            Edit Full Name
          </Text>
        </div>

        {/* Form Section */}
        <div className="flex-1 space-y-4">
          <FormSection title="FULL NAME">
            <Input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your full name"
              variant="noBorder"
              autoFocus
            />
          </FormSection>

          <Button
            variant="primary"
            className="w-full !py-3 !text-base"
          >
            Save Changes
          </Button>
        </div>
      </div>
    </PageTemplate>
  );
};

