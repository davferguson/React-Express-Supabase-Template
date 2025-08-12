import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { supabase } from './supabase';

dotenv.config();

const app = express();
const port = process.env.PORT ? Number(process.env.PORT) : 5174;

// Trust proxy (needed if behind reverse proxy for correct IP rate limiting)
app.set('trust proxy', 1);

// Security headers
app.use(
  helmet({
    // API may serve JSON to different origins; adjust as needed
    crossOriginResourcePolicy: false,
  })
);

// Build allowed origins list safely
const allowedOriginsEnv = process.env.CORS_ORIGIN?.split(',')
  .map((o) => o.trim())
  .filter(Boolean);
const allowedOrigins = allowedOriginsEnv && allowedOriginsEnv.length > 0 ? allowedOriginsEnv : ['http://localhost:5173'];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow non-browser or same-origin requests (origin may be undefined)
      if (!origin) return callback(null, true);
      return callback(null, allowedOrigins.includes(origin));
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: false,
    optionsSuccessStatus: 204,
  })
);

// JSON body limit to reduce risk of DoS via large payloads
app.use(express.json({ limit: '100kb' }));

// Basic rate limiting for API routes
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', apiLimiter);

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ ok: true, service: 'server', env: process.env.NODE_ENV || 'development' });
});

app.get('/api/profile', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined;
    if (!token) return res.status(401).json({ error: 'Missing bearer token' });

    const { data: userResult, error: userError } = await supabase.auth.getUser(token);
    if (userError || !userResult?.user) return res.status(401).json({ error: 'Invalid token' });

    res.json({ user: { id: userResult.user.id, email: userResult.user.email } });
  } catch (err) {
    res.status(500).json({ error: 'Unexpected error' });
  }
});

app.listen(port, () => {
  console.log(`API server listening on http://localhost:${port}`);
});

// Global error handler to avoid leaking internals
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  // eslint-disable-next-line no-console
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});


