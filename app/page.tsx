"use client";
import Loading from '@/app/ui/loading';
import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import {getSessionId} from '@/app/lib/utils';
import {newGame} from '@/app/lib/data';
import { useRouter } from 'next/navigation';

export default function Page() {
  const router = useRouter();

  const [isLoading, setLoading] = useState(false);
  const onClickNewGame = async () => {
    setLoading(true);
    const id = getId();
    const sessionId = getSessionId();
    await newGame(id, sessionId);
    router.push('/gamesession?id=' + id);
  };

  return (
    <main >
      {isLoading?<Loading />:null}
      <div >
        <button onClick={onClickNewGame}>
          new game
        </button>
      </div>
    </main>
  );
}

function getId(): string {
  return uuidv4();
}
