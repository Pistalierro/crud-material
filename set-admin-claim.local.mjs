import {readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {cert, initializeApp} from 'firebase-admin/app';
import {getAuth} from 'firebase-admin/auth';

const serviceAccountPath = resolve('service-account.crud-material.json');
const userUid = 'xDqvsf8yrrUjGk4Llc1eNWdfMjf1';

async function main() {
  const serviceAccountRaw = await readFile(serviceAccountPath, 'utf-8');
  const serviceAccount = JSON.parse(serviceAccountRaw);

  initializeApp({
    credential: cert(serviceAccount)
  });

  await getAuth().setCustomUserClaims(userUid, {admin: true});

  console.log(`Admin claim enabled for uid: ${userUid}`);
}

main().catch((error) => {
  console.error('Failed to set admin claim:', error);
  process.exitCode = 1;
});
