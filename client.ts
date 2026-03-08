import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import { Buffer } from "buffer";

const PROGRAM_ID = "HzWgYgPBnbvwKyfXW7Kv2VZ5AggpGGumA5Za2u22sada";

const connection = new anchor.web3.Connection(
  anchor.web3.clusterApiUrl("devnet"),
  "confirmed"
);

let wallet: anchor.Wallet | null = null;
let provider: anchor.AnchorProvider | null = null;
let program: Program | null = null;
let vehiclePda: PublicKey | null = null;

async function init() {
  try {
    const walletKey = anchor.web3.Keypair.generate();
    
    wallet = new anchor.Wallet(walletKey);
    provider = new anchor.AnchorProvider(connection, wallet, {
      commitment: "confirmed"
    });
    
    const idl = await fetch(
      `https://api.devnet.solana.com/programs/${PROGRAM_ID}`
    ).then(res => res.json());
    
    program = new Program(idl, PROGRAM_ID, provider);
    
    const [pda] = PublicKey.findProgramAddressSync(
      [Buffer.from("vehicle"), wallet.publicKey.toBuffer()],
      new PublicKey(PROGRAM_ID)
    );
    vehiclePda = pda;
    
    log("Programa inicializado correctamente");
    log(`Wallet: ${wallet.publicKey.toString().slice(0, 8)}...`);
    log(`Vehicle PDA: ${pda.toString().slice(0, 8)}...`);
    log(`Program ID: ${PROGRAM_ID}`);
    
  } catch (error) {
    log("Error inicializando: " + error.message);
  }
}

function log(message: string) {
  console.log(message);
}

function solToLamports(sol: number): anchor.BN {
  return new anchor.BN(sol * anchor.web3.LAMPORTS_PER_SOL);
}

async function registerVehicle() {
  if (!program || !wallet) {
    log("Programa no inicializado");
    return;
  }
  
  try {
    const brand = "Toyota";
    const model = "Corolla";
    const year = 2022;
    const price = solToLamports(2);
    const plate = "ABC-1234";
    
    log("Registrando vehiculo");
    log(`Program ID: ${PROGRAM_ID}`);
    log(`Wallet: ${wallet.publicKey.toString()}`);
    log(`Vehicle PDA: ${vehiclePda!.toString()}`);
    
    const tx = await program.methods
      .registerVehicle(brand, model, year, price, plate)
      .accounts({
        vehicle: vehiclePda!,
        owner: wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();
    
    log(`Vehiculo registrado: ${tx}`);
    await loadVehicleData();
    
  } catch (error) {
    log("Error: " + error.message);
    log("Debug:");
    log(`   - Program ID: ${PROGRAM_ID}`);
    log(`   - Wallet: ${wallet?.publicKey.toString()}`);
    log(`   - Vehicle PDA: ${vehiclePda?.toString()}`);
  }
}

async function listForSale() {
  if (!program || !wallet) {
    log("Programa no inicializado");
    return;
  }
  
  try {
    const price = solToLamports(2.5);
    
    log("Listando en venta");
    
    const tx = await program.methods
      .listForSale(price)
      .accounts({
        vehicle: vehiclePda!,
        owner: wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();
    
    log(`Listado en venta: ${tx}`);
    await loadVehicleData();
    
  } catch (error) {
    log("Error: " + error.message);
  }
}

async function transferVehicle() {
  if (!program || !wallet) {
    log("Programa no inicializado");
    return;
  }
  
  try {
    const price = solToLamports(3);
    
    log("Transfiriendo vehiculo");
    
    const [transactionPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("transaction"), vehiclePda!.toBuffer()],
      new PublicKey(PROGRAM_ID)
    );
    
    const buyerKeypair = anchor.web3.Keypair.generate();
    await connection.requestAirdrop(buyerKeypair.publicKey, anchor.web3.LAMPORTS_PER_SOL * 5);
    
    const buyerWallet = new anchor.Wallet(buyerKeypair);
    const buyerProvider = new anchor.AnchorProvider(connection, buyerWallet, {});
    const buyerProgram = new Program(idl, PROGRAM_ID, buyerProvider);
    
    const tx = await buyerProgram.methods
      .transferVehicle(price)
      .accounts({
        vehicle: vehiclePda!,
        transaction: transactionPda,
        seller: wallet.publicKey,
        buyer: buyerKeypair.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();
    
    log(`Transferencia completada: ${tx}`);
    await loadVehicleData();
    
  } catch (error) {
    log("Error: " + error.message);
  }
}

async function loadVehicleData() {
  if (!program) {
    log("Programa no inicializado");
    return;
  }
  
  try {
    const vehicleData = await program.account.vehicle.fetch(vehiclePda!);
    
    const priceInSol = (vehicleData.price / anchor.web3.LAMPORTS_PER_SOL).toFixed(2);
    
    log("Informacion del vehiculo");
    log(`Dueño: ${vehicleData.owner.toString().slice(0, 8)}...`);
    log(`Marca: ${vehicleData.brand}`);
    log(`Modelo: ${vehicleData.model}`);
    log(`Año: ${vehicleData.year}`);
    log(`Matricula: ${vehicleData.plate}`);
    log(`Precio: ${priceInSol} SOL`);
    log(`Estado: ${vehicleData.isForSale ? "En Venta" : "No en Venta"}`);
    log("");
    
  } catch (error) {
    log("No hay vehiculo registrado para esta wallet");
  }
}

async function deleteVehicle() {
  if (!program || !wallet) {
    log("Programa no inicializado");
    return;
  }
  
  try {
    log("Eliminando vehiculo");
    
    const tx = await program.methods
      .deleteVehicle()
      .accounts({
        vehicle: vehiclePda!,
        owner: wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();
    
    log(`Vehiculo eliminado: ${tx}`);
    
  } catch (error) {
    log("Error: " + error.message);
  }
}

async function runTests() {
  log("Iniciando pruebas");
  log("");
  
  await registerVehicle();
  await loadVehicleData();
  await listForSale();
  await transferVehicle();
  
  log("Pruebas completadas");
  log("");
}

init().then(() => {
  runTests();
});