'use Client';

//import CanvasProvider from '@/providers/CanvasProvider';
import { ReactQueryProvider } from '@/providers/ReactQueryProvider';

export default function DesignLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ReactQueryProvider>
      {children}
    </ReactQueryProvider>
  );
}
