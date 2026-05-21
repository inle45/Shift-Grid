# Publier RUSH sur le Play Store

## Prérequis (à faire une seule fois)

1. **Android Studio** → https://developer.android.com/studio  
2. **Compte Google Play Developer** → https://play.google.com/console ($25 une fois)

---

## Étape 1 — Cloner et préparer le projet

```bash
git clone https://github.com/inle45/Shift-Grid.git
cd Shift-Grid
git checkout claude/rush-mobile-games-7to8P
npm install
```

---

## Étape 2 — Créer le projet Android

```bash
npx cap add android
```

Cela crée un dossier `android/` avec le projet Android Studio complet.

---

## Étape 3 — Créer ta clé de signature (une seule fois, garde-la précieusement)

```bash
keytool -genkey -v \
  -keystore rush-release.keystore \
  -alias rush \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000
```

⚠️ **Ne jamais commiter ce fichier sur GitHub** (il est déjà dans .gitignore).

---

## Étape 4 — Builder le AAB (Android App Bundle)

```bash
npm run build:android       # build web + sync Capacitor
npm run open:android        # ouvre Android Studio
```

Dans Android Studio :
1. `Build` → `Generate Signed Bundle / APK`
2. Choisir **Android App Bundle**
3. Sélectionner `rush-release.keystore`
4. Entrer alias `rush` et les mots de passe
5. Build type : **Release**
6. Le fichier `.aab` est généré dans `android/app/release/`

---

## Étape 5 — Créer la fiche Play Store

Dans Google Play Console → **Créer une application** :

### Infos obligatoires
- **Nom** : RUSH — Mini-jeux de réflexes
- **Description courte** : 5 mini-jeux de réflexes addictifs. Tape, enchaîne, chronomètre !
- **Description longue** :
  ```
  RUSH est une collection de 5 mini-jeux ultra-rapides conçus pour tester 
  tes réflexes. Chaque jeu dure 10 à 20 secondes — parfait pour une pause !
  
  🎮 TAP RUSH — Tape les cercles le plus vite possible
  🔗 SWIPE CHAIN — Enchaîne les chiffres dans l'ordre  
  ⚡ CLICKER — Le multiplicateur monte, tape sans t'arrêter
  🎯 PULSE — Tape au bon moment dans la zone
  🔄 COMBO BLITZ — Alterne gauche/droite aussi vite que tu peux
  
  + Système de pièces, power-ups et classement perso !
  ```

### Screenshots requis (capture sur un vrai téléphone)
- 2 screenshots minimum (format 16:9 ou 9:16)
- 1 Feature Graphic : 1024×500 px

### Paramètres
- **Catégorie** : Jeux → Arcade
- **Classement** : E (Everyone) — pas de violence, pas d'adultes
- **Pays** : Tous (ou France pour commencer)

---

## Étape 6 — Activer AdMob (optionnel mais recommandé)

1. Créer un compte sur https://admob.google.com
2. Créer une app Android → noter l'App ID
3. Créer 2 unités publicitaires : **Banner** et **Interstitiel**
4. Dans le projet, installer : `npm install @capacitor-community/admob`
5. Décommenter les blocs AdMob dans `src/sfx.ts` et `capacitor.config.ts`
6. Remplacer les placeholders par tes vrais IDs

---

## Étape 7 — Upload et review

1. Play Console → Production (ou Test interne pour commencer)
2. Uploader le fichier `.aab`
3. Remplir le questionnaire de contenu
4. Soumettre → Google review : **3 à 7 jours**

---

## Checklist finale avant soumission

- [ ] App testée sur vrai téléphone Android
- [ ] Pas d'erreurs console
- [ ] Privacy Policy créée (requis — utiliser https://www.privacypolicygenerator.info)
- [ ] Screenshots dans Play Console
- [ ] Feature Graphic uploadé
- [ ] AdMob configuré (optionnel)
- [ ] Prix "Remove Ads" configuré dans Google Play Billing
