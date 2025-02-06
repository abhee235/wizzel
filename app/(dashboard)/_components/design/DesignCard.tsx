
import React, { useEffect, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import Image from 'next/image';
import Link from 'next/link';
import { Overlay } from '@/components/ui/overlay';
// import { Actions } from '@/components/ui/actions';
// import { Footer } from '@/components/ui/footer';
import { Skeleton } from '@/components/ui/skeleton';
import { MoreHorizontal, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { AvatarStack } from '@/components/ui/avatar-stack';
import { Design } from '@/types/type';

interface DesignCardProps {
  designDetail: Design;
}
export const DesignCard = ({ designDetail }: DesignCardProps) => {
  const defaultData = {
    id: 0,
    designId: '',
    title: '',
    description: '',
    status: '',
    previewImage: '',
    createdAt: new Date(),
    updatedAt: new Date(),
    isDeleted: false,
    isFavourite: false,
  };

  const [designData, setDesignData] = useState<Design>(defaultData);
  const createdDate = new Date(
    designData.createdAt || new Date().toISOString()
  );
  const createdAtLabel = designData.createdAt
    ? formatDistanceToNow(createdDate, { addSuffix: true })
    : 'Just now';

  useEffect(() => {
    if (!designDetail) return;
    console.log('desing card ddata : ', designDetail);
    setDesignData((prev) => {
      const newData = { ...prev, ...designDetail, isFavourite: false };
      console.log('adding card data ', newData);
      return {
        ...prev,
        ...designDetail,
        isFavourite: false,
      };
    });
  }, [designDetail]);

  const toggleFavourite = (e) => {
    e.stopPropagation(); // Prevent Link navigation
    setDesignData((prev) => ({
      ...prev,
      isFavourite: !prev.isFavourite,
    }));
  };

  return (
    <Link href={`/designs/${designData?.designId}`}>
      {/* <div className="group aspect-[500/350] border rounded-lg flex flex-col mt-4 justify-center overflow-hidden">
        <div className="relative flex-1 bg-amber-50">
          <Image
            src={designData?.imageUrl || '/assets/fig-default.PNG'}
            alt={designData?.title || 'Design image'}
            fill
            className="object-cover"
          />
          <Overlay />
          {/* <Actions id={id} title={title} side="right">
            <button className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity px-3 py-2 outline-none">
              <MoreHorizontal className="text-white opacity-75 hover:opacity-100 transition-opacity" />
            </button>
          </Actions>
        </div>
        <span className="text-xs bg-blue-500 text-white px-1 mt-2">
          {designData.status}
        </span>
        <div className="relative bg-white p-3">
          <p className="text-[13px] truncate max-w-[calc(100%-20px)] font-semibold">
            {designData.title}
          </p>
          <p className="text-[11px] text-muted-foreground truncate">
            {designData.authorId === 'Abhishek Kumar Singh'
              ? 'You'
              : designData.authorName}
          </p>
          <p className="text-[11px] text-muted-foreground truncate">
            {createdAtLabel}
          </p>
          <Button
            variant="secondary"
            disabled={designData.isFavourite}
            onClick={toggleFavourite}
            className={cn(
              'opacity-0 group-hover:opacity-100 transition absolute top-3 right-3 text-muted-foreground hover:text-blue-600',
              designData.isFavourite && 'cursor-not-allowed opacity-75'
            )}
          >
            <Star
              className={cn(
                'h-4 w-4',
                designData.isFavourite ? 'fill-blue-600' : 'text-blue-600'
              )}
            />
          </Button>
        </div>
      </div> */}

      <div className="bg-muted inline-block relative w-[350px] min-w-[350px] h-[350px] rounded-3xl overflow-hidden shadow-lg mb-5">
        <Image
          src={
            designData?.previewImage === ''
              ? '/assets/fig-default.PNG'
              : designData?.previewImage
          }
          width={350}
          height={180}
          alt={designData.title}
          className="object-cover max-h-[180px]"
        />
        <div
          className="text absolute top-[58%] left-[-5px] h-[65%] w-[108%]"
          //   style={{
          //     backgroundImage: 'linear-gradient(0deg , #3f5efb, #fc466b)',
          //   }}
        ></div>

        <div className=" text-black font-semibold px-4 mt-4">
          <p>{designData.title}</p>
        </div>
        <div className=" text-black px-4 mt-0 text-xs">
          <p>Edited: {createdAtLabel}</p>
        </div>
        <div className="mt-2 px-4">
          <span className=" text-white bg-blue-500 h-6 w-auto px-1 py-0.5 text-xs rounded">
            {designData.status}
          </span>
        </div>
        <AvatarStack
          className="px-4 mt-4 absolute bottom-6 left-0"
          avatars={[
            {
              name: 'Abhishek Singh',
              imageUrl: '',
            },
            {
              name: 'Piuysh Kumar',
              imageUrl: '',
            },
            {
              name: 'Dhairya Singh',
              imageUrl: '',
            },
          ]}
        />
      </div>
    </Link>
  );
};

// Skeleton loading component for the DesignCard
DesignCard.Skeleton = function DesignCardSkeleton() {
  return (
    <div className=" w-[350px] min-w-[350px] h-[400px] rounded-3xl overflow-hidden">
      <Skeleton className="h-full w-full" />
    </div>
  );
};

export default DesignCard;