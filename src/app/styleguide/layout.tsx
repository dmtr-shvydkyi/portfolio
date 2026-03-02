import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Style Guide | Dmytro Shvydkyi',
  description: 'Living style guide — design tokens and UI components.',
};

export default function StyleguideLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
