import { getFirestore, Firestore } from 'firebase-admin/firestore';

export class FirestoreHelper {
  private _db: Firestore;

  constructor() {
    this._db = getFirestore();
  }

  get db() {
    return this._db;
  }
}
