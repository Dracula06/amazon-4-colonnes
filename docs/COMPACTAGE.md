# Compactage et budget de fichiers — 0.5.1

Capture complète en mémoire → filtrage de confidentialité existant → compactCapture → packageCapture → publication Git atomique. L'interface un clic reste identique. Les exports locaux du collecteur manuel restent inchangés : la réduction s'applique à l'envoi GitHub.

## Responsabilités
compact.js : transformation DOM de la copie filtrée et journal de pertes. package.js : mesure UTF-8 sur la chaîne JSON réellement enregistrée, découpage réversible si nécessaire. git-transport.js : arbre Git, commit puis mise à jour main sans force. github.js : orchestration de ces modules et nommage de capture.

## Retraits
Corps CSS et scripts remplacés par marqueurs et inventoriés ; commentaires, identifiants d'instance data-csa-c-id et attributs déjà vidés par le filtre retirés. Géométrie SVG omise, titres/descriptions conservés. Espaces de formatage réduits hors pre/code/textarea. Textes métier, blocs inconnus, éléments masqués, classes et autres attributs conservés. Styles inline d'éléments conservés. Ce n'est pas une sauvegarde visuelle fidèle : l'absence de CSS limite l'étude des mises en page. Le compactage n'est pas un filtre de confidentialité supplémentaire.

## Taille
900000 octets maximum par fichier enregistré, enveloppe JSON comprise, pas la taille Base64 de transport. JSON sans indentation. Si le rapport tient : capture.json. Sinon : part-0001.json etc. et index.json. Concaténer les champs data des parties dans l'ordre de l'index puis JSON.parse pour retrouver exactement le rapport compacté. Une partie n'est pas nécessairement un HTML autonome. Pas de suppression des blocs pour atteindre la limite. Rapport global limité à 8 Mio pour éviter un envoi démesuré.

## Publication
Toutes les parties apparaissent dans un seul commit. Le pointeur main est avancé sans force. Si main change pendant l'envoi, GitHub peut refuser : aucun écrasement automatique, et des objets Git non référencés peuvent subsister. Pas de reprise automatique ambiguë.

## Anciennes captures
Aucun fichier ancien migré, supprimé ni écrasé. Le correctif s'applique aux prochains envois. Une migration des trois premières pages demande un chantier distinct.

## Tests
Trois scénarios de packageCapture exécutés avec Node : petit rapport, dépassement ASCII, texte Unicode avec échappements. Vérification du plafond et de la reconstitution exacte. Exécution depuis le dépôt avec une version récente de Node prenant en charge la détection des modules : node --experimental-default-type=module tests/package.test.mjs . Le compacteur DOM et les appels réseau GitHub ne sont pas testés dans un navigateur réel lors de la création. Les résultats Python des essais précédents ne sont pas une mesure garantie de ce compacteur JavaScript : le découpage assure le plafond si les tailles diffèrent.
