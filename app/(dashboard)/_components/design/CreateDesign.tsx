import React from 'react';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Overlay } from '@/components/ui/overlay';
import Image from 'next/image';

interface NewDesignProps {
  disabled: boolean;
  handleCreateDraft: () => void;
}

const CreateDesign = ({ disabled, handleCreateDraft }: NewDesignProps) => {
  return (
    <button
      disabled={disabled}
      onClick={handleCreateDraft}
      className={cn(
        'col-span-1  min-w-[370px] h-[340px] bg-blue-600 rounded-lg hover:bg-blue-800 flex flex-col items-center justify-center py-6',
        disabled && 'opacity-65 hover:bg-blue-600 cursor-not-allowed'
      )}
    >
      <Plus className="h-12 w-12 text-white stroke-1" />
      <p className="text-sm text-white font-light">New board</p>
    </button>
  );
};

export default CreateDesign;
