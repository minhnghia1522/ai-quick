import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'CSV Toolkit | Local CSV Editor',
  description: 'Edit, inspect, clean, and export CSV files locally in your browser.'
};

export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
