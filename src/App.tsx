import { useClient } from './Client';
import * as buffer from "buffer";
window.Buffer = buffer.Buffer;

function isEmptyOrSpaces(str: string){
  return str === null || str.match(/^ *$/) !== null;
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
    GameResult = event.target.value;
    if (isEmptyOrSpaces(GameResult)) {
      GameResult = "None";
    }
  }

  function AddGame() {
    client.addScheduledGame(GameId);
  }
  function DeleteGame() {
    client.deleteGame(GameId);
  }
  function SetGameState() {
    client.setGameState(GameId, GameState, GameResult);
  }

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
      <button onClick={AddGame}>Add Game</button>
      <br/>
      <button onClick={DeleteGame}>Delete Game</button>
      <br/>
      <button onClick={SetGameState}>Set Game State</button>

      <br/>
      <br/>
      <button onClick={client.getState}>Get State</button>

    </>
  );
}

export default App;