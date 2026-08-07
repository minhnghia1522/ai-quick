import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'CSV Compare | Local CSV Difference Viewer',
  description: 'Compare two CSV files locally in your browser and inspect their differences.'
};

export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
