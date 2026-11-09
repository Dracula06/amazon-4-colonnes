# Observations de la capture FR B0HFZH1Z9G

Preuve : capture 2026-11-09T19-43-25-677Z-b2f1ed62-1ac5-46d0-994f-d8365efd0b22, lecture partielle des fragments du dépôt. Date : 2026-11-09. Aucun secret reproduit ici.

## PRIV-001 — Meta associées
Statut : VÉRIFIÉ_SUR_UN_CAS. Le filtre v1 masque certains noms de meta sans masquer content. Correction v2 ajoutée ; test DOM synthétique fourni, à exécuter en navigateur. Ne pas confondre correction écrite et validation réelle.

## PRIV-002 — Identifiants résiduels
Statut : OBSERVÉ. Attributs data-raw-id et data-hashed-id présents dans la navigation. Valeurs inutiles à l'analyse structurelle, désormais masquées.

## INJECT-001 — Contenu non Amazon
Statut : VÉRIFIÉ_SUR_UN_CAS. Un élément alldebrid_horiz_div, des références chrome-extension dans les styles et des classes wtd-font sont présents. Détection heuristique des injections ; pas de preuve que tous les éléments d'une classe similaire viennent d'une extension.

## STATE-001 — Disposition modifiée
Statut : VÉRIFIÉ_SUR_UN_CAS. metadata.extensionLayoutPresent=true ; ne pas considérer les parents/positions comme structure Amazon native.

## REVIEW-001 — Attributs d'avis
Statut : OBSERVÉ. data-hook reviewContainer, locale, langue source, identifiant d'avis, badge achat vérifié et vidéo apparaissent dans les extraits reçus. Pistes : résumé d'avis, avis vidéo, comparaison entre captures. Ne pas extrapoler à tous les produits.

## LAZY-001 — Emplacements différés
Statut : OBSERVÉ. Des cr-lazy-widget sont présents et certains sont vides. Bloc vide ne signifie pas fonctionnalité inexistante. À tester après défilement et interaction.

## READ-001 — Limite de restitution
Statut : VÉRIFIÉ_SUR_UN_CAS. Les fichiers de 900000 et 268468 octets sont récupérés par le connecteur mais leur restitution est tronquée. Nouveau plafond de 18000 octets à vérifier en usage réel.
