"use client";
import Link from 'next/link'
import { Tooltip } from 'react-tooltip'
import { Suspense } from 'react'
import {getSessionId, getQueryString, getModalStyle} from '@/app/lib/utils';
import {getKOTHStatus} from '@/app/lib/data';
import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation'
import Modal from 'react-modal';
import Loading from '@/app/ui/loading';
import DisappearingText from '@/app/ui/disappearing_text';
import GamePage from '@/app/game/page';

export default function Page() {
  const router = useRouter();
  const kothID = getQueryString("koth_id");
  const [rank, setRank] = useState(0);
  const [queue, setQueue] = useState<string[]>([]);
  const onGameFinish = () => {
    router.push('/kothsession?id=' + kothID);
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
    <div>
      <GamePage onGameFinish={onGameFinish} />
      {getKothComponent()}
    </div>
  )
}

