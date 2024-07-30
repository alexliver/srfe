"use client";
import Loading from '@/app/ui/loading';
import {getSessionId, getQueryString} from '@/app/lib/utils';
import {joinKOTH, toggleKOTHReady, changeName, getKOTHStatus, startKOTH} from '@/app/lib/data';
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
  const [rank, setRank] = useState(0);
  const [queue, setQueue] = useState<string[]>([]);
  const [name, setName] = useState<string[]>('');
  const [isPlayerOneReady, setPlayerOneReady] = useState(false);
  const [isPlayerTwoReady, setPlayerTwoReady] = useState(false);
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      const kothStatus = await joinKOTH(id, getSessionId());
      updateKOTHStatus(kothStatus);
      setName(kothStatus.queue[kothStatus.rank]);
      setLoading(false);
    };
    init()
  }, []);

  const fetchSession = async () => {
    const kothStatus = await getKOTHStatus(id, getSessionId());
    updateKOTHStatus(kothStatus);
  };

  const updateKOTHStatus = (kothStatus:any) => {
    setRank(kothStatus.rank);
    setQueue(kothStatus.queue);
    setPlayerOneReady(kothStatus.isPlayerOneReady);
    setPlayerTwoReady(kothStatus.isPlayerTwoReady);
    if (kothStatus.inProgressGameID)
      goToGame( kothStatus.inProgressGameID);
  };

  useEffect(() => {
    const key = setInterval( fetchSession, 5000);
    return () => clearInterval(key);
  }, []);


  const getPlayerComponents = () => queue.map(getPlayerComponent);

  const getPlayerComponent = (name: string, index:number) => {
    if (index == rank)
      return getMyComponent();
    let readyText = '';
    if (index == 0)
      readyText = getReadyText(isPlayerOneReady);
    if (index == 1)
      readyText = getReadyText(isPlayerTwoReady);
    return (
      <div>
        <span>{name} </span><span>{readyText}</span>
      </div>
    );
  };

  const getMyComponent = () => {
    const onChangeName = (event) => {
      setName( event.target.value);
    };
    const nameInput = (
      <input type="text" value={name} onChange={onChangeName} placeholder='your name' />
    );
    let buttonComp ;
    const onClickToggleReady = async () => {
      setLoading(true);
      const result = await toggleKOTHReady(id, getSessionId(), name);
      updateKOTHStatus(result);
      setLoading(false);
    };
    const onClickChangeName = async () => {
      setLoading(true);
      await changeName(getSessionId(), name);
      const newQueue = queue.map((a)=>a);
      newQueue[rank] = name;
      setQueue(newQueue);
      setLoading(false);
    };
    if (rank <= 1) {
      let buttonText = getReadyButtonText(isPlayerOneReady);
      if (rank == 1)
        buttonText = getReadyButtonText(isPlayerTwoReady);
      buttonComp = (
        <button onClick={onClickToggleReady}>{buttonText}</button>
      );
    } else {
      buttonComp = (
        <button onClick={onClickChangeName} disabled={queue[rank] == name}>update name</button>
      );
    }
    return (<span><span>{nameInput} </span><span>{buttonComp}</span></span>);
  };

  const onClickStart = async () => {
    setLoading(true);
    const gameId = await startKOTH(id);
    goToGame(gameId);
  };

  const goToGame = (gameId:string) => {
    router.push('/kothgame?id=' + gameId + '&koth_id=' + id);
  };

  return (
    <main >
      {isLoading?<Loading />:null}
      <div className='shakespeare'>
        {getPlayerComponents()}
        <button onClick={onClickStart} 
          disabled={rank != 0 || !isPlayerOneReady || !isPlayerTwoReady}>start</button>
      </div>
    </main>
  );
}


function getReadyText(isReady:boolean) {
  if (isReady)
    return 'ready';
  return 'not ready';
}

function getReadyButtonText(isReady:boolean) {
  if (isReady)
    return 'get unready';
  return 'get ready';
}
