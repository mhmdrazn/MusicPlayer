'use client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

export function SearchInput(props: { value?: string }) {
  const router = useRouter();
  const [value, setValue] = useState(props.value ?? '');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    router.replace(`/?q=${encodeURIComponent(value)}`);
  }, [router, value]);

  return (
    <div className="relative">
      <Input
        ref={inputRef}
        type="search"
        placeholder="Search"
        value={value}
        onChange={(e) => setValue(e.currentTarget.value)}
        className="
          mb-4 
          bg-background 
          text-foreground
          border-border
          h-8 pr-8
          focus-visible:ring-1
          focus-visible:ring-ring
        "
      />

      {value ? (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6"
          onClick={() => setValue('')}
        >
          <X className="h-4 w-4 text-foreground" />
        </Button>
      ) : (
        <div
          className="
          absolute right-2 top-1/2 -translate-y-1/2
          h-5 w-5 flex items-center justify-center  
          rounded 
          border border-border
          text-muted-foreground
        "
        >
          <span className="font-mono text-xs">/</span>
        </div>
      )}
    </div>
  );
}
