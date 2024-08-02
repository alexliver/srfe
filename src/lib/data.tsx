//import { sql } from '@vercel/postgres';
import axios, { AxiosError } from 'axios';

export async function newGame(id:string, sessionId:string) {
  const response = await axios.post(getUrl('/new_game'), { id, sessionId }, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json',
    },
  }); 
  return response.data;
}

export async function joinKOTH(id:string, sessionId:string) {
  const response = await axios.post(getUrl('/join_koth'), { id, sessionId }, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json',
    },
  }); 
  return response.data;
}

export async function getKOTHStatus(id:string, sessionId:string) {
  const response = await axios.post(getUrl('/get_koth_status'), { id, sessionId }, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json',
    },
  }); 
  return response.data;
}

export async function toggleKOTHReady(id:string, sessionId:string, name:string) {
  const response = await axios.post(getUrl('/toggle_koth_ready'), { id, sessionId , name}, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json',
    },
  }); 
  return response.data;
}

export async function changeName(sessionId:string, name:string) {
  const response = await axios.post(getUrl('/change_name'), { sessionId , name}, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json',
    },
  }); 
  return response.data;
}

export async function startKOTH(id:string) {
  const response = await axios.post(getUrl('/start_koth'), { 
      id, numShots: -1, numBullets: -1, numLives : 8, 
      numLivesLastBreath : 0,
      numMaxItems: 8, 
      numItemsPerRound: 4,
      isCompetitive: true,
  }, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json',
    },
  }); 
  return response.data;
}

export async function toggleReady(id:string, sessionId:string, isReady:boolean) {
  const response = await axios.post(getUrl('/toggle_ready'), { id, sessionId, isReady }, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json',
    },
  }); 
  return response.data;
}

export async function getGameSessionStatus(id:string, sessionId:string) {
  const response = await axios.post(getUrl('/get_game_session_status'), { id, sessionId}, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json',
    },
  }); 
  return response.data;
}

export async function startGame(id:string, sessionId:string) {
  await axios.post(getUrl('/start_game'), { 
      id, numShots: -1, numBullets: -1, numLives : 8, 
      numLivesLastBreath : 0,
      numMaxItems: 8, 
      numItemsPerRound: 4,
      isCompetitive: true,
    }, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json',
    },
  }); 
}

export async function getGameStatus(id:string, sessionId:string) {
  const response = await axios.post(getUrl('/get_game_status'), { id, sessionId}, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json',
    },
  }); 
  return response.data;
}

export async function move(id:string, sessionId:string, isSelf:boolean, itemID:number) {
  const response = await axios.post(getUrl('/move'), { gameId:id, sessionId, isSelf, itemID}, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json',
    },
  }); 
  return response.data;
}

export async function getLastMove(id:string) {
  try {
    const response = await axios.post(getUrl('/get_last_move'), { id}, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
    }); 
    return response.data;
  } catch(error:any) {
    if (error.response && error.response.status === 404) return null;
    throw error;
  }
}

function getUrl(url: string): string {
  //return process.env.NEXT_PUBLIC_SR_URL + url;
  return process.env.REACT_APP_SR_URL + url;
  //return 'http://18.217.93.143:8080' + url;
  //return 'http://localhost:8080' + url;
}

