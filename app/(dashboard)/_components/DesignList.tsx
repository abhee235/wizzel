
'use client';

import { Button } from '@/components/ui/button';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
// import { toast } from "sonner";

export function NoDesigns() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = () => {
    console.log('New Design created');
  };

  return (
    <div className="h-full flex flex-col items-center justify-center">
      {/* <Image src="/note.svg" alt="Empty" height={110} width={110} /> */}
      <h2 className="text-2xl font-semibold mt-6">Create your first Design</h2>
      <p className="text-muted-foreground text-sm mt-2">
        Start by creating a new design and bring your ideas to life.
      </p>
      <div className="mt-6">
        <Button size="lg" onClick={handleClick} disabled={isLoading}>
          Create Design
        </Button>
      </div>
    </div>
  );
}
