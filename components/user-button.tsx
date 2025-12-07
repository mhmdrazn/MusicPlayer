'use client';

import { useSession, signOut } from 'next-auth/react';
import { Button } from './ui/button';
import { LogOut } from 'lucide-react';

export function UserButton() {
  const { data: session } = useSession();

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' });
  };

  if (!session?.user) {
    return null;
  }

  return (
    <div className="px-4 py-3 bg-background">
      <div className="flex flex-col mb-3">
        <p className="font-bold text-xs text-foreground">{session.user.name}</p>
        <p className="text-xs text-muted-foreground">{session.user.email}</p>
      </div>
      <Button
        onClick={handleLogout}
        variant="ghost"
        className="w-full justify-start text-xs text-muted-foreground hover:text-foreground hover:bg-accent h-8 px-2"
      >
        <LogOut className="mr-2 h-3 w-3" />
        Logout
      </Button>
    </div>
  );
}
