import type { Request, Response } from 'express';
import { z } from 'zod';
import type { TwoFactorAuthService } from '../../application/services/TwoFactorAuthService.js';

const sendSchema   = z.object({ email: z.string().email(), name: z.string().optional() });
const verifySchema = z.object({ email: z.string().email(), code: z.string().length(6) });

export class AuthController {
  constructor(private readonly twoFA: TwoFactorAuthService) {}

  /** POST /api/auth/2fa/send */
  sendCode = async (req: Request, res: Response): Promise<void> => {
    const parsed = sendSchema.safeParse(req.body);
    if (!parsed.success) { res.status(400).json({ error: 'email válido requerido' }); return; }
    await this.twoFA.sendCode(parsed.data.email, parsed.data.name);
    res.json({ sent: true });
  };

  /** POST /api/auth/2fa/verify */
  verifyCode = (req: Request, res: Response): void => {
    const parsed = verifySchema.safeParse(req.body);
    if (!parsed.success) { res.status(400).json({ error: 'email y código de 6 dígitos requeridos' }); return; }
    const result = this.twoFA.verifyCode(parsed.data.email, parsed.data.code);
    if (!result.valid) { res.status(401).json({ error: result.reason }); return; }
    // Production: issue JWT/session here.
    res.json({ verified: true, token: `demo-token-${Date.now()}` });
  };
}
