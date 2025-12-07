'use client';

import { useState, useRef, useEffect } from 'react';
import { useActionState } from 'react';
import { PencilIcon, Loader2, CheckIcon } from 'lucide-react';
import { updateTrackAction, updateTrackImageAction } from './actions';
import { usePlayback } from './playback-context';
import { songs } from '@/lib/db/schema';
import { cn } from '@/lib/utils';

export function NowPlaying() {
  const { currentTrack } = usePlayback();
  const [imageState, imageFormAction, imagePending] = useActionState(updateTrackImageAction, {
    success: false,
    imageUrl: '',
  });
  const [showPencil, setShowPencil] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (!imagePending) {
      timer = setTimeout(() => setShowPencil(true), 300);
    } else {
      setShowPencil(false);
    }

    return () => clearTimeout(timer);
  }, [imagePending]);

  if (!currentTrack) return null;

  const currentImageUrl = imageState?.success ? imageState.imageUrl : currentTrack.imageUrl;

  return (
    <div className="hidden md:flex flex-col w-56 p-4 bg-background border-l border-border overflow-auto">
      <h2 className="mb-3 text-sm font-semibold text-foreground">Now Playing</h2>

      {/* Cover */}
      <div className="relative w-full aspect-square mb-3 group">
        <img
          src={currentImageUrl || '/placeholder.svg'}
          alt={currentTrack.name}
          className="w-full h-full object-cover rounded-md"
        />

        <form action={imageFormAction} className="absolute inset-0">
          <input type="hidden" name="trackId" value={currentTrack.id} />

          <label
            htmlFor="imageUpload"
            className="absolute inset-0 cursor-pointer flex items-center justify-center"
          >
            <input
              id="imageUpload"
              type="file"
              name="file"
              className="hidden"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  if (file.size <= 5 * 1024 * 1024) {
                    e.target.form?.requestSubmit();
                  } else {
                    alert('File size exceeds 5MB limit');
                    e.target.value = '';
                  }
                }
              }}
            />

            {/* Overlay & icon */}
            <div
              className={cn(
                'rounded-full p-2 transition-colors',
                'bg-black/40 dark:bg-white/20 opacity-0 group-hover:opacity-100',
                imagePending && 'opacity-100'
              )}
            >
              {imagePending ? (
                <Loader2 className="w-6 h-6 text-white animate-spin" />
              ) : (
                showPencil && <PencilIcon className="w-6 h-6 text-white transition-opacity" />
              )}
            </div>
          </label>
        </form>
      </div>

      {/* Editable fields */}
      <div className="w-full space-y-1">
        <EditableInput
          initialValue={currentTrack.name}
          trackId={currentTrack.id}
          field="name"
          label="Title"
        />
        <EditableInput
          initialValue={currentTrack.artist}
          trackId={currentTrack.id}
          field="artist"
          label="Artist"
        />
        <EditableInput
          initialValue={currentTrack.genre || ''}
          trackId={currentTrack.id}
          field="genre"
          label="Genre"
        />
        <EditableInput
          initialValue={currentTrack.album || ''}
          trackId={currentTrack.id}
          field="album"
          label="Album"
        />
        <EditableInput
          initialValue={currentTrack.bpm?.toString() || ''}
          trackId={currentTrack.id}
          field="bpm"
          label="BPM"
        />
        <EditableInput
          initialValue={currentTrack.key || ''}
          trackId={currentTrack.id}
          field="key"
          label="Key"
        />
      </div>
    </div>
  );
}

interface EditableInputProps {
  initialValue: string;
  trackId: string;
  field: keyof typeof songs.$inferInsert;
  label: string;
}

export function EditableInput({ initialValue, trackId, field, label }: EditableInputProps) {
  let [isEditing, setIsEditing] = useState(false);
  let [value, setValue] = useState(initialValue);
  let [showCheck, setShowCheck] = useState(false);
  let inputRef = useRef<HTMLInputElement>(null);
  let formRef = useRef<HTMLFormElement>(null);
  let [state, formAction, pending] = useActionState(updateTrackAction, {
    success: false,
    error: '',
  });

  useEffect(() => {
    if (isEditing) inputRef.current?.focus();
  }, [isEditing]);

  useEffect(() => {
    setValue(initialValue);
    setIsEditing(false);
    setShowCheck(false);
  }, [initialValue, trackId]);

  useEffect(() => {
    if (state.success) {
      setShowCheck(true);
      const timer = setTimeout(() => setShowCheck(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [state.success]);

  function handleSubmit() {
    if (value.trim() === '' || value === initialValue) {
      setIsEditing(false);
      return;
    }
    formRef.current?.requestSubmit();
    setIsEditing(false);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setValue(initialValue);
    }
  }

  return (
    <div className="space-y-1 group">
      <label htmlFor={`${field}-input`} className="text-xs text-muted-foreground">
        {label}
      </label>

      <div className="flex items-center justify-between w-full text-xs border-b border-border focus-within:border-primary transition-colors">
        {isEditing ? (
          <form ref={formRef} action={formAction} className="w-full">
            <input type="hidden" name="trackId" value={trackId} />
            <input type="hidden" name="field" value={field} />

            <input
              ref={inputRef}
              id={`${field}-input`}
              type="text"
              name={field}
              value={value}
              onKeyDown={handleKeyDown}
              onBlur={handleSubmit}
              onChange={(e) => setValue(e.target.value)}
              className={cn(
                'bg-transparent w-full focus:outline-none p-0 text-foreground',
                state.error && 'text-red-500'
              )}
            />
          </form>
        ) : (
          <div
            className="w-full cursor-pointer truncate text-foreground"
            onClick={() => setIsEditing(true)}
          >
            <span className={cn(!value && 'text-muted-foreground')}>{value || '-'}</span>
          </div>
        )}

        <div className="flex items-center pl-2">
          {pending ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : showCheck ? (
            <CheckIcon className="w-3 h-3 text-green-500" />
          ) : (
            !isEditing && (
              <PencilIcon className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
            )
          )}
        </div>
      </div>

      {state.error && (
        <p id={`${field}-error`} className="text-xs text-red-500">
          {state.error}
        </p>
      )}
    </div>
  );
}
