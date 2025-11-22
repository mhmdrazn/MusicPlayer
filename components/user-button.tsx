
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
    <div className="px-4 py-3 bg-[#121212]">
      <div className="flex flex-col mb-3">
        <p className="font-bold text-xs text-white">{session.user.name}</p>
        <p className="text-xs text-gray-500">{session.user.email}</p>
      </div>
      <Button
        onClick={handleLogout}
        variant="ghost"
        className="w-full justify-start text-xs text-gray-400 hover:text-white hover:bg-[#1A1A1A] h-8 px-2"
      >
        <LogOut className="mr-2 h-3 w-3" />
        Logout
      </Button>
    </div>
  );
}
