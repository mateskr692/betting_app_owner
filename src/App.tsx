import React, { useEffect } from 'react';
import { useClient } from './Client';
import * as buffer from "buffer";
window.Buffer = buffer.Buffer;

const SYNC_IN_BACKGROUND = true;

function isEmptyOrSpaces(str: string){
  return !str?.trim?.()
}

function App() {
  let client = useClient();
  let GameId : number;
  let GameState : string;
  let GameResult : string;

  function updateId(event: any) {
    GameId = parseInt(event.target.value);
  }
  function updateState(event: any) {
    GameState = event.target.value;
  }
  function updateResult(event: any) {
    let val = event.target.value;
    if (isEmptyOrSpaces(val)) {
      val = "None";
    }
    GameResult = val;
  }

  useEffect(() => {
    let interval: any;
    if(SYNC_IN_BACKGROUND) {
      interval = setInterval(() => {
        client.SyncData();
      }, 1000 * 60);
      return () => clearInterval(interval);
    }
  }, );

  return (
    <>
      <button onClick={client.initialize}>Initialize</button>
      <button onClick={client.reserveSpace}>Reserve</button>
      <button onClick={client.airdrop}>Airdrop</button>
      <br/>
      <br/>

      <label htmlFor="gameId">Game Id:  </label>
      <input id="gameId" type="number" onChange={updateId}/>
      <br/>
      <label htmlFor="state">Game State:  </label>
      <input id="state" onChange={updateState}/>
      <br/>
      <label htmlFor="result">Game Result:  </label>
      <input id="result" onChange={updateResult}/>
      <br/>
      <br/>
      <button onClick={() => client.addScheduledGame(GameId)}>Add Game</button>
      <br/>
      <button onClick={() => client.deleteGame(GameId)}>Delete Game</button>
      <br/>
      <button onClick={() => client.setGameState(GameId, GameState, GameResult)}>Set Game State</button>
      <br/>
      <button onClick={() => client.collectTaxes()}>Collect Taxes</button>
      <br/>
      <br/>

      <button onClick={async () => console.log(await client.getState())}>Get Program State</button>
      <br/>
      <button onClick={client.getProgramBalance}>Get Program Balance</button>
      <br/>
      <button onClick={client.getOwnerBalance}>Get Owner Balance</button>
      {/* <br/>
      <br/>
      <button onClick={FetchData}>Fetch data</button> */}
    </>
  );
}

export default App;
