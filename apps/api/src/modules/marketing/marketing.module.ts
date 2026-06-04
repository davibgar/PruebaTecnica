import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Contact } from './entities/contact.entity';
import { Campaign } from './entities/campaign.entity';
import { Touchpoint } from './entities/touchpoint.entity';
import { Sale } from './entities/sale.entity';

/**
 * Módulo del dominio de marketing. Posee las entidades núcleo (Contact,
 * Campaign, Touchpoint, Sale) y reexporta TypeOrmModule para que otros módulos
 * (atribución, dashboard, action center) puedan inyectar sus repositorios.
 *
 * No expone controller: estos datos se precargan por seed, no por CRUD.
 */
@Module({
  imports: [TypeOrmModule.forFeature([Contact, Campaign, Touchpoint, Sale])],
  exports: [TypeOrmModule],
})
export class MarketingModule {}
