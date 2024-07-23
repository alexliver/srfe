"use client";
import {getSessionId, getQueryString} from '@/app/lib/utils';
import {toggleReady, getGameSessionStatus, newGame, startGame} from '@/app/lib/data';
import { useRouter } from 'next/navigation';
import { Suspense } from 'react'
import React, { useState, useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation'

export default function Page() {
  return (
    <Suspense>
      <Page1 />
    </Suspense>
  )
};

function Page1() {
  const router = useRouter();
  const id = getQueryString("id");
  const [player, setPlayer] = useState(-1);
  const [isPlayerOneReady, setPlayerOneReady] = useState(false);
  const [isPlayerTwoReady, setPlayerTwoReady] = useState(false);
  const [isLoading, setLoading] = useState(true);

  const getReadyComponentMe = (isReady:boolean, setReady:any) => {
    const onClickReady = async () => {
      setLoading(true);
      await toggleReady(id, getSessionId(), !isReady);
      setReady(!isReady);
      setLoading(false);
    };
    let text;
    if (isReady)
      text = "get unready";
    else
      text = "get ready";
    return (<button onClick={onClickReady} > {text}</button>);
  };

  const getReadyComponentOpponent = (isReady:boolean) => {
    let text;
    if (isReady)
      text = 'ready';
    else
      text = 'not ready';
    return (<div>{text}</div>);
  };

  const getReadyComponent = (isMe:boolean, isReady:boolean, setReady:any) => {
    if (isMe)
      return getReadyComponentMe(isReady, setReady);
    return getReadyComponentOpponent(isReady);
  };

  const onClickStartGame = async () => {
    setLoading(true);
    await startGame(id, getSessionId());
    router.push('/game?id=' + id);
  };

  const fetchSession = async () => {
    const session = await getGameSessionStatus(id, getSessionId());
    if (session.isStarted) {
      router.push('/game?id=' + id);
    }
    setPlayerOneReady(session.isPlayerOneReady);
    setPlayerTwoReady(session.isPlayerTwoReady);
    setPlayer(session.player);
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await newGame(id, getSessionId());
      await fetchSession();
      setLoading(false);
    };
    init()
  }, []);
  useEffect(() => {
    const key = setInterval( fetchSession, 5000);
    return () => clearInterval(key);
  }, []);

  const playerOneReadyComponent = getReadyComponent(player == 0, isPlayerOneReady, 
    setPlayerOneReady);
  const playerTwoReadyComponent = getReadyComponent(player == 1, isPlayerTwoReady, 
    setPlayerTwoReady);

  if (isLoading) 
    return (<main>loading</main>);
  return (
    <main >
      <div >
        player one {playerOneReadyComponent}
      </div>
      <div >
        player two {playerTwoReadyComponent}
      </div>
      <button onClick={onClickStartGame} disabled={!(isPlayerOneReady && isPlayerTwoReady) 
      || player == 1}>
        start game
      </button>
    </main>
  );
}

