import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { existsSync, readdirSync } from 'fs';

export default defineEventHandler(async (event) => {
  const __dirname = dirname(fileURLToPath(import.meta.url));
  const dataDir = join(__dirname, '../data');
  const dataPath = join(dataDir, 'soberDate.json');
  
  const result = {
    dirname: __dirname,
    dataDir: dataDir,
    dataPath: dataPath,
    dataPathExists: existsSync(dataPath),
    dataDirExists: existsSync(dataDir)
  };
  
  // List files in data directory if it exists
  if (result.dataDirExists) {
    try {
      result.files = readdirSync(dataDir);
    } catch (error) {
      result.error = error.message;
    }
  }
  
  return result;
});