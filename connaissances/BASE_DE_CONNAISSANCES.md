# Base de connaissances

Statuts : OBSERVÉ, HYPOTHÈSE, VÉRIFIÉ_SUR_UN_CAS, VÉRIFIÉ_SUR_PLUSIEURS_CAS, CONTREDIT, OBSOLÈTE.
Toute entrée précise la date, la portée, la preuve et ce qui reste à tester. Les extraits partagés dans la conversation ne constituent pas encore une fixture versionnée.

## LOG-001 — Expéditeur et vendeur distincts
Statut : VÉRIFIÉ_SUR_UN_CAS.
Observation : la page B0DP8D9PQ6 présente « Expédié depuis Amazon » et « Vendu par Satawit » dans deux messages distincts.
Preuve : extrait HTML fourni par l'utilisateur le 2026-11-09 ; à remplacer/compléter par un chemin de capture filtrée du dépôt.
Conséquence : ne pas déduire le mode logistique du seul nom du vendeur ; normaliser le préfixe du message expéditeur.
À tester : autre catégorie, sélection d'offre, DOM masqué.

## LOG-002 — Message combiné
Statut : VÉRIFIÉ_SUR_UN_CAS.
Observation : pour B0789YFDNN, desktop-merchant-info contient « Expédié et vendu par Amazon » tandis que fulfillerInfoFeature_feature_div est vide.
Preuve : extrait HTML utilisateur du 2026-11-09, fixture du dépôt encore absente.
Conséquence : le message marchand peut fournir à lui seul vendeur ET expéditeur.
À tester : autres formulations et autres domaines Amazon.

## DOM-001 — Informations dupliquées
Statut : VÉRIFIÉ_SUR_UN_CAS.
Observation : une même information marchand existe dans le message et dans le popover préchargé ; sellerProfileTriggerId est dupliqué dans l'extrait B0DP8D9PQ6.
Preuve : HTML utilisateur du 2026-11-09.
Conséquence : ne pas utiliser le premier identifiant trouvé comme preuve de l'offre sélectionnée.
À tester : sélection par radios et cas où plusieurs groupes visibles subsistent.

## LAYOUT-001 — Variante dp-2col
Statut : OBSERVÉ.
Observation : les deux captures du rapport utilisateur grok.json portent des classes et parents différents pour les colonnes et le bloc d'achat. La session connectée observée utilise dp-2col.
Preuve : rapport utilisateur du 2026-11-09, non copié au dépôt car revue de confidentialité nécessaire.
Limite : la cause interne du choix de variante par Amazon n'est pas établie.

## Modèle de nouvelle entrée
Identifiant :
Statut :
Date :
Observation exacte :
Preuve versionnée :
Portée / contre-exemples :
Conséquence technique :
Tests à ajouter :
