# Lumidra — projet Android (Capacitor)

Ce dossier contient tout ce qu'il faut pour obtenir un `.apk` de Lumidra avec
notifications natives (rappel quand une expédition est terminée), sans jamais
installer Android Studio.

## Signature

Les constructions sont maintenant signées en "release" (plus en "debug") grâce
aux secrets configurés dans Settings → Secrets and variables → Actions :
`LUMIDRA_KEYSTORE_B64`, `LUMIDRA_KEYSTORE_PASSWORD`, `LUMIDRA_KEY_ALIAS`,
`LUMIDRA_KEY_PASSWORD`. Ne les supprime jamais — sans eux, il serait impossible
de publier une mise à jour compatible avec les installations existantes.

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
4. Une fois terminé (coche verte), va dans l'onglet **Releases** du dépôt :
   une nouvelle Release versionnée (`build-N`) y est publiée automatiquement,
   avec le `.apk` (installation directe) et le `.aab` (format Play Store) en
   pièces jointes. Le lien `releases/latest` pointe toujours vers la plus
   récente.

## Pour chaque mise à jour du jeu

Modifie les fichiers dans `www/`, puis :
```
git add .
git commit -m "mise à jour"
git push
```
GitHub reconstruit l'APK/AAB automatiquement et publie une nouvelle Release —
tu n'as plus qu'à retélécharger depuis l'onglet Releases.

## Installer sur le téléphone

Transfère le `.apk` (Drive, email, câble...), ouvre-le, autorise "sources
inconnues" si demandé, installe. Si les secrets de signature release sont
configurés (voir section Signature ci-dessus), l'APK est signé release et
les mises à jour successives s'installent par-dessus l'existante sans
désinstallation. Sans ces secrets, la construction retombe sur une
signature debug, suffisante pour une installation directe mais pas pour
publier sur le Play Store.

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
