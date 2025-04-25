import { applyDecorators, UseGuards } from '@nestjs/common';
import { Roles } from './roles.decorator';
import { JwtAuthGuard } from "../guard/auth.guard";
import { RolesGuard } from "../guard/roles.guard";
import { ROLES } from '../constants/roles.constants';

export const Auth = (...roles: ROLES[]) => {
  return applyDecorators(
    Roles(...roles),
    UseGuards(JwtAuthGuard, RolesGuard),
  );
};
