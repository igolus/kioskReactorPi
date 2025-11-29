# checkpoint

Crée un commit git avec un message automatique basé sur les changements détectés.

## Utilisation

```
/checkpoint [message optionnel]
```

## Arguments

- `message` (optionnel) : Message de commit personnalisé. Si non fourni, un message sera généré automatiquement

## Description

Cette commande :
1. Analyse les fichiers modifiés et ajoutés
2. Génère un message de commit descriptif basé sur les changements
3. Ajoute tous les fichiers modifiés au staging
4. Crée un commit avec le message généré ou fourni
5. Affiche un résumé des changements committés

## Exemples

```bash
# Commit automatique avec message généré
/checkpoint

# Commit avec message personnalisé
/checkpoint "Fix authentication bug in login component"

# Commit de travail en cours
/checkpoint "WIP: implementing new dashboard features"
```

## Génération automatique de message

Le message automatique suit cette logique :
- **Ajout de fichiers** : "Add [type]: [description]"
- **Modification de fichiers** : "Update [type]: [description]"
- **Suppression de fichiers** : "Remove [type]: [description]"
- **Changements mixtes** : "Update project: [summary]"

Types détectés :
- `components` pour les fichiers React (.jsx, .tsx)
- `styles` pour les fichiers CSS/SCSS
- `config` pour les fichiers de configuration
- `docs` pour les fichiers markdown
- `tests` pour les fichiers de test

## Notes

- Vérifie automatiquement s'il y a des changements à committer
- Ajoute automatiquement la signature Claude Code
- Ne push pas automatiquement - utiliser `/push` si nécessaire
- Ignore les fichiers dans .gitignore