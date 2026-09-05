import { Inter } from 'next/font/google';
import { AuthProvider } from '@/components/AuthContext';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata = {
  title: 'MentorSphere - Student Mentorship Program',
  description: 'A student mentorship management platform connecting students with mentors.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}