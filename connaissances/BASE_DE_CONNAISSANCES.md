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

## LOG-003 — Variations multilingues (UK, DE, ES, IT)
Statut : VÉRIFIÉ_SUR_PLUSIEURS_CAS.
Date : 2026-11-10.
Observation : Les fiches anglaises, allemandes, espagnoles et italiennes utilisent des formules structurées équivalentes aux messages français (« Dispatched from and sold by », « Versand durch und Verkauf durch », « Enviado y vendido por », « Spedito e venduto da »).
Preuve : Tests unitaires synthétiques `tests/i18n-core.test.mjs` vérifiant l'extraction des couples expéditeur/vendeur et la classification AMAZON, FBA et FBM.
Conséquence : `core.js` normalise désormais les préfixes multilingues et `amazon.js` s'exécute sur l'ensemble des marketplaces européennes.

## LAYOUT-002 — Seuil d'affichage et écrans 1080p
Statut : VÉRIFIÉ_SUR_PLUSIEURS_CAS.
Date : 2026-11-10.
Observation : Les résolutions 1920x1080 sous Windows avec mise à l'échelle courante (125 %) disposent d'un `innerWidth` utile d'environ 1536 px. Le seuil historique de 1550 px désactivait silencieusement la disposition 4 colonnes.
Conséquence : Abaissement du seuil par défaut à 1200 px et seuil configurable dans les options. Colonnes rendues fluides via `minmax(220px, 260px)`.

## COMP-001 — Isolation des blocs publicitaires et recommandations
Statut : VÉRIFIÉ_SUR_PLUSIEURS_CAS.
Date : 2026-11-10.
Observation : Les blocs de sponsorisation (`#sp_detail`, `.ape-placement`, `[data-component-type="sp-sponsored-result"]`) et carrousels de suggestions (`#sims-consolidated-2_feature_div`) sont extérieurs au conteneur principal `#ppd` ou injectés en bas de fiche. Leur masquage via `display: none !important` n'altère ni la grille d'achat ni le flux `#productTitle`.
Preuve : Registre déclaratif `src/display/components-registry.js` et validation unitaire `tests/components-registry.test.mjs`.

## COMP-002 — Masquage de la section avis clients et ancre d'accès rapide
Statut : VÉRIFIÉ_SUR_PLUSIEURS_CAS.
Date : 2026-11-10.
Observation : Le compteur d'avis à côté du titre (`#acrCustomerReviewLink`) pointe vers `#averageCustomerReviewsAnchor` (situé dans `#reviewsMedley` à l'intérieur de `#customerReviews`), le lien du popover (`#acrPopoverLink`) pointe vers `#customerReviews`, et les liens PQV / sous-navigation (`#pqv-reviews`, `.btfSubNavDesktopCustomerReviewsTab`) ciblent `#customer-reviews_feature_div` / `#customerReviews`. Lorsque `#customerReviews` est masqué en `display: none !important`, le clic sur ces liens reste sans effet.
Preuve : Captures réelles versionnées FR (`B0GCN57MGK` commit `faa9cc5`, `B00FRM3YQS`, `B0DW4FVCCL`, `B0F6CP4SM5`, `B01MTLEKNA`, `B09KR33VN3`, `B0HFZH1Z9G`) et ES (`B07SLY4NMK`, `B0GS1TW9G5`), ainsi que les tests unitaires `tests/reviews-visibility.test.mjs`.
Conséquence : Interception en phase de capture des déclencheurs d'avis dans `src/display/reviews-visibility.js` pour lever temporairement le masquage, faire défiler vers l'ancre cible et proposer un bouton discret « Masquer à nouveau » dans `#customerReviews`.
Limite : `#acrPopover` (clic sur les étoiles) conserve son comportement d'ouverture du mini-popover sans saut automatique ; la révélation s'effectue via `#acrCustomerReviewLink` ou `#acrPopoverLink`.

## LOG-004 — Boîte d'achat d'occasion (UBB) et lien d'expédition SSOF
Statut : VÉRIFIÉ_SUR_UN_CAS.
Date : 2026-11-10.
Observation : Sur la fiche FR B0DW4FVCCL vendue exclusivement d'occasion, le conteneur est `#usedOnlyBuybox` / `#usedBuySection`. Le vendeur est dans `#sellerProfileTriggerId data-is-ubb="true"` (Amazon Seconde main) et l'expéditeur est sous forme de lien d'aide `#SSOFpopoverLink_ubb` (« expédié par Amazon »). Le prix principal d'occasion est dans `.offer-price`.
Preuve : Capture réelle versionnée FR B0DW4FVCCL (commit 34afb50).
Conséquence : Cibler `[id*="SSOFpopoverLink"]` pour l'expéditeur, `#usedBuySection .offer-price` pour le prix complet, rattacher le badge prioritairement à la boîte d'achat active plutôt qu'à la 4ème colonne, et déduire Amazon expéditeur lorsque le vendeur est Amazon Seconde main / Warehouse.

## SHIP-001 — Offre non livrable vers l’adresse sélectionnée (LOCK pays)
Statut : VÉRIFIÉ_SUR_UN_CAS.
Date : 2026-11-11.
Observation : Sur la fiche UK B0CM6K7FHQ (`https://www.amazon.co.uk/dp/B0CM6K7FHQ`), l’offre d’occasion `#usedOnlyBuybox` (Amazon Resale, Fulfilled by Amazon, `EUR 22.98`) n’affiche aucun bouton d’ajout au panier ni d’achat immédiat (`.a-button-stack` vide) et présente dans `#a-popover-content-2` le message `<span class="a-color-error"> This item cannot be shipped to your selected delivery location. Please choose a different delivery location. </span>` (tandis que `#deliveryBlockMessage` et `#contextualIngressPtLink` sont remplacés par `[RETIRE]` lors du nettoyage DOM).
Preuve : Capture réelle versionnée UK B0CM6K7FHQ (`bibliotheque-pages/UK/B0CM6K7FHQ/2026-11-11T18-14-07-025Z-958c25b6-80db-496f-98b6-9d22d21f1d95`, commit `81f4f07`), et validation unitaire `tests/shipping-lock.test.mjs`.
Conséquence : Ajout du module `src/display/shipping-lock.js` (`ALShippingLock`) pour détecter le blocage de livraison (zones livraison/buybox ou popover en l’absence de bouton d’achat) et afficher une alerte « LOCK pays » dans `#al-badge`, la popup et l’embed Discord.
Limite : Seule la formulation anglaise UK est prouvée par une capture réelle versionnée ; les variantes FR/DE/ES/IT et les pages avec message directement dans `#deliveryBlockMessage` (avant nettoyage) restent à confirmer sur captures réelles dédiées.

## AFF-001 — Barre Amazon Partenaires (SiteStripe) et génération de lien rapide
Statut : VÉRIFIÉ_SUR_PLUSIEURS_CAS.
Date : 2026-11-11.
Observation : Sur les captures UK B0CM6K7FHQ (`https://www.amazon.co.uk/dp/B0CM6K7FHQ`) et ES B07SLY4NMK / B0GS1TW9G5, le bandeau SiteStripe est injecté dans `#nav-AssociateStripe` > `#amzn-ss-wrap`. Il expose directement la catégorie (`#amzn-ss-category-content` : `Computers`, `Office Products`, `Home`), le taux de commission (`#amzn-ss-commission-rate-content` : `3.00%`, `5.00%`), le lien portail (`a.amzn-ss-link-home-page`), le bouton déclencheur `#amzn-ss-get-link-button` (dans `#amzn-ss-text-link`), ainsi que la structure préchargée `#a-popover-amzn-ss-popover-text-preload-content` contenant les sélecteurs Store ID / Tracking ID (`#amzn-ss-store-id-dropdown-text`, `#amzn-ss-tracking-id-dropdown-text` et `.a-dropdown-prompt`), les boutons radio `Short Link` / `Full Link` (`#amzn-ss-short-link-radio-button`, `#amzn-ss-full-link-radio-button`) et le bouton de copie `#amzn-ss-copy-affiliate-link-btn-announce`.
Preuve : Captures réelles versionnées `UK/B0CM6K7FHQ` (commit `81f4f07`), `ES/B07SLY4NMK` (`1b47b10`), `ES/B0GS1TW9G5` (`b1365f4` / dossier `bibliotheque-pages/ES/B0GS1TW9G5`), et validation unitaire `tests/affiliate-link.test.mjs`.
Conséquence : Ajout des modules `src/display/affiliate-link.js` (`ALAffiliate`) et `src/display/quick-frame.js` (`ALQuickFrame`) pour afficher un cadre flottant dès la navigation sur les 5 pays définis (`FR`, `UK`, `DE`, `ES`, `IT`), lire le tag Partenaires ou utiliser un tag enregistré localement par pays, générer un lien affilié complet propre (`?tag=...`) et déclencher le flux SiteStripe `Short Link` lorsque `#nav-AssociateStripe` est présent.
Limite : La génération d'un lien court `amzn.to` dépend exclusivement du JS et de la session Amazon Partenaires en cours d'exécution ; seuls les DOM UK et ES ont été observés avec `#nav-AssociateStripe`, les libellés FR/DE/IT restent à confirmer sur captures dédiées.

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
