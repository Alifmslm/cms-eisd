import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('api/auth')
export class AuthController {
  // All auth endpoints now handled by Better Auth mounted in main.ts.
  // This controller is retained as a placeholder until removed in cleanup.
}
