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
  const [playerOneItems, setPlayerOneItems] = useState([]);
  const [playerTwoItems, setPlayerTwoItems] = useState([]);
  const [nextRound, setNextRound] = useState(-1);
  const [step, setStep] = useState(-1);
  const [turn, setTurn] = useState(-1);
  const [lastEjected, setLastEjected] = useState(-1);
  const [isSawedOff, setSawedOff] = useState(false);
  const [player, setPlayer] = useState(-1);
  const [winner, setWinner] = useState(-1);
  const [showGunMenu, setShowGunMenu] = useState(false);
  const [showItem, setShowItem] = useState(null);
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
    setPlayerOneItems(gameStatus.playerOneItems);
    setPlayerTwoItems(gameStatus.playerTwoItems);
    setNumLivesLastBreath(gameStatus.numLivesLastBreath);
    setNextRound(gameStatus.nextRound);
    setLastEjected(gameStatus.lastEjected);
    setSawedOff(gameStatus.isSawedOff);
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

  const getGunMenuComponent = () => {
    if (!showGunMenu) return null;
    const onClickUse = (isSelf) => async () => {
      setLoading(true);
      setShowGunMenu(false);
      setShowItem(null);
      setLastResultText('');
      const result = await move(id, getSessionId(), isSelf, -1);
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
    setPlayerOneItems(result.playerOneItems);
    setPlayerTwoItems(result.playerTwoItems);
    setLastEjected(result.lastEjected);
    setNextRound(result.nextRound);
    setSawedOff(result.isSawedOff);
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

  const getOpponentComponent = () => getPlayerComponent(!player);
  const getYourComponent = () => getPlayerComponent(player);

  const getItemsComponent = (compPlayer) => {
    let items;
    if (compPlayer == 0)
      items = playerOneItems;
    else
      items = playerTwoItems;
    return items.map(item => {
      const onClickItem = () => {
        setShowItem(item);
        setShowGunMenu(false);
      };
      return (
        <button disabled={compPlayer != player || turn != player} onClick={onClickItem}>
          {item.itemCode}
        </button>
      )
    })
  };

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
    let livesComp ;
    if (numLives <= numLivesLastBreath)
      livesComp = 'last breath';
    else
      livesComp = getLivesComp(numLives);
    return (
      <div>
        {titleText}
        <div>
          lives: {livesComp}
        </div>
        <div>
          {getItemsComponent(compPlayer)}
        </div>
      </div>
    )
  };

  const getLivesComp = (numLives) => {
    const result = [];
    for (let i = 0; i < numLives - numLivesLastBreath; i++)
      result.push((<div className='heart_white'></div>));
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
      updateResult(result, false);
      setLoading(false);
    };
    const onClickNo = () => {
      setShowItem(null);
    };
    return (
      <div>
        confirm to use {showItem.itemCode}?
        <button onClick={onClickUseItem}>
          yes
        </button>
        <button onClick={onClickNo}>
          no
        </button>
      </div>
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
        <button onClick={onClickGun} disabled={turn != player}>gun {getNextRoundComponent()}</button>
        {lastResultText}
        {getTurnComponent()}
        {getYourComponent()}
      </div>
      {getGunMenuComponent()}
      {getItemMenuComponent()}
    </main>
  );
}


function getLastResultText(result, player) {
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

function getLastResultItemText(result, player) {
  if (result.lastItem.itemCode == 'cigarette')
    return getLastResultItemTextCigarette(result, player);
  if (result.lastItem.itemCode == 'drink')
    return getLastResultItemTextDrink(result, player);
  if (result.lastItem.itemCode == 'magnifying_glass')
    return getLastResultItemTextMagnifyingGlass(result, player);
  if (result.lastItem.itemCode == 'saw')
    return getLastResultItemTextSaw(result, player);
  return '';
}

function getLastResultItemTextCigarette(result, player) {
  if (player == result.lastPlayer) {
    return "you used cigarette";
  }
  return "the opponent used cigarette";
}

function getLastResultItemTextDrink(result, player) {
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

function getLastResultItemTextMagnifyingGlass(result, player) {
  if (player == result.lastPlayer) {
    return "you took a peek of the next round";
  }
  return "the opponent took a peek of the next round. Be careful...";
}

function getLastResultItemTextSaw(result, player) {
  if (player == result.lastPlayer) {
    return "you sawed off the barrel";
  }
  return "the opponent sawed off the barrel";
}

