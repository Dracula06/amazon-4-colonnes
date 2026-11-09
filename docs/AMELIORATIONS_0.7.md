# Améliorations issues des captures FR — 0.7.0

## Confidentialité
structured-data.js nettoie récursivement les objets JSON contenus dans les attributs, pas seulement data-*. sanitize-dom.js traite meta/content, templates imbriqués, HTML encodé de champs htmlContentEncoded, scripts, attributs de livraison du lien parent contextualIngressPtLink et classes address-*. Les attributs URL incluant pixel-url et data-click-addr sont normalisés. Les clés de tracking et offerListingId sont masquées ; les valeurs métier comme ASIN et prix peuvent être conservées. Les scripts encodés sont nettoyés après décodage limité ; aucun script capturé n'est exécuté.

Ce filtre reste heuristique. Valeurs non reconnues, adresses libres ou données encodées sous des noms inconnus peuvent subsister. Limites de profondeur et de longueur signalées dans le journal ; aucune garantie d'anonymisation parfaite. Le brut local reste potentiellement sensible.

## Analyse contextualisée
product-context.js cherche des candidats dans les blocs de prix du produit principal et dans les groupes marchands du ppd, en excluant les emplacements publicitaires reconnus et les ASIN explicitement différents. Il ne parcourt pas les objets publicitaires pour inventer un prix principal. Les signaux Global Store et les montants de financement sont inventoriés séparément. Chaque candidat précise source, masquage explicite et limites ; aucune certification de sélection active, disponibilité ou éligibilité.

Le résumé analysis.product est incorporé aux prochaines captures, pas affiché comme de nouveaux badges sur la page. Les exemples sont bornés pour garder un index lisible ; si l'index excède le plafond, package.js conserve le résumé dans le payload plutôt que dans l'index. Les blocs inconnus et lecteurs vidéo restent présents pour nos futures découvertes.

## Validation
10 assertions du module de structures imbriquées exécutées avec Node : maintien de l'ASIN/prix, retrait de clés sensibles, URL nettoyée et callback de HTML imbriqué. Tests synthétiques DOM renforcés dans tests/privacy-dom.html, non exécutés dans Chrome/Brave ici. Ils ciblent meta, template.content, iframe.name JSON et HTML encodé, aria-label personnel, classes d'adresse et prix structuré. Recommandation : vérifier ce test navigateur avant de considérer le filtre validé sur de nouvelles pages.

## Utilisation et limites
Mettre à jour via BAT, recharger l'extension en 0.7.0, fermer les anciens onglets de partage, recharger Amazon puis capturer. Jeton inchangé. Les reprises GitHub 0.6.1 et le plafond de 18000 octets sont conservés. Aucune capture ancienne modifiée, supprimée ou purgée de l'historique.

Le chantier ne refond pas encore l'ancien amazon.js ni l'accès des content scripts aux préférences publiques quand storage est restreint. Les badges restent limités à FR. Le DOM analysé peut inclure les modifications d'autres extensions ; les signaux d'injection ne sont pas une preuve complète d'origine.
