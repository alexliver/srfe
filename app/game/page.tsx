"use client";
import {getSessionId} from '@/app/lib/utils';
import {getGameStatus, move} from '@/app/lib/data';
import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation'

export default function Page() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [numShots, setNumShots] = useState(-1);
  const [numBullets, setNumBullets] = useState(-1);
  const [playerOneLives, setPlayerOneLives] = useState(-1);
  const [playerTwoLives, setPlayerTwoLives] = useState(-1);
  const [step, setStep] = useState(-1);
  const [turn, setTurn] = useState(-1);
  const [player, setPlayer] = useState(-1);
  const [winner, setWinner] = useState(-1);
  const [showItem, setShowItem] = useState(false);
  const [lastResultText, setLastResultText] = useState('');
  const [isLoading, setLoading] = useState(true);
  const [ numLivesLastBreath, setNumLivesLastBreath] = useState(0);

  const initGame = async () => {
    const gameStatus = await getGameStatus(id, getSessionId());
    setNumShots(gameStatus.numShots);
    setNumBullets(gameStatus.numBullets);
    setStep(gameStatus.step);
    setTurn(gameStatus.turn);
    setPlayer(gameStatus.player);
    setPlayerOneLives(gameStatus.playerOneLives);
    setPlayerTwoLives(gameStatus.playerTwoLives);
    setNumLivesLastBreath(gameStatus.numLivesLastBreath);
    setLoading(false);
  };

  const scanNextMove = async () => {
    if (winner != -1) return;
    const nextMove = await getGameStatus(id, getSessionId());
    updateResult (nextMove);
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
      const result = await move(id, getSessionId(), isSelf);
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

  const updateResult = (result) => {
    setPlayerOneLives(result.playerOneLives);
    setPlayerTwoLives(result.playerTwoLives);
    setTurn(result.turn);
    setStep(result.step);
    setNumBullets(result.numBullets);
    setLastResultText(getLastResultText(result, player));
    if (result.playerOneLives == 0 || result.playerTwoLives == 0) {
      let winner;
      if (result.playerOneLives == 0)
        winner = 1;
      else
        winner = 0;
      setWinner(winner);
      return;
    }
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
    return (
      <div>
        {result}
        <div>
          live bullets left: {numBullets}
        </div>
      </div>
    )
  };

  const getOpponentComponent = () => getPlayerComponent(!player);
  const getYourComponent = () => getPlayerComponent(player);

  const getPlayerComponent = (compPlayer)  => {
    let titleText;
    if (compPlayer == player)
      titleText = 'You';
    else
      titleText = 'Opponent';
    let numLives;
    if (compPlayer == 0)
      numLives = playerOneLives;
    else
      numLives = playerTwoLives;
    if (numLives <= numLivesLastBreath)
      numLives = 'last breath';
    return (
      <div>
        {titleText}
        <div>
          lives: {numLives}
        </div>
      </div>
    )
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
        {getOpponentComponent()}
        {getBulletsComponent()}
        <button onClick={onClickGun} disabled={turn != player}>gun</button>
        {lastResultText}
        {getTurnComponent()}
        {getYourComponent()}
      </div>
      {getItemComponent()}
    </main>
  );
}


function getLastResultText(result, player) {
  if (result.lastPlayer == -1)
    return '';
  if (player == result.lastPlayer) {
    if (result.isHit) {
      if (result.isSelf) {
        return 'You just shot yourself. How could that happen?';
      } else {
        return 'You successfully shot your opponent!';
      }
    } else {
      if (result.isSelf) {
        return "It's a blank, as expected";
      } else {
        return "Well it's a blank. You'll lose this turn";
      }
    }
  } else {
    if (result.isHit) {
      if (result.isSelf) {
        return 'The opponent just shot himself/herself';
      } else {
        return "You got shot by the opponent!";
      }
    } else {
      if (result.isSelf) {
        return "The opponent tried to shoot himself/herself, but it's a blank";
      } else {
        return "The opponent tried to shoot you, but it's a blank";
      }
    }
  }
}
