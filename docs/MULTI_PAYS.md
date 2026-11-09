# Multi-pays — 0.4.1

Objectif du projet : Amazon FR, ES, IT, UK et DE pour la bibliothèque puis les fonctions métier.
Le module src/library/marketplaces.js centralise les cinq domaines autorisés. Le collecteur accepte www.amazon.fr, www.amazon.es, www.amazon.it, www.amazon.co.uk et www.amazon.de (ainsi que les domaines racine HTTPS correspondants) via activeTab à la demande. Aucun accès permanent à tous les onglets n'est ajouté.

La bibliothèque GitHub classe désormais les captures dans bibliotheque-pages/PAYS/ASIN/date-uuid.json. Les captures anciennes ne sont pas déplacées. Le brut local contient marketplace, hostname et langue HTML. La copie filtrée conserve l'URL de domaine et le transport GitHub ajoute marketplace et hostname avant l'envoi.

Attention : cette mise à jour ouvre la COLLECTE aux cinq sites. Les scripts automatiques historiques de disposition et badges restent sur www.amazon.fr seulement. Le parseur FR ne constitue pas une validation des termes allemand, espagnol, italien et anglais. Le diagnostic peut donc être indisponible hors FR, sans empêcher la capture.

À vérifier : capture réelle Chrome/Brave pour chaque pays, phrases vendeur/expéditeur et offres sélectionnées, différence entre langue affichée et marketplace, données personnelles résiduelles dans chaque locale. Aucun test réel des cinq sites n'a été exécuté dans l'environnement de création.

Après mise à jour via le BAT : recharger l'extension, puis fermer/rouvrir sa fenêtre et les anciennes pages du collecteur. Utiliser le nouveau bouton sur la page du pays souhaité.
