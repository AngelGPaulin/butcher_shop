import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class FirebaseService implements OnModuleInit {
  private logger = new Logger(FirebaseService.name);
  private db: FirebaseFirestore.Firestore;

  onModuleInit() {
    const serviceAccountPath = path.join(__dirname, '../credentials/firebase-key.json');
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

    if (!getApps().length) {
      initializeApp({
        credential: cert(serviceAccount),
      });

      const firestore = getFirestore();
      firestore.settings({ ignoreUndefinedProperties: true });

      this.db = firestore;
      this.logger.log('🔥 Firebase inicializado con ignoreUndefinedProperties');
    } else {
      this.db = getFirestore();
    }
  }

  get firestore() {
    return this.db;
  }

  async broadcast(collection: string, data: any) {
    const ref = this.db.collection(collection).doc();
    await ref.set({
      ...data,
      timestamp: new Date().toISOString(),
    });
    this.logger.debug(`📤 Notificación enviada a ${collection}`);
  }

  async createFirebaseUser(email: string, password: string) {
    const auth = getAuth();
    try {
      await auth.createUser({ email, password });
      this.logger.log(`👤 Usuario Firebase creado: ${email}`);
    } catch (err) {
      this.logger.error(`❌ Error creando usuario en Firebase: ${err.message}`);
      throw err;
    }
  }
}
