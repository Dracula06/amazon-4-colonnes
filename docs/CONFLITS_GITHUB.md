# Erreurs intermittentes de publication — 0.6.1

## Diagnostic
L'erreur observée est HTTP 422 sur PATCH /git/refs/heads/main, dernière étape du transport. Un changement de main entre lecture et publication est une cause plausible, pas une certitude : la version précédente cachait la réponse serveur. 422 n'implique pas systématiquement un problème de permission. Nouveau message : statut, méthode, endpoint et message GitHub borné, sans jeton.

## Correction
Lecture réseau sans cache. Verrou Web Locks global par dépôt entre les pages de l'extension : captures de plusieurs onglets mises en file au moment de la publication. Ce verrou ne coordonne pas les autres navigateurs ou utilisateurs, d'où une reprise de conflit externe.

Après échec du PATCH : relire main. Si notre commit est déjà main, succès. Si notre commit est ancêtre du main courant, succès également. Sinon, uniquement si erreur 409/422 ET main différent du parent lu, reconstruire arbre et commit sur la dernière tête (trois essais maximum). Les mêmes chemins et contenus sont réutilisés. Aucune régénération de capture et aucun force:true.

Une erreur de validation sans mouvement de branche n'est pas répétée. Une coupure ambiguë n'est pas suivie aveuglément d'un second envoi. Des objets Git non référencés peuvent subsister si une tentative échoue avant le déplacement de main ; aucun fichier partiel ne paraît sur main.

## Tests
Cinq scénarios simulés exécutés avec Node : succès normal ; conflit 422 avec main déplacé ; 422 sans déplacement (pas de retry) ; réponse perdue après publication réussie ; réponse perdue avec commit déjà ancêtre de main. Vérification force:false. Pour relancer : node --experimental-default-type=module tests/publish-retry.test.mjs . Verrou navigateur, délais réels et GitHub en production non testés dans l'environnement de création.

## Utilisation
Mettre à jour le dépôt local, recharger l'extension, fermer les anciens onglets techniques de partage, recharger Amazon puis tester. Garder le jeton actuel si les autres envois réussissent ; ne pas le régénérer au seul motif d'un 422. Si l'erreur persiste, transmettre le nouveau message complet sans jeton. Une capture créée par l'ancienne version peut ne pas être publiée et doit être refaite seulement après vérification du dépôt.
