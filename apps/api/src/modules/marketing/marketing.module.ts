import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Contact } from './entities/contact.entity';
import { Campaign } from './entities/campaign.entity';
import { Touchpoint } from './entities/touchpoint.entity';
import { Sale } from './entities/sale.entity';

/**
 * Dominio de marketing. Posee las entidades núcleo y reexporta TypeOrmModule
 * para que otros módulos inyecten sus repositorios. Sin controller: se cargan
 * por seed, no por CRUD.
 */
@Module({
  imports: [TypeOrmModule.forFeature([Contact, Campaign, Touchpoint, Sale])],
  exports: [TypeOrmModule],
})
export class MarketingModule {}
