// src/shared/firebase.service.ts

import { Injectable, Logger } from '@nestjs/common';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getAuth, Auth } from 'firebase-admin/auth';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class FirebaseService {
  private readonly logger = new Logger(FirebaseService.name);
  private db: Firestore;
  private auth: Auth;

  constructor() {
    const serviceAccountPath = path.join(__dirname, '../../credentials/firebase-key.json');
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

    if (!getApps().length) {
      initializeApp({
        credential: cert(serviceAccount),
      });
      this.logger.log('✅ Firebase inicializado');
    }

    const firestore = getFirestore();
    this.db = firestore;

    this.auth = getAuth(); // para autenticación
  }

  // 👉 Acceso directo para uso en otros servicios
  getFirestore(): Firestore {
    return this.db;
  }

  getAuth(): Auth {
    return this.auth;
  }

  // Métodos reutilizables
  async findByEmail(collection: string, email: string) {
    const snapshot = await this.db.collection(collection).where('email', '==', email).get();
    if (snapshot.empty) return null;

    const doc = snapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data(),
    };
  }

  async createDocument(collection: string, data: any) {
    const docRef = await this.db.collection(collection).add(data);
    return docRef.id;
  }
  async broadcast(collection: string, data: any): Promise<void> {
  const db = this.getFirestore();
  await db.collection(collection).add({
    ...data,
    timestamp: new Date(),
  });
}
}
