'use client';

import {
  useBroadcastEvent,
  useEventListener,
  useMyPresence,
} from '@liveblocks/react/suspense';
import {
  MutableRefObject,
  PointerEvent,
  useCallback,
  useEffect,
  useState,
} from 'react';

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { shortcuts } from '@/constants';
import useInterval from '@/hooks/useInterval';
import { CursorMode, CursorState, Reaction } from '@/types/type';

import { Comments } from './comments/Comments';
import CursorChat from './cursor/CursorChat';
import LiveCursors from './cursor/LiveCursors';
import FlyingReaction from './reaction/FlyingReaction';
import ReactionSelector from './reaction/ReactionButton';

type Props = {
  canvasRef: MutableRefObject<HTMLCanvasElement | null>;
  undo: () => void;
  redo: () => void;
};

const Live = ({ canvasRef, undo, redo }: Props) => {
  const [{ cursor }, updateMyPresence] = useMyPresence();

  const [cursorState, setCursorState] = useState<CursorState>({
    mode: CursorMode.Hidden,
  });
  const [reaction, setReaction] = useState<Reaction[]>([]);

  const broadcast = useBroadcastEvent();

  useInterval(() => {
    setReaction((reaction) =>
      reaction.filter((r) => r.timestamp > Date.now() - 4000)
    );
  }, 1000);

  useInterval(() => {
    if (
      cursorState.mode === CursorMode.Reaction &&
      cursorState.isPressed &&
      cursor
    ) {
      setReaction((reactions) =>
        reactions.concat({
          point: { x: cursor.x, y: cursor.y },
          value: cursorState.reaction,
          timestamp: Date.now(),
        })
      );

      broadcast({ x: cursor.x, y: cursor.y, value: cursorState.reaction });
    }
  }, 100);

  useEventListener((eventData) => {
    const event = eventData.event;

    setReaction((reactions) =>
      reactions.concat({
        point: { x: event.x, y: event.y },
        value: event.value,
        timestamp: Date.now(),
      })
    );
  });

  const handlePointerMove = useCallback((event: PointerEvent) => {
    event.preventDefault();

    if (cursor === null || cursorState.mode !== CursorMode.ReactionSelector) {
      const x = event.clientX - event.currentTarget.getBoundingClientRect().x;
      const y = event.clientY - event.currentTarget.getBoundingClientRect().y;

      updateMyPresence({ cursor: { x, y } });
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePointerLeave = useCallback(() => {
    setCursorState({ mode: CursorMode.Hidden });
    updateMyPresence({ cursor: null, message: null });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePointerUp = useCallback(() => {
    setCursorState((state: CursorState) =>
      cursorState.mode === CursorMode.Reaction
        ? { ...state, isPressed: true }
        : state
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cursorState.mode, setCursorState]);

  const handlePointerDown = useCallback((event: PointerEvent) => {
    const x = event.clientX - event.currentTarget.getBoundingClientRect().x;
    const y = event.clientY - event.currentTarget.getBoundingClientRect().y;

    updateMyPresence({ cursor: { x, y } });

    setCursorState((state: CursorState) =>
      cursorState.mode === CursorMode.Reaction
        ? { ...state, isPressed: true }
        : state
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const onKeyUp = (event: KeyboardEvent) => {
      if (event.key === '/') {
        setCursorState({
          mode: CursorMode.Chat,
          previousMessage: null,
          message: '',
        });
      } else if (event.key === 'Escape') {
        updateMyPresence({ message: '' });
        setCursorState({ mode: CursorMode.Hidden });
      } else if (event.key === 'e') {
        setCursorState({
          mode: CursorMode.ReactionSelector,
        });
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === '/') {
        event.preventDefault();
      } else if (event.key === 'Escape') {
        updateMyPresence({ message: '' });
      }
    };

    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [updateMyPresence]);

  const setReactions = useCallback((reaction: string) => {
    setCursorState({
      mode: CursorMode.Reaction,
      reaction,
      isPressed: false,
    });
  }, []);

  const handleContextMenuCLick = useCallback((key: string) => {
    switch (key) {
      case 'Chat':
        setCursorState({
          mode: CursorMode.Chat,
          previousMessage: null,
          message: '',
        });
        break;
      case 'Reactions':
        setCursorState({ mode: CursorMode.ReactionSelector });
        break;
      case 'Undo':
        undo();
        break;
      case 'Redo':
        redo();
        break;
      default:
        break;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ContextMenu>
      <ContextMenuTrigger
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        className='relative h-full w-full flex flex-1 justify-center items-center'
        id='canvas'
      >
        <canvas ref={canvasRef} />

        {reaction.map((r) => (
          <FlyingReaction
            key={r.timestamp.toString()}
            x={r.point.x}
            y={r.point.y}
            timestamp={r.timestamp}
            value={r.value}
          />
        ))}

        {cursor && (
          <CursorChat
            cursor={cursor}
            cursorState={cursorState}
            setCursorState={setCursorState}
            updateMyPresence={updateMyPresence}
          />
        )}

        {cursorState.mode === CursorMode.ReactionSelector && (
          <ReactionSelector setReaction={setReactions} />
        )}

        <LiveCursors />

        <Comments />
      </ContextMenuTrigger>

      <ContextMenuContent className='right-menu-content'>
        {shortcuts.map((item) => (
          <ContextMenuItem
            key={item.key}
            onClick={() => handleContextMenuCLick(item.name)}
            className='right-menu-item'
          >
            <p>{item.name}</p>
            <p className='text-xs text-primary-grey-300'>{item.shortcut}</p>
          </ContextMenuItem>
        ))}
      </ContextMenuContent>
    </ContextMenu>
  );
};

export default Live;
