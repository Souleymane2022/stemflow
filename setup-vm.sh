#!/bin/bash

# Script d'installation automatique pour la VM Google Cloud (Ubuntu/Debian)
# Il installe Docker, clone l'application (ou la récupère) et lance le docker-compose.

echo "Mise à jour du système..."
sudo apt-get update && sudo apt-get upgrade -y

echo "Installation de Docker et Docker Compose..."
sudo apt-get install -y apt-transport-https ca-certificates curl software-properties-common
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Permettre à l'utilisateur actuel d'exécuter docker sans sudo
sudo usermod -aG docker $USER

echo "Installation terminée avec succès."
echo "Pour déployer, transférez vos fichiers (Dockerfile, docker-compose.yml, package.json, src, etc.) dans un dossier ici"
echo "Puis exécutez: docker compose up -d --build"
