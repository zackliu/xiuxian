import { mkdtempSync, rmSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

const tempSaveDir = mkdtempSync(join(tmpdir(), 'xiuxian-save-'));
process.env.SAVE_DIR = tempSaveDir;
process.env.AI_PROVIDER = process.env.AI_PROVIDER ?? 'mock';
process.env.PORT = process.env.PORT ?? '0';

afterAll(() => {
  rmSync(tempSaveDir, { recursive: true, force: true });
});
