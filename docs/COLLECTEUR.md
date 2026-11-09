# Collecteur 0.4.0

## Modules
src/library/capture.js : capture DOM global et contexte, sans sélection de blocs métier.
src/library/sanitize.js : copie filtrée, journal des pertes.
src/library/export.js : téléchargement local.
src/library/github.js : transport GitHub vers un dépôt fixe.
src/library/controller.js : orchestration UI uniquement.
src/library/launcher.js : ouverture de l'outil depuis le popup.

## Utilisation
Recharger l'extension et les onglets Amazon après mise à jour. Ouvrir le popup sur Amazon.fr puis Bibliothèque. Capturer. Exporter le brut local hors du dépôt si souhaité. Préparer la copie filtrée, relire le JSON et l'éditer si nécessaire. Entrer un jeton GitHub à permissions fines limité au dépôt Dracula06/amazon-4-colonnes, Contents : Read and write. Cocher l'autorisation et confirmer l'envoi. La permission api.github.com est demandée uniquement à ce stade. Le jeton reste dans la page, pas dans le stockage Chrome. Fermer la page pour effacer sa mémoire.

## Archives
Une capture GitHub = un JSON contenant DOM HTML, métadonnées, inventaire de ressources, diagnostic et journal du nettoyage. Chemin bibliotheque-pages/ASIN/date-uuid.json ; jamais d'écrasement volontaire. Pas de publication du brut par l'outil. Après un envoi, synchroniser le dépôt local avec le BAT avant un nouveau travail Git.

## Limites explicites
Capture du DOM courant uniquement. HTML initial, contenu des ressources externes, shadow roots, frames internes et pixels canvas non collectés. Les éléments masqués ordinaires restent dans le DOM. Le brut peut être volumineux et contenir des secrets ; conserver hors Git. La copie filtrée garde les structures inconnues autant que possible mais retire les scripts intégrés et certaines valeurs structurées. Filtre heuristique : relire texte libre, notes et attributs avant envoi. Aucune garantie d'anonymisation. Le bouton n'envoie rien sans deux étapes de consentement. Un upload > 8 Mio est refusé. En cas d'échec réseau, vérifier le dépôt avant de recommencer, car un commit peut avoir réussi sans réponse reçue.

Le JSON diagnostic embarqué conserve uniquement les codes logistiques et l'état, pas les textes sources libres. L'aperçu est du texte, jamais du HTML exécuté. Les captures ne sont pas des pages autonomes fidèles et fonctionnelles.

## Dette et validation
La modularisation complète de l'ancien amazon.js n'est pas incluse. Ajouter des tests de fixtures et valider dans Chrome/Brave avant de considérer cette fonction stable. Cette première version n'a pas été exécutée dans un navigateur réel.
