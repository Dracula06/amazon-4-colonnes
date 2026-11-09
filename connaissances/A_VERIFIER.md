# À vérifier

- Capturer et versionner des exemples filtrés des messages combinés et séparés.
- Tester la capture quand notre disposition est active ET inactive ; ne pas attribuer nos transformations à Amazon.
- Déterminer une sélection robuste du groupe d'offre actif sur plusieurs catégories.
- Tester les groupes visibles contradictoires, popovers et changements d'offre sans rechargement.
- Évaluer les données sensibles résiduelles du filtre : attributs inconnus, styles, texte libre, JSON embarqué.
- Ajouter un mode facultatif de capture du HTML initial via debugger, sans le confondre avec une nouvelle requête HTTP.
- Étudier ressources CSS/JS, frames et shadow roots : actuellement seul l'inventaire est collecté.
- Tester le collecteur dans Chrome et Brave ; aucun test navigateur réel exécuté lors de sa création.
- Ajouter des tests DOM de nettoyage et de sélection, pas uniquement des tests de classification.
