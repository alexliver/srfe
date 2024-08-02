"use client";
import { useSearchParams } from 'react-router-dom';
import Loading from './component/loading';
import {getSessionId} from './lib/utils';
import {joinKOTH, toggleKOTHReady, changeName, getKOTHStatus, startKOTH} from './lib/data';
import { Suspense } from 'react'
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Page() {
  return (
    <Suspense>
      <Page1 />
    </Suspense>
  )
};

function Page1() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const id = searchParams.get('id') || '';
  const [rank, setRank] = useState(0);
  const [queue, setQueue] = useState<string[]>([]);
  const [name, setName] = useState('');
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
    init();
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


  const getPlayerComponents = () => {
    return (
      <table>
        <tbody>
          {queue.map(getPlayerComponent)}
        </tbody>
      </table>
    );
  }

  const getPlayerComponent = (name: string, index:number) => {
    if (index == rank)
      return getMyComponent();
    let readyText = '';
    if (index == 0)
      readyText = getReadyText(isPlayerOneReady);
    if (index == 1)
      readyText = getReadyText(isPlayerTwoReady);
    return (
      <tr>
        <td>player {index+1}</td>
        <td>{name} </td>
        <td>{readyText}</td>
      </tr>
    );
  };

  const getMyComponent = () => {
    const onChangeName = (event:any) => {
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
    return (
      <tr>
        <td>player {rank+1}</td>
        <td>{nameInput} </td>
        <td>{buttonComp}</td>
      </tr>
    );
  };

  const onClickStart = async () => {
    setLoading(true);
    const gameId = await startKOTH(id);
    goToGame(gameId);
  };

  const goToGame = (gameId:string) => {
    navigate('/kothgame?id=' + gameId + '&koth_id=' + id);
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

