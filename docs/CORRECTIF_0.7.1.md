# Régression createTreeWalker — 0.7.1

La version 0.7.0 appelle root.ownerDocument.createTreeWalker alors que la racine passée par cleanDoc est un Document. Le ownerDocument de ce Document est null, d'où l'échec avant publication GitHub. Ce n'est pas une erreur de jeton.

Le helper documentFor(root) retourne root pour nodeType=9 et root.ownerDocument pour les autres noeuds. Il vérifie createTreeWalker et refuse une racine invalide. Les deux parcours commentaires/textes et la branche de limitation de profondeur utilisent le bon document. Aucun fallback qui enverrait le HTML non nettoyé.

Six assertions du helper exécutées avec Node sur des objets simulant Document, Element, DocumentFragment et les racines invalides. Ce test ne remplace pas une exécution du DOM réel. Les tests complets tests/privacy-dom.html restent disponibles pour un essai depuis l'origine de l'extension ; non exécutés dans le navigateur de l'utilisateur par l'assistant.

Après mise à jour via BAT : recharger l'extension en 0.7.1, fermer les anciens onglets techniques de partage, recharger Amazon et retester. Jeton, permissions, parcours un clic et anciennes captures inchangés.
