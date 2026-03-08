use anchor_lang::prelude::*;

declare_id!("HzWgYgPBnbvwKyfXW7Kv2VZ5AggpGGumA5Za2u22sada");

#[program]
pub mod vehicle_program {
    use super::*;

    pub fn register_vehicle(
        ctx: Context<RegisterVehicle>,
        brand: String,
        model: String,
        year: u16,
        price: u64,
        plate: String,
    ) -> Result<()> {
        
        let vehicle = &mut ctx.accounts.vehicle;
        
        vehicle.owner = ctx.accounts.owner.key();
        vehicle.brand = brand.clone();
        vehicle.model = model.clone();
        vehicle.year = year;
        vehicle.price = price;
        vehicle.plate = plate;
        vehicle.is_for_sale = true;
        vehicle.bump = ctx.bumps.vehicle;
        
        msg!("Vehiculo registrado: {} {} {}", brand, model, year);
        
        Ok(())
    }

    pub fn transfer_vehicle(
        ctx: Context<TransferVehicle>,
        new_price: u64,
    ) -> Result<()> {
        
        let vehicle = &mut ctx.accounts.vehicle;
        let seller = &ctx.accounts.seller;
        let buyer = &ctx.accounts.buyer;
        
        require!(
            vehicle.is_for_sale, 
            VehicleError::NotForSale
        );
        
        require!(
            vehicle.owner == seller.key(),
            VehicleError::NotTheOwner
        );
        
        vehicle.owner = buyer.key();
        vehicle.price = new_price;
        vehicle.is_for_sale = false;
        
        let transaction = &mut ctx.accounts.transaction;
        transaction.vehicle = ctx.accounts.vehicle.key();
        transaction.seller = seller.key();
        transaction.buyer = buyer.key();
        transaction.price = new_price;
        transaction.bump = ctx.bumps.transaction;
        
        msg!("Vehiculo transferido de {} a {}", 
            seller.key(), 
            buyer.key()
        );
        
        Ok(())
    }

    pub fn list_for_sale(
        ctx: Context<ListForSale>,
        new_price: u64,
    ) -> Result<()> {
        
        let vehicle = &mut ctx.accounts.vehicle;
        
        require!(
            vehicle.owner == ctx.accounts.owner.key(),
            VehicleError::NotTheOwner
        );
        
        vehicle.is_for_sale = true;
        vehicle.price = new_price;
        
        msg!("Vehiculo puesto en venta por {} SOL", new_price);
        
        Ok(())
    }

    pub fn delete_vehicle(
        ctx: Context<DeleteVehicle>,
    ) -> Result<()> {
        
        let vehicle = &mut ctx.accounts.vehicle;
        
        require!(
            vehicle.owner == ctx.accounts.owner.key(),
            VehicleError::NotTheOwner
        );
        
        msg!("Vehiculo eliminado: {} {}", 
            vehicle.brand, 
            vehicle.model
        );
        
        Ok(())
    }
}

#[error_code]
pub enum VehicleError {
    #[msg("El vehiculo no esta en venta")]
    NotForSale,
    
    #[msg("No eres el propietario del vehiculo")]
    NotTheOwner,
    
    #[msg("La matricula ya esta registrada")]
    PlateAlreadyExists,
}

#[account]
#[derive(InitSpace)]
pub struct Vehicle {
    pub owner: Pubkey,
    
    #[max_len(50)]
    pub brand: String,
    
    #[max_len(50)]
    pub model: String,
    
    pub year: u16,
    pub price: u64,
    
    #[max_len(20)]
    pub plate: String,
    
    pub is_for_sale: bool,
    pub bump: u8,
}

#[account]
#[derive(InitSpace)]
pub struct Transaction {
    pub vehicle: Pubkey,
    pub seller: Pubkey,
    pub buyer: Pubkey,
    pub price: u64,
    pub bump: u8,
}

#[derive(Accounts)]
pub struct RegisterVehicle<'info> {
    #[account(
        init,
        payer = owner,
        space = 8 + Vehicle::INIT_SPACE,
        seeds = [b"vehicle", owner.key().as_ref()],
        bump
    )]
    pub vehicle: Account<'info, Vehicle>,
    
    #[account(mut)]
    pub owner: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct TransferVehicle<'info> {
    #[account(
        mut,
        seeds = [b"vehicle", vehicle.owner.as_ref()],
        bump = vehicle.bump
    )]
    pub vehicle: Account<'info, Vehicle>,
    
    #[account(
        init,
        payer = buyer,
        space = 8 + Transaction::INIT_SPACE,
        seeds = [b"transaction", vehicle.key().as_ref()],
        bump
    )]
    pub transaction: Account<'info, Transaction>,
    
    #[account(mut)]
    pub seller: Signer<'info>,
    
    #[account(mut)]
    pub buyer: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ListForSale<'info> {
    #[account(
        mut,
        seeds = [b"vehicle", owner.key().as_ref()],
        bump = vehicle.bump
    )]
    pub vehicle: Account<'info, Vehicle>,
    
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct DeleteVehicle<'info> {
    #[account(
        mut,
        close = owner,
        seeds = [b"vehicle", owner.key().as_ref()],
        bump = vehicle.bump
    )]
    pub vehicle: Account<'info, Vehicle>,
    
    #[account(mut)]
    pub owner: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}