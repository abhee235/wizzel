import React, { memo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faAlignCenter,
  faAlignLeft,
  faAlignRight,
} from '@fortawesome/free-solid-svg-icons';
import { Button } from '../../../../../../components/ui/button';

const Alignment = () => {
  return (
    <div className="mt-2">
      <div className="text-[10px] text-gray-600 pb-1">Alignments</div>
      <div className="flex justify-between mb-2">
        <div className="flex flex-start items-center gap-[1px]">
          <Button
            variant="secondary"
            className="w-8 h-8 text-primary-grey-300 px-2"
            onClick={() => {}}
          >
            <FontAwesomeIcon icon={faAlignLeft} />
          </Button>
          <Button
            variant="secondary"
            className="w-8 h-8 text-primary-grey-300 px-2"
            onClick={() => {}}
          >
            <FontAwesomeIcon icon={faAlignCenter} />
          </Button>
          <Button
            variant="secondary"
            className="w-8 h-8 text-primary-grey-300 px-2"
            onClick={() => {}}
          >
            <FontAwesomeIcon icon={faAlignRight} />
          </Button>
        </div>
        <div className="flex flex-start items-center gap-[1px]">
          <Button
            variant="secondary"
            className="w-8 h-8 text-primary-grey-300 px-2"
            onClick={() => {}}
          >
            <FontAwesomeIcon icon={faAlignLeft} />
          </Button>
          <Button
            variant="secondary"
            className="w-8 h-8 text-primary-grey-300 px-2"
            onClick={() => {}}
          >
            <FontAwesomeIcon icon={faAlignCenter} />
          </Button>
          <Button
            variant="secondary"
            className="w-8 h-8 text-primary-grey-300 px-2"
            onClick={() => {}}
          >
            <FontAwesomeIcon icon={faAlignRight} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default memo(Alignment);