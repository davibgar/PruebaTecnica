import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

/** Inyecta el `businessId` del tenant (puesto por `BusinessGuard`). */
export const BusinessId = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string => {
    const request = ctx
      .switchToHttp()
      .getRequest<Request & { businessId: string }>();
    return request.businessId;
  },
);
