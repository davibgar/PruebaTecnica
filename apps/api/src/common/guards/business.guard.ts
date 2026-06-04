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
 * Guard de aislamiento multi-tenant.
 *
 * Exige el header `x-business-id` en toda petición y lo deja disponible en
 * `request.businessId`. El decorador `@BusinessId()` lo lee desde ahí, de modo
 * que cada servicio filtra siempre por el negocio del header y ningún endpoint
 * puede devolver datos de otro negocio.
 *
 * Decisión documentada: el tenant viaja por header (no por usuario autenticado)
 * para mantener la prueba enfocada en el dominio, sin una capa de auth real.
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
