@echo off

REM === Liste des dossiers a traiter ===
REM set DIRS=C:\kioskReactor\logs C:\tools\SafiKioskExe\logs
set DIRS=C:\kioskReactor\logs C:\kioskReactor\scriptUtil

REM === Boucle sur chaque dossier ===
for %%D in (%DIRS%) do (
    echo ==================================================
    echo Dossier: %%D
    echo --- AVANT ---
    icacls "%%D"
    echo.

    REM Take ownership
    takeown /F "%%D" /R /A

    REM Reset ACL
    icacls "%%D" /reset /T /C

    REM Apply clean rights
	icacls "%%D" /grant:r "BUILTIN\Administrateurs":"(OI)(CI)(F)"
	icacls "%%D" /grant:r "BUILTIN\Utilisateurs":"(OI)(CI)(RX)"
	icacls "%%D" /grant:r "NT AUTHORITY\SYSTEM":"(OI)(CI)(F)"
	icacls "%%D" /grant:r *S-1-5-11:"(OI)(CI)(M)"
	icacls "%%D" /grant:r "%COMPUTERNAME%\logicsante":"(OI)(CI)(F)"
	icacls "%%D" /grant:r "%COMPUTERNAME%\kioskUser":"(OI)(CI)(F)"
	icacls "%%D" /grant:r "Tout le monde":"(OI)(CI)(M)"


    REM Remove inheritance
    icacls "%%D" /inheritance:r

    REM Remove strange entries
	icacls "%%D" /remove:g "NULL SID" "CREATEUR PROPRIETAIRE" "GROUPE CREATEUR" "%COMPUTERNAME%\Aucun"

    echo.
    echo --- APRES ---
    icacls "%%D"
)

echo.
