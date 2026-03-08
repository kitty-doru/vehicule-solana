# Vehicle Program - Solana

Base de datos de transacciones de vehículos en Solana.

## Descripción

Este programa permite gestionar la compra y venta de vehículos en la blockchain de Solana. Cada vehículo se registra como una cuenta única y todas las transacciones se almacenan de forma permanente.

## Características

- Registrar vehículos nuevos
- Listar vehículos en venta
- Transferir propiedad (compra/venta)
- Eliminar vehículos
- Historial de transacciones
- Control de estado (en venta/no en venta)

## Estructura del Proyecto
vehicle-solana/ ├── src/ │ └── lib.rs # Código del programa en Rust/Anchor ├── Cargo.toml # Dependencias y configuración ├── client.ts # Cliente para pruebas ├── .gitignore # Archivos ignorados por Git └── README.md # Documentación



## Instalación

### Requisitos

- Rust (1.70+)
- Anchor CLI
- Solana CLI
- Node.js (18+)

### Instalar Dependencias


# Instalar Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env

# Instalar Anchor
cargo install --git https://github.com/coral-xyz/anchor avm --locked
avm install 0.29.0

# Instalar Solana CLI
sh -c "$(curl -sSfL https://release.solana.com/v1.16.0/install)"
Compilar el Programa
bash

Copy code
# Compilar
cargo build-solana

# Desplegar en devnet
solana program deploy target/deploy/vehicle_program.so
Uso
Registrar un Vehículo
typescript

Copy code
await program.methods
  .registerVehicle("Toyota", "Corolla", 2022, solToLamports(2), "ABC-1234")
  .accounts({
    vehicle: vehiclePda,
    owner: wallet.publicKey,
    systemProgram: anchor.web3.SystemProgram.programId,
  })
  .rpc();
Listar en Venta
typescript

Copy code
await program.methods
  .listForSale(solToLamports(2.5))
  .accounts({
    vehicle: vehiclePda,
    owner: wallet.publicKey,
    systemProgram: anchor.web3.SystemProgram.programId,
  })
  .rpc();
Transferir Propiedad
typescript

Copy code
await program.methods
  .transferVehicle(solToLamports(3))
  .accounts({
    vehicle: vehiclePda,
    transaction: transactionPda,
    seller: wallet.publicKey,
    buyer: buyerKeypair.publicKey,
    systemProgram: anchor.web3.SystemProgram.programId,
  })
  .rpc();
Estructura de Datos
Cuenta Vehicle
Campo

Tipo

Descripción

owner

Pubkey

Dueño actual del vehículo

brand

String

Marca (máx 50 caracteres)

model

String

Modelo (máx 50 caracteres)

year

u16

Año de fabricación

price

u64

Precio en lamports

plate

String

Matrícula (máx 20 caracteres)

is_for_sale

bool

Estado de venta

bump

u8

Semilla PDA

Cuenta Transaction
Campo

Tipo

Descripción

vehicle

Pubkey

ID del vehículo

seller

Pubkey

Vendedor

buyer

Pubkey

Comprador

price

u64

Precio de transacción

bump

u8

Semilla PDA

Errores Personalizados
Código

Mensaje

NotForSale

El vehículo no está en venta

NotTheOwner

No eres el propietario del vehículo

PlateAlreadyExists

La matrícula ya está registrada

Pruebas
Ejecutar Pruebas
bash


# En Solana Playground
1. Pestaña Deploy → Build y Deploy
2. Pestaña Test → Reemplazar PROGRAM_ID
3. Click en Run
Verificar Transacciones
bash


# Ver transacciones recientes
solana confirm <TX_ID>

# Ver balance
solana balance

# Obtener SOL de prueba
solana airdrop 2
Autor
Roberto Carlos Cervantes Rodriguez

Licencia
MIT

Enlaces
Solana Docs
Anchor Docs
Solana Playground
Soporte
Para dudas o problemas, abre un issue en el repositorio. EOF


