//import * as anchor from "@project-serum/anchor";
import { Program, AnchorProvider, web3, utils, Wallet } from "@project-serum/anchor";
import { BettingApp, IDL } from "./betting_app";
import { PublicKey } from "@solana/web3.js";

class MyWallet implements Wallet {
  constructor(readonly payer: web3.Keypair) {
      this.payer = payer
  }
  async signTransaction(tx: web3.Transaction): Promise<web3.Transaction> {
      tx.partialSign(this.payer);
      return tx;
  }
  async signAllTransactions(txs: web3.Transaction[]): Promise<web3.Transaction[]> {
      return txs.map((t) => {
          t.partialSign(this.payer);
          return t;
      });
  }
  get publicKey(): PublicKey {
      return this.payer.publicKey;
  }
}

export const useClient = () =>  {

  const owner = web3.Keypair.fromSecretKey(new Uint8Array([124,160,215,34,232,120,109,233,130,20,177,19,171,155,73,185,5,178,42,216,250,26,31,5,98,50,229,73,153,82,205,179,47,69,130,142,236,81,193,169,164,117,10,50,172,251,12,234,60,113,134,185,64,227,17,135,211,223,76,176,109,66,245,55]));
  const contract = web3.Keypair.fromSecretKey(new Uint8Array([45,76,138,74,253,72,12,115,129,212,212,40,78,40,230,32,195,160,21,186,197,175,192,95,240,57,5,162,221,25,101,193,219,181,92,128,246,1,95,116,82,226,157,143,56,18,196,132,7,37,69,157,11,102,50,57,248,72,75,197,25,112,10,120]));
  const program = getProgram()
  
  const stateMap = new Map([
    ["SCHEDULED", "Scheduled"],
    ["POSTPONED", "Scheduled"],
    ["LIVE", "Live"],
    ["IN_PLAY", "Live"],
    ["PAUSED", "Live"],
    ["FINISHED", "Finished"],
    ["SUSPENDED", "Canceled"],
    ["CANCELLED", "Canceled"],
  ]);
  const resultMap = new Map([
    ["HOME_TEAM","HomeVictory"],
    ["AWAY_TEAM","AwayVictory"],
    ["DRAW","Tie"],
    ["None","None"],
  ]);
  const programStateMap = new Map([
    ["{\"scheduled\":{}}", "Scheduled"],
    ["{\"live\":{}}", "Live"],
    ["{\"finished\":{}}", "Finished"],
    ["{\"cancelled\":{}}", "Canceled"],
  ])
  const timeBeforeDelete = 1000 * 60 * 60 * 24;

  function getProgram() {
    const network = "https://api.devnet.solana.com";
    const connection = new web3.Connection(network, "processed");
    const provider = new AnchorProvider(connection, new MyWallet(owner), {
      preflightCommitment: "processed",
    });
    const program: Program<BettingApp> = new Program(
      IDL,
      "Cs6SipyJ7i4Qgw1QaaR2Jmtrbx9c4A7sHa4Kgx9edLHC",
      provider
    );
    return program;
  }

  async function getState() {
    const state = await program.account.programContract.fetch(contract.publicKey);
    return state;
  }

  async function initialize() {
    const [programPDA,] = PublicKey.findProgramAddressSync(
      [
        utils.bytes.utf8.encode("program-wallet"),
        contract.publicKey.toBuffer(),
      ],
      program.programId
    );
  
    await program.methods
      .initialize()
      .accounts({
        owner: owner.publicKey,
        contract: contract.publicKey,
        programWallet: programPDA,
      })
      .signers([contract])
      .rpc();
  }
  
  async function reserveSpace() {
    await program.methods
      .reserveSpace()
      .accounts({
        owner: owner.publicKey,
        contract: contract.publicKey,
      })
      .signers([owner])
      .rpc();
    const state = await getState();
    const maxGames = state.maxGames;
    console.log("Max Games: %d", maxGames);
  }
  
  async function collectTaxes() {
    const [programPDA,] = PublicKey.findProgramAddressSync(
      [
        utils.bytes.utf8.encode("program-wallet"),
        contract.publicKey.toBuffer(),
      ],
      program.programId
    );
  
    await program.methods
      .collectTaxes()
      .accounts({
        owner: owner.publicKey,
        contract: contract.publicKey,
        programWallet: programPDA,
      })
      .signers([owner])
      .rpc();
    console.log("Taxes Collected");
  }
  
  async function addScheduledGame(gameId: any) {
    await program.methods
      .addScheduledGame(gameId)
      .accounts({
        owner: owner.publicKey,
        contract: contract.publicKey,
      })
      .signers([owner])
      .rpc();
    console.log("Added game with Id: %d", gameId);
  }
  
  async function setGameState(gameId: any, state: string, result: string) {
    await program.methods
      .setGameState(gameId, state, result)
      .accounts({
        owner: owner.publicKey,
        contract: contract.publicKey,
      })
      .signers([owner])
      .rpc();
    console.log("Set game state to: %s", state);
  }
  
  async function deleteGame(gameId: any) {
    await program.methods
      .deleteGame(gameId)
      .accounts({
        owner: owner.publicKey,
        contract: contract.publicKey,
      })
      .signers([owner])
      .rpc();
      console.log("Deleted game with Id: %d", gameId);
  }
  
  async function airdrop() {
    const airdropSignature = await program.provider.connection.requestAirdrop(owner.publicKey, web3.LAMPORTS_PER_SOL * 2);
    await program.provider.connection.confirmTransaction(airdropSignature);
    console.log("Recieved an airdrop of 2 SOL");
  }

  async function getOwnerBalance() {
    const balance = await program.provider.connection.getBalance(owner.publicKey);
    console.log("Owner Balance: %s", balance);
  }

  async function getProgramBalance() {
    const [programPDA, ] = PublicKey.findProgramAddressSync(
      [
        utils.bytes.utf8.encode("program-wallet"),
        contract.publicKey.toBuffer(),
      ],
      program.programId
    );
    const balance = await program.provider.connection.getBalance(programPDA);
    console.log("Program Balance: %s", balance);
  }

  async function FetchScheduledGames() {
    const data = await fetch('/v4/competitions/PL/matches?status=SCHEDULED', { 
      headers: {
        "X-Auth-Token": "3c3eb8dadad249f5a9f03302569745a6"
      }
    })
    return data;
  }
  async function FetchGamesWithIds(ids: number[]) {
    const data = await fetch(`/v4/matches?ids=${encodeURIComponent(ids.join(","))}`, { 
      headers: {
        "X-Auth-Token": "3c3eb8dadad249f5a9f03302569745a6"
      },
    })
    return data;
  }

  async function SyncData() {
    //get scheduled games
    let footballData = await FetchScheduledGames().then(d => d.json());
    const upcomingGames = footballData.matches.sort((a: string, b: string) => {
      return (new Date(a)).getTime() - (new Date(b)).getTime();
    }).slice(0, 10);
    const programState = await getState();
    
    //add new scheduled games
    const gamesToAdd = upcomingGames.filter((g: { id: number; }) => {
      return !programState.activeGames.map(x => x.id).includes(g.id);
    }).map((x: { id: any; }) => x.id); 
    gamesToAdd.forEach(async (id: any) => {
      await addScheduledGame(id);
    });

    //get games that did not appear on scheduled (are live or finished)
    const gamesToUpdate = programState.activeGames.filter((g) => {
      return !upcomingGames.map((x: { id: any; }) => x.id).includes(g.id);
    }).map(x => x.id);
    footballData = await FetchGamesWithIds(gamesToUpdate).then(d => d.json());
    const programGames = programState.activeGames.filter(g => gamesToUpdate.includes(g.id));
    const activeGames = footballData.matches.map((g: any) => {
      return {
        id: g.id,
        state: stateMap.get(g.status),
        result: resultMap.get(g.score?.winner ?? "None"),
        date: new Date(g.utcDate),
      };
    });

    //update game state
    programGames.forEach(async g => {
      const game = activeGames.find((x: any) => x.id === g.id);
      if(game.state !== "Finished") {
        game.result = "None";
      }
      if(programStateMap.get(JSON.stringify(g.state)) !== game.state) {
        await setGameState(game.id, game.state, game.result);
      }
    });

    //delete old games
    const currentDate = new Date();
    activeGames.forEach(async (g: any) => {
      if(currentDate.getTime() - g.date.getTime() >= timeBeforeDelete) {
        await deleteGame(g.id);
      }
    });

  }

  return {
    getState,
    initialize,
    reserveSpace,
    collectTaxes,
    addScheduledGame,
    setGameState,
    deleteGame,
    airdrop,
    getOwnerBalance,
    getProgramBalance,
    SyncData
  }
}