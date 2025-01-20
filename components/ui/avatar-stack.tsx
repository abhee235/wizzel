import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from './avatar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './tooltip';

const avatarStackVariants = cva('flex', {
  variants: {
    orientation: {
      vertical: 'flex-row-reverse space-x-reverse',
      horizontal: 'flex-col',
    },
    spacing: {
      sm: '-space-x-5 -space-y-5',
      md: '-space-x-4 -space-y-4',
      lg: '-space-x-3 -space-y-3',
      xl: '-space-x-2 -space-y-2',
    },
  },
  defaultVariants: {
    orientation: 'vertical',
    spacing: 'lg',
  },
});

export interface AvatarStackProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof avatarStackVariants> {
  avatars: { name: string; image: string }[];
  maxAvatarsAmount?: number;
}

const AvatarStack = ({
  className,
  orientation,
  avatars,
  spacing,
  maxAvatarsAmount = 3,
  ...props
}: AvatarStackProps) => {
  const shownAvatars = avatars.slice(0, maxAvatarsAmount).reverse();
  const hiddenAvatars = avatars.slice(maxAvatarsAmount);
  const colorPallets = [
    'bg-[#636c6f]',
    'bg-[#d05c44]',
    'bg-[#825da6]',
    'bg-[#2c5bb2]',
  ];

  return (
    <div
      className={cn(
        avatarStackVariants({ orientation, spacing }),
        className,
        orientation === 'horizontal' ? '-space-x-0' : '-space-y-0'
      )}
      {...props}
    >
      {hiddenAvatars.length ? (
        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Avatar key="Excesive avatars">
                <AvatarFallback
                  className={cn(
                    'border-2 border-white text-white',
                    colorPallets[colorPallets.length - 1]
                  )}
                >
                  +{avatars.length - shownAvatars.length}
                </AvatarFallback>
              </Avatar>
            </TooltipTrigger>
            <TooltipContent>
              {hiddenAvatars.map(({ name }, index) => (
                <p key={`${name}-${index + 1}`}>{name}</p>
              ))}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : null}

      {shownAvatars.map(({ name, image }, index) => (
        <TooltipProvider delayDuration={300} key={`${image}-${index + 1}`}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Avatar className={cn(avatarStackVariants(), 'hover:z-10')}>
                <AvatarImage src={image} />
                <AvatarFallback
                  className={cn(
                    'border-2 border-white text-white',
                    colorPallets[index % 3]
                  )}
                >
                  {name
                    ?.split(' ')
                    ?.map((word) => word[0])
                    ?.join('')
                    ?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </TooltipTrigger>
            <TooltipContent>
              <p>{name}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ))}
    </div>
  );
};

export { AvatarStack, avatarStackVariants };