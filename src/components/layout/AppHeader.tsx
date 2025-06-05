import Link from 'next/link';
import { UserNav } from '@/components/auth/UserNav';
import { Button } from '@/components/ui/button';
import { Ticket } from 'lucide-react'; // Example icon

export function AppHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Link href="/dashboard" className="mr-6 flex items-center space-x-2">
          <Ticket className="h-6 w-6 text-primary" />
          <span className="font-bold font-headline sm:inline-block text-lg">
            BBMNET Support Tracker
          </span>
        </Link>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <UserNav />
        </div>
      </div>
    </header>
  );
}
