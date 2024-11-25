# **AthlAtlas - Backend**

## **Description**
Le back-end de l'application **AthlAtlas** est conçu pour gérer les événements sportifs et les inscriptions. Développé avec **NestJS** et **MongoDB**, il offre une API REST sécurisée et performante pour les organisateurs et les participants.

---

## **Caractéristiques principales**
- Gestion des événements sportifs : création, modification et suppression.
- Gestion des inscriptions : ajout, mise à jour et consultation des participants.
- Authentification et autorisation sécurisées avec JWT.
- Protection des routes sensibles par rôle (organisateur et participant).
- Génération de rapports (PDF/Excel) pour les inscriptions.
- Gestion des erreurs centralisée avec des middlewares.
- Tests unitaires pour chaque contrôleur.

---

## **Installation**

### **1. Prérequis**
Assurez-vous d’avoir installé les outils suivants :
- **Node.js** (version ≥ 16.x)
- **MongoDB** (local ou cloud, ex : MongoDB Atlas)
- **Docker** (optionnel, pour la conteneurisation)

### **2. Cloner le projet**
```bash
git clone https://github.com/e-lglioui/AthlAtlas.git
cd athlatlas
```
### * 3 Installer les dépendances**
```bash
npm install
```
### * Configurer les variables d’environnement**
PORT=3000
MONGO_URI=mongodb://localhost:27017/athlatlas
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=24h

### * Configurer les variables d’environnement**
```bash
npm run start:dev
```
### *Tester l'application**
```bash
npm run test
```
