import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

interface RequestWithUser extends Request {
  user: {
    userId: number;
  };
}

export const GetUserId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): number => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();

    return request.user.userId;
  },
);
