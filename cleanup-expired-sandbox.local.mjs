import {readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {cert, initializeApp} from 'firebase-admin/app';
import {getFirestore, Timestamp} from 'firebase-admin/firestore';

const serviceAccountPath = resolve('service-account.crud-material.json');

async function main() {
  const serviceAccountRaw = await readFile(serviceAccountPath, 'utf-8');
  const serviceAccount = JSON.parse(serviceAccountRaw);

  initializeApp({
    credential: cert(serviceAccount)
  });

  const firestore = getFirestore();
  const nowMillis = Timestamp.now().toMillis();

  const snapshot = await firestore.collectionGroup('sandboxProducts').get();

  const expiredDocs = snapshot.docs.filter((docSnapshot) => {
    const expiresAt = docSnapshot.get('expiresAt');

    return expiresAt instanceof Timestamp && expiresAt.toMillis() <= nowMillis;
  });

  console.log(`Expired sandbox docs found: ${expiredDocs.length}`);

  for (const docSnapshot of expiredDocs) {
    await docSnapshot.ref.delete();
    console.log(`Deleted: ${docSnapshot.ref.path}`);
  }
}

main().catch((error) => {
  console.error('Failed to inspect expired sandbox docs:', error);
  process.exitCode = 1;
});
