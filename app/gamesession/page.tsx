"use client";
import {getSessionId} from '@/app/lib/utils';
import {toggleReady, getGameSessionStatus, newGame, startGame} from '@/app/lib/data';
import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation'

export default function Page() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [player, setPlayer] = useState(-1);
  const [isPlayerOneReady, setPlayerOneReady] = useState(false);
  const [isPlayerTwoReady, setPlayerTwoReady] = useState(false);
  const [isLoading, setLoading] = useState(true);

  const getReadyComponentMe = (isReady, setReady) => {
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

  const getReadyComponentOpponent = (isReady) => {
    let text;
    if (isReady)
      text = 'ready';
    else
      text = 'not ready';
    return (<div>{text}</div>);
  };

  const getReadyComponent = (isMe, isReady, setReady) => {
    if (isMe)
      return getReadyComponentMe(isReady, setReady);
    return getReadyComponentOpponent(isReady);
  };

  const onClickStartGame = async () => {
    setLoading(true);
    await startGame(id);
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
      <button onClick={onClickStartGame} disabled={!(isPlayerOneReady && isPlayerTwoReady)}>
        start game
      </button>
    </main>
  );
}

