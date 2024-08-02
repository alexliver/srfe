"use client";
import Loading from './component/loading';
import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useNavigate } from 'react-router-dom';
import {getSessionId} from './lib/utils';
import {newGame, joinKOTH} from './lib/data';
//import { useRouter } from 'next/navigation';

export default function Page() {
  const navigate = useNavigate();
  const [isLoading, setLoading] = useState(false);
  const onClickNewGame = async () => {
    setLoading(true);
    const id = getId();
    const sessionId = getSessionId();
    await newGame(id, sessionId);
    navigate('/gamesession?id=' + id);
  };

  const onClickNewKOTH = () => {
    setLoading(true);
    const id = getId();
    const sessionId = getSessionId();
    navigate('/kothsession?id=' + id);
  };

  return (
    <main >
      {isLoading?<Loading />:null}
      <div >
        <button onClick={onClickNewGame}>
          new game
        </button>
        <button onClick={onClickNewKOTH}>
          new king of the hill
        </button>
      </div>
    </main>
  );
}

function getId(): string {
  return uuidv4();
}

