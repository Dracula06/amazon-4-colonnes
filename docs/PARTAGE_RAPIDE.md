# Partage rapide — 0.5.0

## Parcours
Configuration une fois depuis clic droit icône > Options : jeton à permissions fines limité au dépôt, Contents Read and write, consentement au partage filtré sans aperçu. Jeton stocké dans chrome.storage.local (pas sync), accessible aux contextes de confiance de l'extension ; stockage non chiffré par l'extension. Effacement depuis les réglages.

Ensuite, un clic normal sur l'icône sur une page Amazon FR ES IT UK DE : DOM global capturé, copie filtrée préparée, nouveau fichier publié dans la bibliothèque. Badge … puis OK, ou ! en cas d'erreur. Une page technique inactive réalise l'opération et se ferme après succès. En cas d'erreur ou de configuration absente, elle devient visible. Ne pas la fermer pendant un envoi.

Le brut n'est pas téléchargé ni publié par ce parcours. Le collecteur manuel reste accessible dans les outils avancés. Les modules capture, nettoyage et transport existants sont réutilisés ; pas de nouvelle logique métier dans le contrôleur.

Le consentement porte sur chaque clic de partage, jamais sur la navigation. Aucun envoi automatique à chaque page visitée. Le filtre reste heuristique et ne garantit pas l'anonymisation. Ne pas capturer compte, paiement ou commandes. Le jeton ne quitte l'extension que dans l'en-tête d'authentification vers api.github.com.

Après une publication, le dépôt local est en retard : utiliser le BAT de mise à jour avant d'autres commits. Le partage ajoute des fichiers uniques ; des clics distincts peuvent créer plusieurs captures similaires. Un verrou par onglet empêche les partages simultanés pendant une opération.

Validation : non exécuté dans Chrome/Brave lors de la création. Les cinq marketplaces, droits activeTab lors de l'ouverture d'un onglet technique, permissions GitHub et erreurs réseau sont à tester. En cas d'erreur ambiguë, regarder le dépôt avant un nouveau clic. L'ancien amazon.js n'est pas refondu et ses badges restent sur FR.
