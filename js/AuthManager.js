import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth, signInAnonymously, signOut, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getFirestore, doc, getDoc, setDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { firebaseConfig } from './FirebaseConfig.js';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export class AuthManager {
  constructor() {
    this.user = null;
    this.profile = null;
  }

  async init() {
    return new Promise((resolve) => {
      onAuthStateChanged(auth, async (user) => {
        this.user = user;
        if (user) {
          this.profile = await this.loadOrCreateProfile(user);
        }
        resolve(user);
      });
    });
  }

  async loginAnonymous() {
    try {
      const result = await signInAnonymously(auth);
      this.user = result.user;
      this.profile = await this.loadOrCreateProfile(result.user);
      return this.profile;
    } catch (err) {
      console.error('Anonim giris hatasi:', err);
      throw new Error('Giris yapilamadi. Firebase Auth ayarlarini kontrol et.');
    }
  }

  async logout() {
    await signOut(auth);
    this.user = null;
    this.profile = null;
  }

  async loadOrCreateProfile(user) {
    const ref = doc(db, 'players', user.uid);
    const snap = await getDoc(ref);

    if (snap.exists()) {
      return snap.data();
    }

    // Yeni oyuncu profili
    const randomName = 'Oyuncu_' + Math.floor(Math.random() * 9000 + 1000);
    const newProfile = {
      uid: user.uid,
      displayName: randomName,
      profilePhoto: '',
      createdAt: serverTimestamp(),
      level: 1,
      xp: 0,
      trophies: 0,
      coins: 100,
      gems: 0,
      selectedCharacter: 'blitz',
      wins: 0,
      losses: 0,
      matchesPlayed: 0,
      characters: {
        blitz: { level: 1, trophies: 0, unlocked: true, powerLevel: 1 }
      },
      settings: { graphics: 'medium', fps: 60 }
    };

    await setDoc(ref, newProfile);
    return newProfile;
  }

  getProfile() {
    return this.profile;
  }
}