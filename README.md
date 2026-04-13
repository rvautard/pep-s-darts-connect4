# Soiree Jeux - Jeu Flechettes + Puissance 4

Prototype de jeu multi-joueurs jouable sur PC et mobile.

## Lancer en local

1. Ouvre le dossier dans VS Code.
2. Ouvre `index.html` dans ton navigateur pour accéder à l'écran d'accueil.

Option conseillee pour mobile:
- Lancer un petit serveur local (ex: extension Live Server) puis ouvrir l'URL depuis ton mobile sur le meme reseau.

## Architecture du jeu

- `index.html` : Ecran d'accueil et configuration des joueurs
- `game.html` : Ecran principal du jeu (grille 4x4)
- `app.js` : Logique de configuration des joueurs
- `game.js` : Logique de jeu (plateau, tours, détection de victoire)
- `styles.css` : Styles généraux
- `game-styles.css` : Styles spécifiques à l'écran de jeu
- `landing-illustration.svg` : Illustration d'accueil

## Mecaniques du jeu

### Plateau
- Grille de 4x4 cases
- Contient des chiffres de 1 à 20 et un "B"
- Disposition aléatoire à chaque partie

### Jouabilité
- Les joueurs jouent à tour de rôle
- Chaque joueur peut toucher une case jusqu'à 3 fois
- Le nombre de touches est affiché sur la case (cercles colorés par joueur)
- Après 3 touches, le joueur possède la case (badge numéroté dans le coin)

### Victoire
- Un joueur gagne s'il possède:
  - Une ligne entière (4 cases horizontales)
  - Une colonne entière (4 cases verticales)
  - Une diagonale entière (4 cases diagonales)
- La victoire est détectée automatiquement
- Un écran de victoire affiche le gagnant avec options pour rejouer ou retourner au menu

### Interface
- Barre latérale affichant l'état de chaque joueur
- Indicateur visuel du joueur en cours (surbrillance orange)
- Affichage du nombre de cases possédées par joueur
- Overlay de victoire avec animations
