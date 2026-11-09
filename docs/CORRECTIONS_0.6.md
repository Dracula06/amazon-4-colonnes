# Correction du collecteur — 0.6.0

## Changements
Politique de confidentialité séparée, traitement relationnel des meta name/content, retrait des identifiants raw-id et hashed-id, nettoyage d'emails et formats de jetons GitHub dans le texte, suppression des commentaires, normalisation des URL, blocage de routes personnelles connues. Une meta dont le nom a déjà été masqué voit aussi son content masqué. Les descriptions publiques sont conservées. Les scripts ne sont jamais exécutés. Les valeurs vivantes de formulaires ne sont plus collectées séparément ; le brut local reste potentiellement sensible car c'est le DOM complet.

Le nettoyage est appliqué à nouveau juste avant publication, y compris dans le collecteur manuel, afin qu'un aperçu modifié ne contourne pas le filtre. Il est heuristique : noms, adresses ou valeurs non reconnues peuvent subsister. Les routes personnelles inconnues peuvent échapper au blocage. Pas de promesse de confidentialité absolue.

Le module discovery.js produit un résumé avec compteurs, exemples de composants et injections suspectes. Les éléments masqués sont repérés par attributs/classes/styles explicites, pas par visibilité calculée. Aucun composant inconnu ou lecteur vidéo n'est supprimé sur cette base. Les détails restent dans le DOM compacté. La capture précise si notre disposition était active ; ce n'est pas une reconstruction du DOM Amazon original.

Fragments limités à 18000 octets JSON UTF-8 pour réduire aussi la troncature des réponses des outils. Cela ne garantit pas que tout outil affichera toute réponse, mais les morceaux peuvent être lus individuellement. Index avec résumé et liste complète. Découpage réversible, aucun tronquage du payload. Si l'index lui-même dépasse le plafond, le résumé est retiré de l'index uniquement (il reste dans le payload). Les styles externes et scripts ne sont pas téléchargés.

## Tests
17 scénarios purs package/politique exécutés avec Node dans l'environnement de création : plafond, reconstitution Unicode/échappements, cinq marketplaces, routes personnelles, URL et emails. Pour relancer : node --experimental-default-type=module tests/privacy-package.test.mjs . Tests DOM synthétiques fournis dans tests/privacy-dom.html et privacy-dom.js, à ouvrir depuis l'origine de l'extension ; ils n'ont pas été exécutés dans un vrai navigateur ici. Publication réseau et parcours un clic à tester dans Chrome/Brave.

## Reste à vérifier
Le storage local du jeton a été restreint aux TRUSTED_CONTEXTS par la version précédente ; l'ancien amazon.js lit encore ce stockage depuis le content script. Vérifier ce conflit puis séparer l'accès aux préférences publiques via messagerie avant de considérer le chantier historique terminé. L'ancien monolithe de disposition/badges n'est pas refondu par ce commit. Les badges hors FR restent non validés.

## Archives déjà publiées
Aucune suppression ni réécriture historique par ce correctif. La capture B0HFZH1Z9G précédente peut contenir des identifiants et meta opaques résiduels. Elle ne doit pas être considérée comme anonymisée. Supprimer un fichier de main ne retire pas son historique Git. Une purge d'historique est un chantier distinct nécessitant accord explicite.
