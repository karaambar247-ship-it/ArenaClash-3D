# ArenaClash 3D

Orijinal 3D arena savas oyunu prototipi.
Brawl Stars tarzinda hizli tempolu, renkli, rekabetci ama tamamen ozgun karakterler, isimler ve gorseller.

## Teknolojiler
- Three.js (3D)
- Firebase Authentication (Google giris)
- Firebase Firestore (oyuncu profili)
- Vanilla JS (moduler)

## Calistirma
1. Repo'yu clone'la
2. `index.html` dosyasini bir local server ile ac (Live Server veya `npx serve`)
3. Google ile giris yap

## Firebase
Config zaten ekli. Firebase Console'da:
- Authentication > Sign-in method > Google > Enable yapman lazim.
- Firestore Database olustur (test mode baslangic icin).

## Simdilik ne var?
- Google ile giris
- Oyuncu profili olusturma/yukleme
- 3D arena
- Karakter hareketi (WASD + mouse PC, joystick mobil)
- Ustten acili kamera
- Basit saldiri

## Sonraki adimlar
- Gercek multiplayer (Colyseus veya Photon)
- Karakter siniflari
- Haritalar
- Matchmaking

Emir icin yapildi. Elinden geleni yaptik, gerisi birlikte.