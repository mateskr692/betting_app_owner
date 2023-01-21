import * as anchor from "@project-serum/anchor";
import { Program, AnchorProvider, web3 } from "@project-serum/anchor";
import { BettingApp, IDL } from "./betting_app";
import { PublicKey } from "@solana/web3.js";
import { useAnchorWallet, AnchorWallet } from "@solana/wallet-adapter-react";

export const useClient = () => {

  const wallet = useAnchorWallet();
  const program = getProgram()
  const owner = anchor.web3.Keypair.fromSecretKey(new Uint8Array([124,160,215,34,232,120,109,233,130,20,177,19,171,155,73,185,5,178,42,216,250,26,31,5,98,50,229,73,153,82,205,179,47,69,130,142,236,81,193,169,164,117,10,50,172,251,12,234,60,113,134,185,64,227,17,135,211,223,76,176,109,66,245,55]));
  const contract = anchor.web3.Keypair.fromSecretKey(new Uint8Array([45,76,138,74,253,72,12,115,129,212,212,40,78,40,230,32,195,160,21,186,197,175,192,95,240,57,5,162,221,25,101,193,219,181,92,128,246,1,95,116,82,226,157,143,56,18,196,132,7,37,69,157,11,102,50,57,248,72,75,197,25,112,10,120]));

  function getProgram() {
    if(!wallet) {
      throw "cant get wallet";
    }

    const network = "https://api.devnet.solana.com";
    const connection = new web3.Connection(network, "processed");
    const provider = new AnchorProvider(connection, wallet, {
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
    return await program.account.programContract.fetch(contract.publicKey);
  }

  async function initialize() {
    const [programPDA, _] = PublicKey.findProgramAddressSync(
      [
        anchor.utils.bytes.utf8.encode("program-wallet"),
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
      .signers(owner instanceof (wallet as any) ? [] : [owner])
      .rpc();
  }
  
  async function collectTaxes() {
    const [programPDA, _pb] = PublicKey.findProgramAddressSync(
      [
        anchor.utils.bytes.utf8.encode("program-wallet"),
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
      .signers(owner instanceof (wallet as any) ? [] : [owner])
      .rpc();
  }
  
  async function addScheduledGame(gameId: any) {
    await program.methods
      .addScheduledGame(gameId)
      .accounts({
        owner: owner.publicKey,
        contract: contract.publicKey,
      })
      .signers(owner instanceof (wallet as any) ? [] : [owner])
      .rpc();
  }
  
  async function setGameState(gameId: any, state: string, result: string) {
    await program.methods
      .setGameState(gameId, state, result)
      .accounts({
        owner: owner.publicKey,
        contract: contract.publicKey,
      })
      .signers(owner instanceof (wallet as any) ? [] : [owner])
      .rpc();
  }
  
  async function deleteGame(gameId: any) {
    await program.methods
      .deleteGame(gameId)
      .accounts({
        owner: owner.publicKey,
        contract: contract.publicKey,
      })
      .signers(owner instanceof (wallet as any) ? [] : [owner])
      .rpc();
  }
  
  async function airdrop(amount) {
    const airdropSignature = await program.provider.connection.requestAirdrop(owner.publicKey, anchor.web3.LAMPORTS_PER_SOL * amount);
    await program.provider.connection.confirmTransaction(airdropSignature);
  };

}