
'use client';

import React from 'react';
import DesignList from './_components/DesignList';
import { ReactQueryProvider } from '@/providers/ReactQueryProvider';

interface DashboardPageProps {
  searchParams: {
    search?: string;
    //favourites?: string;
  };
}

const DashboardPage = ({ searchParams }: DashboardPageProps) => {
  return (
    <ReactQueryProvider>
      <div className=" p-6 bg-white h-full">
        <DesignList query={'fjsldj'} />
      </div>
    </ReactQueryProvider>
  );
};

export default DashboardPage;