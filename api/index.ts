/**
 * Vercel serverless entrypoint.
 * All /api/* requests are rewritten here and handled by the Express app.
 */
import app from '../server/src/app';

export default app;
