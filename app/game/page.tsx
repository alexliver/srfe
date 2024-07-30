"use client";
import Link from 'next/link'
import { Tooltip } from 'react-tooltip'
import { Suspense } from 'react'
import {getSessionId, getQueryString, getModalStyle} from '@/app/lib/utils';
import {getGameStatus, move} from '@/app/lib/data';
import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation'
import Modal from 'react-modal';
import Loading from '@/app/ui/loading';
import DisappearingText from '@/app/ui/disappearing_text';

interface ParentProps {
  onGameFinish: any; // Type for children
}

export default function Page({onGameFinish}: ParentProps) {
  return (
    <Suspense>
      <Page1 onGameFinish={onGameFinish} />
    </Suspense>
  )
}

function Page1({onGameFinish}: ParentProps) {
  const id:string = getQueryString('id');
  const [numShots, setNumShots] = useState(-1);
  const [numBullets, setNumBullets] = useState(-1);
  const [playerOneLives, setPlayerOneLives] = useState(-1);
  const [playerTwoLives, setPlayerTwoLives] = useState(-1);
  const [playerOneItems, setPlayerOneItems] = useState([]);
  const [playerTwoItems, setPlayerTwoItems] = useState([]);
  const [maxLives, setMaxLives] = useState(-1);
  const [nextRound, setNextRound] = useState(-1);
  const [step, setStep] = useState(-1);
  const [turn, setTurn] = useState(-1);
  const [lastEjected, setLastEjected] = useState(-1);
  const [isSawedOff, setSawedOff] = useState(false);
  const [handcuffedPlayer, setHandcuffedPlayer] = useState(-1);
  const [wasHandcuffedPlayer, setWasHandcuffedPlayer] = useState(-1);
  const [player, setPlayer] = useState(-1);
  const [winner, setWinner] = useState(-1);
  const [showGunMenu, setShowGunMenu] = useState(false);
  const [showItem, setShowItem] = useState<any>(null);
  const [lastResultText, setLastResultText] = useState('');
  const [isLoading, setLoading] = useState(true);
  const [lastMoveAt, setLastMoveAt] = useState(new Date());
  const [timeLeft, setTimeLeft] = useState(90);
  const [ numLivesLastBreath, setNumLivesLastBreath] = useState(0);
  const [ animationKey, setAnimationKey] = useState(0);

  const initGame = async () => {
    const gameStatus = await getGameStatus(id, getSessionId());
    setNumShots(gameStatus.numShots);
    setNumBullets(gameStatus.numBullets);
    setStep(gameStatus.step);
    setTurn(gameStatus.turn);
    setPlayer(gameStatus.player);
    setPlayerOneLives(gameStatus.playerOneLives);
    setPlayerTwoLives(gameStatus.playerTwoLives);
    setMaxLives(gameStatus.maxLives);
    setPlayerOneItems(gameStatus.playerOneItems);
    setPlayerTwoItems(gameStatus.playerTwoItems);
    setNumLivesLastBreath(gameStatus.numLivesLastBreath);
    setNextRound(gameStatus.nextRound);
    setLastEjected(gameStatus.lastEjected);
    setSawedOff(gameStatus.isSawedOff);
    setHandcuffedPlayer(gameStatus.handcuffedPlayer);
    setWasHandcuffedPlayer(gameStatus.wasHandcuffedPlayer);
    setLastMoveAt(new Date(gameStatus.lastMoveAt*1000));
    setLoading(false);
    setAnimationKey(animationKey + 1);
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
  }, [winner, step, player, lastMoveAt, animationKey]);

  useEffect(() => {
    const key = setInterval(() => {
      let seconds = (new Date().getTime() - lastMoveAt.getTime()) / 1000;
      seconds = 90 - seconds;
      if (seconds < 0)
        seconds = 0;
      setTimeLeft(Math.round(seconds));
    }, 100);
    return () => clearInterval(key);
  }, [lastMoveAt]);

  const getGunMenuComponent = () => {
    if (!showGunMenu) return null;
    const onClickUse = (isSelf:boolean) => async () => {
      setLoading(true);
      setShowGunMenu(false);
      setShowItem(null);
      setLastResultText('');
      const result = await move(id, getSessionId(), isSelf, -1);
      updateResult(result);
      setLoading(false);
    };
    return (
      <Modal isOpen={true}
          style={getModalStyle()}
          onRequestClose={() => setShowGunMenu(false)}
          contentLabel="Use gun">
        <span>
          <button onClick={onClickUse(true)} disabled={turn != player}>myself</button>
          <button onClick={onClickUse(false)} disabled={turn != player}>opponent</button>
          <button onClick={() => setShowGunMenu(false)} >cancel</button>
        </span>
      </Modal>
    )
  };

  const updateResult = (result:any) => {
    const newLastMoveAt = new Date(result.lastMoveAt*1000);
    if (newLastMoveAt.getTime() !== lastMoveAt.getTime()) {
      console.log(newLastMoveAt);
      console.log(lastMoveAt);
      setAnimationKey(animationKey + 1);
    }
    setPlayerOneLives(result.playerOneLives);
    setPlayerTwoLives(result.playerTwoLives);
    setTurn(result.turn);
    setStep(result.step);
    setNumBullets(result.numBullets);
    setNumShots(result.numShots);
    setPlayerOneItems(result.playerOneItems);
    setPlayerTwoItems(result.playerTwoItems);
    setLastEjected(result.lastEjected);
    setNextRound(result.nextRound);
    setSawedOff(result.isSawedOff);
    setHandcuffedPlayer(result.handcuffedPlayer);
    setWasHandcuffedPlayer(result.wasHandcuffedPlayer);
    setLastMoveAt(newLastMoveAt);
    setLastResultText(getLastResultText(result, player));
    if (result.playerOneLives == 0 || result.playerTwoLives == 0) {
      if (winner == -1)
        if (onGameFinish)
          onGameFinish();
      let newwinner;
      if (result.playerOneLives == 0)
        newwinner = 1;
      else
        newwinner = 0;
      setWinner(newwinner);
      return;
    }
  };

  const getWinnerComponent = () => {
    let text;
    if (winner == player)
      text = "You win";
    else
      text = "You lose";
    return (
      <div className='shakespeare'>
        <p>{text}</p>
        <Link className='fancy-link' href="/">Home</Link>
      </div>
    );
  };

  const onClickGun = () => {
    setShowGunMenu(true);
    setShowItem(null);
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

  const getOpponentComponent = () => getPlayerComponent(player ^ 1);
  const getYourComponent = () => getPlayerComponent(player);

  const getItemsComponent = (compPlayer:number) => {
    let items;
    if (compPlayer == 0)
      items = playerOneItems;
    else
      items = playerTwoItems;
    const buttons =  items.map((item:any) => {
      const onClickItem = () => {
        setShowItem(item);
        setShowGunMenu(false);
      };
      let disableHandcuff = false;
      if (item.itemCode == 'handcuff' && (handcuffedPlayer != -1 || wasHandcuffedPlayer != -1))
        disableHandcuff = true;
      let disableSaw = false;
      if (item.itemCode == 'saw' && isSawedOff)
        disableSaw = true;
      let disableMagnifyingGlass = false;
      if (item.itemCode == 'magnifying_glass' && nextRound != -1)
        disableMagnifyingGlass = true;
      return (
        <button data-tooltip-content={getItemTooltip(item.itemCode) }
          data-tooltip-place="top"
          data-tooltip-id="my-tooltip"
          disabled={compPlayer != player || turn != player 
          || disableHandcuff || disableSaw || disableMagnifyingGlass} onClick={onClickItem}>
          {getItemText(item.itemCode)}
        </button>
      )
    });
    return (
      <div>
        {buttons}
        <Tooltip id="my-tooltip" />
      </div>
    )
  };

  const getPlayerComponent = (compPlayer:number)  => {
    let titleText;
    if (compPlayer == player)
      titleText = 'You';
    else
      titleText = 'Opponent';
    if (handcuffedPlayer == compPlayer || wasHandcuffedPlayer == compPlayer)
      titleText += ' (handcuffed)';
    let numLives;
    if (compPlayer == 0)
      numLives = playerOneLives;
    else
      numLives = playerTwoLives;
    let livesComp ;
    if (numLives <= numLivesLastBreath)
      livesComp = 'last breath';
    else
      livesComp = getLivesComp(numLives);
    return (
      <div className='casino'>
        {titleText}:
        {livesComp}
        <div>
          {getItemsComponent(compPlayer)}
        </div>
      </div>
    )
  };

  const getLivesComp = (numLives:number) => {
    const result = [];
    for (let i = 0; i < maxLives - numLives; i++)
      result.push((<div className='heart_white'></div>));
    for (let i = 0; i < numLives - numLivesLastBreath; i++)
      result.push((<div className='heart_pink'></div>));
    for (let i = 0; i < numLivesLastBreath; i++)
      result.push((<div className='heart'></div>));
     return result;
  };
  
  const getItemMenuComponent = ()=> {
    if (!showItem)
      return null;
    const onClickUseItem = async () => {
      setLoading(true);
      setShowGunMenu(false);
      setLastResultText('');
      const result = await move(id, getSessionId(), false, showItem.id);
      setShowItem(null);
      updateResult(result);
      setLoading(false);
    };
    const onClickNo = () => {
      setShowItem(null);
    };
    return (
      <Modal isOpen={true}
          style={getModalStyle()}
          onRequestClose={onClickNo}
          contentLabel="Use {showItem.itemCode}">
        <div>
          <div>
            confirm to use {showItem.itemCode}?
          </div>
          <div>
            <button onClick={onClickUseItem} disabled={player!=turn}>
              yes
            </button>
            <button onClick={onClickNo}>
              no
            </button>
          </div>
        </div>
      </Modal>
    );
  };

  const getNextRoundComponent = () => {
    let result = '';
    if (nextRound != -1) {
      let text;
      if (nextRound)
        text = 'live';
      else
        text = 'blank';
      result += ' (' + text + ')'
    }
    if (isSawedOff)
      result += ' (sawed off)'
    return result
  };

  if (winner != -1)
    return (
      <main >
        {getWinnerComponent()}
      </main>
    )
  return (
    <main >
      {isLoading?<Loading />:null}
      {getYourComponent()}
      <div className="wild-west">
        {getBulletsComponent()}
        <button 
          onClick={onClickGun} disabled={turn != player}>🔫 {getNextRoundComponent()}</button>
        {getGunMenuComponent()}
      </div>
      <div className='hacker-console'>
        <div className='colorchange' key={animationKey}>
          <div>{lastResultText}</div>
          {getTurnComponent()}
        </div>
        <p>time left: {timeLeft}</p>
        <p class="blink">_</p>
      </div>
      {getOpponentComponent()}
      <Tooltip id="my-tooltip2" />
      {getItemMenuComponent()}
    </main>
  );
}


function getLastResultText(result:any, player:number) {
  if (result.lastPlayer == -1)
    return '';
  if (result.lastItem)
    return getLastResultItemText(result, player);
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
        return "Well it's a blank";
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

function getLastResultItemText(result:any, player:number) {
  if (result.lastItem.itemCode == 'cigarette')
    return getLastResultItemTextCigarette(result, player);
  if (result.lastItem.itemCode == 'drink')
    return getLastResultItemTextDrink(result, player);
  if (result.lastItem.itemCode == 'magnifying_glass')
    return getLastResultItemTextMagnifyingGlass(result, player);
  if (result.lastItem.itemCode == 'saw')
    return getLastResultItemTextSaw(result, player);
  if (result.lastItem.itemCode == 'handcuff')
    return getLastResultItemTextHandcuff(result, player);
  return '';
}

function getLastResultItemTextCigarette(result:any, player:number) {
  if (player == result.lastPlayer) {
    return "you used cigarette";
  }
  return "the opponent used cigarette";
}

function getLastResultItemTextDrink(result:any, player:number) {
  let bulletText;
  if (result.lastEjected == 1)
    bulletText = 'live round';
  else
    bulletText = 'blank';
  if (player == result.lastPlayer) {
    return "You ejected a round. It's a " + bulletText;
  }
  return "the opponent ejected a round. It's a " + bulletText;
}

function getLastResultItemTextMagnifyingGlass(result:any, player:number) {
  if (player == result.lastPlayer) {
    return "you took a peek of the next round";
  }
  return "the opponent took a peek of the next round. Be careful...";
}

function getLastResultItemTextSaw(result:any, player:number) {
  if (player == result.lastPlayer) {
    return "you sawed off the barrel";
  }
  return "the opponent sawed off the barrel";
}

function getLastResultItemTextHandcuff(result:any, player:number) {
  if (player == result.lastPlayer) {
    return "you handcuffed the opponent";
  }
  return "the opponent handcuffed you. Be careful...";
}

function getItemText(itemCode:string){
  const mapping:any = {
    "cigarette": "🚬", 
    "drink": "🥤",
    "magnifying_glass": "🔍", 
    "saw": "🪚", 
    "handcuff": "🛑",
  }
  return mapping[itemCode];
}

function getItemTooltip(itemCode:string) {
  const mapping:any = {
    "cigarette": "Cigarette: heals 1 life", 
    "drink": "Drink: eject the next round",
    "magnifying_glass": "Magnifier: take a peek of the next round", 
    "saw": "Saw: double the damage of the next round", 
    "handcuff": "Handcuff: opponent skips next round",
  }
  return mapping[itemCode];
}
