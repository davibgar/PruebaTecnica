import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { Request } from 'express';

/** Header por el que llega el identificador de negocio (tenant). */
export const BUSINESS_ID_HEADER = 'x-business-id';

/**
 * Aislamiento multi-tenant: exige `x-business-id` en toda petición y lo deja en
 * `request.businessId` (lo lee el decorador `@BusinessId()`). El tenant viaja
 * por header, no por usuario autenticado, para no añadir una capa de auth real.
 */
@Injectable()
export class BusinessGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const businessId = request.header(BUSINESS_ID_HEADER);

    if (!businessId || businessId.trim() === '') {
      throw new BadRequestException(
        `Falta el header obligatorio '${BUSINESS_ID_HEADER}'.`,
      );
    }

    (request as Request & { businessId: string }).businessId =
      businessId.trim();
    return true;
  }
}
