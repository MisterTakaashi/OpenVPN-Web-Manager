# OpenVPN Web Manager
OpenVPN Web Manager est une interface web permettant à votre utilisateurs de gérer leur compte VPN, ainsi qu'à vous de générer leur clé.

### Fonctionnement

OVPN Web Manager fonctionne sur la base de comptes utilisateurs. Ces comptes sont représentés par des dossiers présents dans le dossier `/static/members`, ils contiennent un fichier user.yml récapitulant les informations de l'utilisateur, ainsi que son mot de passe chiffré (SHA-256). Le dossier keys contenu dans ce dossier est de loin le plus important puisqu'il stocke les clés nescessaires au client OVPN pour se connecter au serveur. En cas de corruption de ce dossier, **il est nescessaire de regénérer les clés de l'utilisateur**

Il existe deux types de comptes utilisateur:
- Basique
  - Aucun accès au VPN
- Premium
  - Accès au VPN
  - Récupération des clés possible
  - Demande de régénération des clés possible

### Administration

L'interface d'administration _(Accessible par l'url /admin/ et seulement pour le compte défini dans le server.js)_ permet de gérer les clés des utilisateurs OVPN ainsi que d'avoir une vision sur le serveur en direct. Les utilisateurs, leur IP réelle et virtuelle, le nombre de byte transférés, ou encore leur heure de connexion y est notifiée en direct.

Il est possible par cette interface d'administration de rajouter un mois de premium a un compte afin de lui octroyer l'accès au VPN
