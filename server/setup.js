import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

process.env.NODE_ENV = 'test';

// Load test environment variables
dotenv.config({
  path: path.join(__dirname, 'config', '.env.test')
});

// Set default values if not present
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'test_secret_key_123';
}

if (!process.env.MONGODB_URI_TEST) {
  process.env.MONGODB_URI_TEST = 'mongodb+srv://MS:8sTGodDfhUh9lBym@cluster0.2uz4k.mongodb.net/test?retryWrites=true&w=majority';
}