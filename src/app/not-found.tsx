import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
      <div className="max-w-md mx-auto text-center px-6">
        <div className="mb-8">
          <h1 className="text-6xl font-bold text-slate-900 dark:text-white mb-4">
            404
          </h1>
          <h2 className="text-2xl font-semibold text-slate-700 dark:text-slate-300 mb-4">
            Page not found
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-8">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
        </div>
        
        <div className="space-y-4">
          <Link href="/" className="block">
            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
              Go back home
            </Button>
          </Link>
          
          <Link href="mailto:kevin@kgeng.dev" className="block">
            <Button 
              variant="outline" 
              className="w-full border-slate-300 dark:border-slate-600"
            >
              Contact me
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}