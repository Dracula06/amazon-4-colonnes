# Règles du projet

## Modularité obligatoire
Pas de nouveau monolithe. Séparer les responsabilités : capture, normalisation, nettoyage, export, transport GitHub, présentation et orchestration. Une fonction = une responsabilité claire, pas nécessairement un fichier par fonction. Les contrôleurs ne doivent pas contenir les règles métier. Aucun module métier ne doit manipuler l'interface. Pas de dépendance externe distante exécutée.

Le fichier amazon.js existant est une dette historique à décomposer dans un chantier distinct avec tests, sans refonte implicite pendant l'ajout du collecteur.

## Connaissances et preuves
Chaque conclusion doit indiquer statut, portée et source. Une capture ne prouve pas une règle globale. Mettre à jour connaissances/BASE_DE_CONNAISSANCES.md et les pistes lors des découvertes vérifiées. Ne pas transformer une hypothèse en fait sans preuve. Conserver les faits contredits avec explication.

## Captures
Collecter le DOM global, pas uniquement nos sélecteurs. Distinguer brut local et copie filtrée partageable. Ne jamais versionner cookies, jetons, valeurs d'authentification, HTML brut du compte ou fichiers HAR. Le nettoyage heuristique ne garantit pas l'anonymisation : aperçu et confirmation requis. Ne jamais exécuter du HTML capturé dans l'origine de l'extension. Un token GitHub ne doit apparaître ni dans le dépôt, ni dans storage.sync, ni dans les captures.

## Validation
Vérifier syntaxe, tests unitaires ET extraction DOM sur fixtures sans secrets. Expliquer les tests non exécutés. Toute fonction nouvelle doit avoir un module identifiable et une documentation de ses limites. Maintenir le comportement des badges et de la disposition pendant les changements du collecteur.
