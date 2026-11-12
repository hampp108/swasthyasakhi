import serverless from 'serverless-http';
import app from '../../server';

// Serverless handler for Netlify Functions
export const handler = serverless(app);
