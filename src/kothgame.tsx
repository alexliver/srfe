"use client";
import { useNavigate } from 'react-router-dom';
import { useSearchParams } from 'react-router-dom';
import { Tooltip } from 'react-tooltip'
import { Suspense } from 'react'
import {getSessionId, getModalStyle} from './lib/utils';
import {getKOTHStatus} from './lib/data';
import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import Loading from './component/loading';
import GamePage from './component/game';

export default function Page() {
  return (
    <Suspense>
      <Page1 />
    </Suspense>
  )
}

function Page1() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const kothID = searchParams.get('koth_id') || '';
  const [rank, setRank] = useState(0);
  const [queue, setQueue] = useState<string[]>([]);
  const onGameFinish = () => {
    navigate('/kothsession?id=' + kothID);
  };

  const initKOTHSession = async () => {
    const kothStatus = await getKOTHStatus(kothID, getSessionId());
    setRank(kothStatus.rank);
    setQueue(kothStatus.queue);
  };

  useEffect(() => {
    initKOTHSession();
  }, []);

  const getKothComponent = () => {
    const vsComponent = getVSComponent();
    const waitingComponent = getWaitingComponent();
    return [vsComponent, waitingComponent];
  };

  const getVSComponent = () => {
    const text = queue[0] + ' vs ' + queue[1];
    return (
      <div> {text} </div>
    )
  };

  const getWaitingComponent = () => {
    if (queue.length <= 2)
      return null;
    const waitingList = queue
    .filter((name, i) => i >= 2)
    .map((name, i) => {
      if (i + 2 == rank)
        return name + ' (me)';
      return name ;
    })
    .map(text => (<span>{text}</span>));
    return (
      <div>
        waiting: {waitingList}
      </div>
    );
  }

  return (
    <div className="kothcontainer">
      <GamePage onGameFinish={onGameFinish} />
      <div className="kothinfo">
        {getKothComponent()}
      </div>
    </div>
  )
}


