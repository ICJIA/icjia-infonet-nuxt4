import { exec } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs-extra';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const REPORT_PATH = path.join(__dirname, '..', 'accessibility-reports', 'accessibility-report-latest.html');

async function openReport() {
  // Check if report exists
  if (!await fs.pathExists(REPORT_PATH)) {
    console.error('❌ No accessibility report found. Please run the audit first with: npm run audit:a11y');
    process.exit(1);
  }

  console.log('📂 Opening accessibility report...');
  
  // Determine the command based on the platform
  const platform = process.platform;
  let command;
  
  if (platform === 'darwin') {
    command = `open "${REPORT_PATH}"`;
  } else if (platform === 'win32') {
    command = `start "" "${REPORT_PATH}"`;
  } else {
    command = `xdg-open "${REPORT_PATH}"`;
  }
  
  exec(command, (error) => {
    if (error) {
      console.error('❌ Error opening report:', error.message);
      console.log(`📄 Report location: ${REPORT_PATH}`);
      process.exit(1);
    }
    console.log('✅ Report opened in your default browser');
  });
}

openReport();

