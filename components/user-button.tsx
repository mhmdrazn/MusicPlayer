
// import { auth, signIn, signOut } from '@/lib/auth';
import { Button } from './ui/button';
import Image from 'next/image';
import { LogIn, LogOut } from 'lucide-react';

// async function signInAction() {
//   'use server';
//   await signIn();
// }

// async function signOutAction() {
//   'use server';
//   await signOut();
// }

export async function UserButton() {
  // const session = await auth();

  // if (!session?.user) {
  //   return (
  //     <form action={signInAction}>
  //       <Button variant="ghost" className="w-full flex justify-start">
  //         <LogIn className="mr-2" />
  //         Sign In
  //       </Button>
  //     </form>
  //   );
  // }

  return (
    <div className="flex items-center gap-4 p-2">
      <div className="flex flex-col">
        {/* <p className="font-bold">{session.user.name}</p> */}
        {/* <p className="text-sm text-gray-400">{session.user.email}</p> */}
      </div>
      {/* <form action={signOutAction}> */}
        <Button variant="ghost">
          <LogOut />
        </Button>
      {/* </form> */}
    </div>
  );
}
