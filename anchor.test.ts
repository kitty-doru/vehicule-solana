import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import { Buffer } from "buffer";

describe("vehicle_program", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  
  const program = anchor.workspace.VehicleProgram as Program;
  const wallet = provider.wallet as anchor.Wallet;
  
  const programId = new PublicKey("HzWgYgPBnbvwKyfXW7Kv2VZ5AggpGGumA5Za2u22sada");
  
  function log(message: string) {
    console.log(message);
  }
  
  function solToLamports(sol: number): anchor.BN {
    return new anchor.BN(sol * anchor.web3.LAMPORTS_PER_SOL);
  }
  
  describe("registerVehicle", () => {
    it("Registra un vehiculo nuevo", async () => {
      const [vehiclePda] = PublicKey.findProgramAddressSync(
        [Buffer.from("vehicle"), wallet.publicKey.toBuffer()],
        programId
      );
      
      const tx = await program.methods
        .registerVehicle("Toyota", "Corolla", 2022, solToLamports(2), "ABC-1234")
        .accounts({
          vehicle: vehiclePda,
          owner: wallet.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();
      
      log(`Vehiculo registrado: ${tx}`);
      
      const vehicleData = await program.account.vehicle.fetch(vehiclePda);
      log(`Marca: ${vehicleData.brand}`);
      log(`Modelo: ${vehicleData.model}`);
    });
  });
  
  describe("listForSale", () => {
    it("Pone vehiculo en venta", async () => {
      const [vehiclePda] = PublicKey.findProgramAddressSync(
        [Buffer.from("vehicle"), wallet.publicKey.toBuffer()],
        programId
      );
      
      const tx = await program.methods
        .listForSale(solToLamports(2.5))
        .accounts({
          vehicle: vehiclePda,
          owner: wallet.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();
      
      log(`Listado en venta: ${tx}`);
    });
  });
  
  describe("transferVehicle", () => {
    it("Transfiere vehiculo", async () => {
      const [vehiclePda] = PublicKey.findProgramAddressSync(
        [Buffer.from("vehicle"), wallet.publicKey.toBuffer()],
        programId
      );
      
      const [transactionPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("transaction"), vehiclePda.toBuffer()],
        programId
      );
      
      const buyerKeypair = anchor.web3.Keypair.generate();
      await provider.connection.requestAirdrop(
        buyerKeypair.publicKey,
        anchor.web3.LAMPORTS_PER_SOL * 5
      );
      
      const buyerWallet = new anchor.Wallet(buyerKeypair);
      const buyerProvider = new anchor.AnchorProvider(
        provider.connection,
        buyerWallet,
        {}
      );
      
      const buyerProgram = new Program(
        program.idl,
        programId,
        buyerProvider
      );
      
      const tx = await buyerProgram.methods
        .transferVehicle(solToLamports(3))
        .accounts({
          vehicle: vehiclePda,
          transaction: transactionPda,
          seller: wallet.publicKey,
          buyer: buyerKeypair.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();
      
      log(`Transferencia completada: ${tx}`);
    });
  });
});