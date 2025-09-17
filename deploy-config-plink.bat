@echo off
echo === Déploiement avec Plink (PuTTY) ===

set TOKEN=ghp_votre_token_ici
set SSH_USER=pi
set SSH_PASSWORD=votre_mot_de_passe_ssh
set BORNES=192.168.1.10 192.168.1.11 192.168.1.12

for %%B in (%BORNES%) do (
    echo.
    echo Configuration de %%B...

    REM Utilisation de Plink avec mot de passe
    plink -batch -pw "%SSH_PASSWORD%" %SSH_USER%@%%B "bash -c \"mkdir -p /etc && echo 'GITHUB_TOKEN=%TOKEN%' > /etc/ansible-pull.conf && chmod 600 /etc/ansible-pull.conf\""

    if %ERRORLEVEL% EQU 0 (
        echo   ✅ Configuration réussie sur %%B

        REM Test du token avec Plink
        plink -batch -pw "%SSH_PASSWORD%" %SSH_USER%@%%B "bash -c \"source /etc/ansible-pull.conf && git ls-remote 'https://igolus:$GITHUB_TOKEN@github.com/igolus/rocketKioskPi.git'\"" >nul 2>&1

        if %ERRORLEVEL% EQU 0 (
            echo   ✅ Token validé sur %%B
        ) else (
            echo   ⚠️ Token configuré mais validation échouée sur %%B
        )
    ) else (
        echo   ❌ Échec de la configuration sur %%B
    )
)

echo.
echo 🎉 Déploiement terminé !
echo 💡 Téléchargez Plink depuis: https://www.chiark.greenend.org.uk/~sgtatham/putty/latest.html
pause