# Lumidra — projet Android (Capacitor)

Ce dossier contient tout ce qu'il faut pour obtenir un `.apk` de Lumidra avec
notifications natives (rappel quand une expédition est terminée), sans jamais
installer Android Studio.

## Mise en route (une seule fois)

1. Crée un nouveau dépôt sur GitHub (public ou privé, les deux fonctionnent).
2. Pousse ce dossier entier dedans :
   ```
   git init
   git add .
   git commit -m "Lumidra Android"
   git branch -M main
   git remote add origin https://github.com/TON-COMPTE/TON-DEPOT.git
   git push -u origin main
   ```
3. Va dans l'onglet **Actions** de ton dépôt GitHub — la construction démarre
   automatiquement (~3-5 minutes).
4. Une fois terminé (coche verte), clique sur le run → tout en bas, section
   **Artifacts** → télécharge `lumidra-apk`. C'est un `.zip` qui contient le
   `.apk` prêt à installer.

## Pour chaque mise à jour du jeu

Remplace `www/index.html` par la nouvelle version, puis :
```
git add .
git commit -m "mise à jour"
git push
```
GitHub reconstruit l'APK automatiquement — tu n'as plus qu'à retélécharger
l'artefact `lumidra-apk` dans l'onglet Actions.

## Installer sur le téléphone

Transfère le `.apk` (Drive, email, câble...), ouvre-le, autorise "sources
inconnues" si demandé, installe. C'est un APK **debug** (signature de test) :
suffisant pour une installation directe, mais pas pour publier sur le Play
Store — ça, c'est une étape à part si tu la souhaites un jour.

## Ce que ce projet ajoute par rapport à la version web/PWA

- Notifications natives : une alerte arrive quand une expédition se termine,
  même app fermée (impossible en PWA pure).
- Icône et polices déjà intégrées (mêmes fichiers que le PWA).
- Permission `VIBRATE` déclarée pour les retours haptiques déjà présents dans
  le jeu.

## Ce que je n'ai pas pu tester moi-même

Je ne peux pas compiler dans mon propre bac à sable (accès bloqué aux
serveurs Gradle/Android). Le projet est structurellement complet et
syntaxiquement validé, mais la toute première construction chez toi (via
GitHub Actions) sera le premier test réel de bout en bout — regarde l'onglet
Actions si quelque chose échoue, le message d'erreur Gradle y sera clair.
