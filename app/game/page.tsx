"use client";
import {getSessionId} from '@/app/lib/utils';
import {getGameStatus, move, getLastMove} from '@/app/lib/data';
import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation'

export default function Page() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [numShots, setNumShots] = useState(-1);
  const [numBullets, setNumBullets] = useState(-1);
  const [step, setStep] = useState(-1);
  const [turn, setTurn] = useState(-1);
  const [player, setPlayer] = useState(-1);
  const [winner, setWinner] = useState(-1);
  const [showItem, setShowItem] = useState(false);
  const [lastResultText, setLastResultText] = useState('');
  const [isLoading, setLoading] = useState(true);

  const initGame = async () => {
    const gameStatus = await getGameStatus(id, getSessionId());
    setNumShots(gameStatus.numShots);
    setNumBullets(gameStatus.numBullets);
    setStep(gameStatus.step);
    setTurn(gameStatus.turn);
    setPlayer(gameStatus.player);
    setLoading(false);
  };

  const scanNextMove = async () => {
    if (winner != -1) return;
    const nextMove = await getLastMove(id);
    if (nextMove) {
      if (nextMove.step > step) {
        updateResult (nextMove, nextMove.isSelf) ;
        if (!nextMove.isHit && nextMove.player != player) {
          if (nextMove.isSelf) 
            setLastResultText( "the opponent pulled trigger on himself, but it's blank");
          else
            setLastResultText( "the opponent pulled trigger on you, but it's blank");
        }
      }
    }
  };

  useEffect(() => {
    initGame();
  }, []);

  useEffect(() => {
    const key = setInterval(scanNextMove, 5000);
    return () => clearInterval(key);
  }, [winner, step, player]);

  const getItemComponent = () => {
    if (!showItem) return null;
    const onClickUse = (isSelf) => async () => {
      setLoading(true);
      setShowItem(false);
      setLastResultText('');
      const result = await move(id, isSelf);
      updateResult(result, isSelf);
      setLoading(false);
    };
    return (
      <div>
        <button onClick={onClickUse(true)}>myself</button>
        <button onClick={onClickUse(false)}>opponent</button>
      </div>
    )
  };

  const updateResult = (result, isSelf) => {
    if (result.isHit) {
      let winner;
      if (isSelf)
        winner = !turn;
      else
        winner = turn;
      setWinner(winner);
      return;
    }
    setTurn(result.turn);
    setStep(result.step);
  };

  const getWinnerComponent = () => {
    if (winner == player)
      return "you win";
    else
      return "you lose";
  };

  const onClickGun = () => {
    setShowItem(true);
  };

  const getTurnComponent = () => {
    if (turn == player) 
      return (<div> your turn </div>)
    return (<div> opponent's turn </div>)
  };

  const getBulletsComponent = () => {
    let result = [];
    for (let i = 0; i < numShots - step; i++) 
      result .push(<div className='bullet'></div>);
    return result
  };

  if (isLoading) 
    return ( <main > loading </main>);
  if (winner != -1)
    return (
      <main >
        {getWinnerComponent()}
      </main>
    )
  return (
    <main >
      <div >
        {getBulletsComponent()}
        <button onClick={onClickGun} disabled={turn != player}>gun</button>
        {lastResultText}
        {getTurnComponent()}
      </div>
      {getItemComponent()}
    </main>
  );
}


