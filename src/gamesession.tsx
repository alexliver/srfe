"use client";
import { useNavigate } from 'react-router-dom';
import { useSearchParams } from 'react-router-dom';
import Loading from './component/loading';
import {getSessionId} from './lib/utils';
import {toggleReady, getGameSessionStatus, newGame, startGame, changeName} from './lib/data';
//import { useRouter } from 'next/navigation';
import { Suspense } from 'react'
import React, { useState, useEffect } from 'react';
//import { usePathname, useSearchParams } from 'next/navigation'

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
  const [player, setPlayer] = useState(-1);
  const [isPlayerOneReady, setPlayerOneReady] = useState(false);
  const [isPlayerTwoReady, setPlayerTwoReady] = useState(false);
  const [playerOneName, setPlayerOneName] = useState('');
  const [playerTwoName, setPlayerTwoName] = useState('');
  const [name, setName] = useState('');
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
    return (<span>{text}</span>);
  };

  const getReadyComponent = (isMe:boolean, isReady:boolean, setReady:any) => {
    if (isMe)
      return getReadyComponentMe(isReady, setReady);
    return getReadyComponentOpponent(isReady);
  };

  const onClickStartGame = async () => {
    setLoading(true);
    await startGame(id, getSessionId());
    navigate('/game?id=' + id);
  };

  const fetchSession = async () => {
    const session = await getGameSessionStatus(id, getSessionId());
    if (session.isStarted) {
      navigate('/game?id=' + id);
    }
    setPlayerOneReady(session.isPlayerOneReady);
    setPlayerTwoReady(session.isPlayerTwoReady);
    setPlayer(session.player);
    setPlayerOneName(session.playerOneName);
    setPlayerTwoName(session.playerTwoName);
    return session;
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await newGame(id, getSessionId());
      const session = await fetchSession();
      if (session.player == 0)
        setName(session.playerOneName);
      else
        setName(session.playerTwoName);
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

  const getNameComponent = (isMe:boolean, playerName:string, setPlayerName:any) => {
    if (!isMe)
      return (<div>{playerName}</div>);
    const onChangeName = (event:any) => setName(event.target.value);
    const onClickChangeName = async () => {
      setLoading(true);
      await changeName(getSessionId(), name);
      setLoading(false);
      if (player == 0)
        setPlayerOneName(name);
      else
        setPlayerTwoName(name);
    };
    const isNameDirty = playerName != name;
    return (
      <div>
        <input type="text" onChange={onChangeName} value={name} />
        <button onClick = {onClickChangeName} disabled={!isNameDirty}>change name</button>
      </div>  
    )
  };

  const playerOneNameComponent = getNameComponent(player == 0, playerOneName, 
    setPlayerOneName);
  const playerTwoNameComponent = getNameComponent(player == 1, playerTwoName, 
    setPlayerTwoName);

  return (
    <main >
      {isLoading?<Loading />:null}
      <div className='shakespeare'>
        <table>
          <tbody>
            <tr >
              <td> player one </td>
              <td> {playerOneNameComponent} </td>
              <td> {playerOneReadyComponent} </td>
            </tr>
            <tr >
              <td>player two </td>
              <td>{playerTwoNameComponent}</td>
              <td>{playerTwoReadyComponent}</td>
            </tr>
          </tbody>
        </table>
        <button onClick={onClickStartGame} disabled={!(isPlayerOneReady && isPlayerTwoReady) 
        || player == 1}>
          start game
        </button>
      </div>
    </main>
  );
}


