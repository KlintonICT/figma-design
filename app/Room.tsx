'use client';

import { LiveMap } from '@liveblocks/client';
import {
  LiveblocksProvider,
  RoomProvider,
  ClientSideSuspense,
} from '@liveblocks/react/suspense';
import { ReactNode } from 'react';

import Loader from '@/components/Loader';

export const Room = ({ children }: { children: ReactNode }) => {
  return (
    <LiveblocksProvider
      publicApiKey={process.env.NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY!}
      // resolveUsers={async () => []}
    >
      <RoomProvider
        id='my-room'
        initialPresence={{ cursor: null, cursorColor: null, editingText: null }}
        initialStorage={{
          canvasObjects: new LiveMap(),
        }}
      >
        <ClientSideSuspense fallback={<Loader />}>
          {children}
        </ClientSideSuspense>
      </RoomProvider>
    </LiveblocksProvider>
  );
};
