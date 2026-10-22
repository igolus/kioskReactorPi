#!/bin/bash
#
# cleanTemp.sh — nettoyage du dossier temporaire du compte de session de la
# borne (%LOCALAPPDATA%\Temp, soit C:\Users\<compte>\AppData\Local\Temp) et du
# cache des mises a jour Electron (%LOCALAPPDATA%\<app>-updater\pending).
#
# POURQUOI : les programmes de la borne y laissent des restes a chaque
# lancement et ne les effacent jamais (constate le 2026-10-22, des centaines
# d'entrees) :
#   - `_MEIxxxxx\`        : dossiers d'extraction PyInstaller (CPSReader.exe,
#                           services Python) — un par lancement, jamais purges
#                           quand le programme est tue (kill, coupure) ;
#   - `*.tmp.node`        : modules natifs (.node) qu'Electron extrait de son
#                           app.asar dans Temp pour les charger (Agent-mt...) ;
#   - `wctXXXX.tmp`, `*.tmp`, `nsbXXXX.tmp`, `compileCache_*` : restes des
#                           installeurs NSIS et de Chrome/Electron ;
#   - `<app>-updater\pending\` : installeur telecharge par electron-updater,
#                           garde apres application de la mise a jour.
# Le disque de la borne finit par se remplir et les lancements ralentissent.
#
# QUAND : appele par launchSystemWin.sh AU DEBUT du lancement, sous le compte
# de session (c'est SON Temp). Ne supprime que ce qui a plus de
# TEMP_MIN_AGE_MINUTES (defaut 60). Les dossiers `_MEI*` et les `*.tmp.node`
# ont une regle de plus : ils ne sont supprimes que s'ils sont ANTERIEURS AU
# DERNIER BOOT. Un `_MEI` appartient a un processus de la session
# (CPSReader.exe, services Python) et son mtime est sa date de lancement : a
# une relance du lanceur SANS reboot, apres plus d'une heure, l'age seul aurait
# vide le dossier d'un service encore actif (fichiers non verrouilles : imports
# paresseux, ressources) et tue le lecteur de carte jusqu'au reboot. Meme
# chose pour un `*.tmp.node` : c'est le module natif qu'une app Electron en
# cours (Agent-mt) a extrait de son app.asar au demarrage — le lui retirer
# sous les pieds donne une « JavaScript error » au prochain require ou au
# redemarrage du service (constate le 2026-10-22). Apres un reboot, plus aucun
# processus ne peut utiliser un `_MEI` ou un `.tmp.node` d'avant le boot.
# Date de boot : /proc/uptime (cygwin) ; inconnue ⇒ aucun des deux n'est touche.
# Utilisable aussi a la main :
#
#   bash cleanTemp.sh                 # nettoie, > 60 min
#   bash cleanTemp.sh --dry-run       # montre ce qui serait supprime
#   bash cleanTemp.sh --minutes 1440  # autre age minimal
#   TEMP_MIN_AGE_MINUTES=10 bash cleanTemp.sh
#
# ROBUSTESSE — memes regles que purgeLogs.sh, ce script ne doit JAMAIS :
#   - SORTIR SUR UNE ERREUR : pas de `set -e`/`set -u`, chaque entree est
#     traitee a part, un echec est journalise puis ignore, code de sortie 0 ;
#   - BLOQUER le lanceur : il se relance lui-meme sous `timeout`
#     (CLEAN_TEMP_MAX_SECONDS, 120 s) ; au-dela il est tue et le lancement
#     continue — le nettoyage n'est jamais plus important que la borne ;
#   - nettoyer un autre dossier que Temp : le chemin est resolu puis verifie
#     (doit se terminer par AppData/Local/Temp), vide ou inexistant = refus ;
#     le cache updater doit se terminer par -updater/pending ;
#   - toucher un fichier en cours d'utilisation : age minimal, et `rm` d'un
#     fichier ouvert echoue sous Windows sans consequence ;
#   - tourner deux fois en meme temps (verrou par mkdir, obsolete apres 10 min).
#
# NEUTRE VIS-A-VIS DES ACL : aucun chmod (cf. purgeLogs.sh).

set +e
set +u

MIN_AGE_MINUTES="${TEMP_MIN_AGE_MINUTES:-60}"
MAX_SECONDS="${CLEAN_TEMP_MAX_SECONDS:-120}"
LOCK_STALE_MINUTES=10
DRY_RUN=0
VERBOSE=0

log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - cleanTemp: $*"
}

# --- Duree bornee ---------------------------------------------------------------
if [ -z "$CLEAN_TEMP_CHILD" ] && command -v timeout >/dev/null 2>&1; then
    case "$MAX_SECONDS" in ''|*[!0-9]*) MAX_SECONDS=120 ;; esac
    CLEAN_TEMP_CHILD=1 timeout -k 10 "$MAX_SECONDS" bash "$0" "$@"
    rc=$?
    if [ $rc -eq 124 ] || [ $rc -eq 137 ]; then
        log "ABANDON : nettoyage interrompu apres ${MAX_SECONDS}s (bloque ?), on rend la main"
        exit 0
    fi
    exit 0
fi

usage() {
    echo "usage: cleanTemp.sh [--dry-run] [--verbose] [--minutes N] [--dir CHEMIN]"
}

TEMP_DIR=""
while [ $# -gt 0 ]; do
    case "$1" in
        --dry-run) DRY_RUN=1 ;;
        --verbose|-v) VERBOSE=1 ;;
        --minutes) shift; MIN_AGE_MINUTES="$1" ;;
        --dir) shift; TEMP_DIR="$1" ;;
        -h|--help) usage; exit 0 ;;
        *) log "option inconnue : $1"; usage; exit 0 ;;
    esac
    shift
done

case "$MIN_AGE_MINUTES" in
    ''|*[!0-9]*)
        log "age minimal invalide ('$MIN_AGE_MINUTES'), retour a 60 min"
        MIN_AGE_MINUTES=60 ;;
esac

# --- Dossier Temp du compte de session ---------------------------------------
# Sous cygwin, LOCALAPPDATA est herite de Windows (chemin Windows) ; a defaut,
# USERPROFILE ; a defaut, le HOME cygwin remonte vers le profil Windows.
to_cygwin_path() {
    if command -v cygpath >/dev/null 2>&1; then
        cygpath -u "$1" 2>/dev/null
    else
        echo "$1"
    fi
}
to_windows_path() {
    if command -v cygpath >/dev/null 2>&1; then
        cygpath -w "$1" 2>/dev/null
    else
        echo "$1"
    fi
}

LOCAL_APP_DATA=""
if [ -z "$TEMP_DIR" ]; then
    if [ -n "$LOCALAPPDATA" ]; then
        LOCAL_APP_DATA=$(to_cygwin_path "$LOCALAPPDATA")
    elif [ -n "$USERPROFILE" ]; then
        LOCAL_APP_DATA="$(to_cygwin_path "$USERPROFILE")/AppData/Local"
    fi
    [ -n "$LOCAL_APP_DATA" ] && TEMP_DIR="$LOCAL_APP_DATA/Temp"
fi

if [ -z "$TEMP_DIR" ] || [ ! -d "$TEMP_DIR" ]; then
    log "dossier Temp introuvable ('$TEMP_DIR'), rien a nettoyer"
    exit 0
fi

RESOLVED_DIR=$(cd "$TEMP_DIR" 2>/dev/null && pwd -P)
shopt -s nocasematch
case "$RESOLVED_DIR" in
    */AppData/Local/Temp) ;;
    *)
        log "REFUS : '$RESOLVED_DIR' n'est pas un dossier AppData/Local/Temp"
        exit 0 ;;
esac
shopt -u nocasematch
TEMP_DIR="$RESOLVED_DIR"
[ -z "$LOCAL_APP_DATA" ] && LOCAL_APP_DATA=$(dirname "$TEMP_DIR")

# --- Verrou -------------------------------------------------------------------
LOCK_DIR="$TEMP_DIR/.cleanTemp.lock"
if ! mkdir "$LOCK_DIR" 2>/dev/null; then
    if [ -n "$(find "$LOCK_DIR" -maxdepth 0 -mmin +$LOCK_STALE_MINUTES 2>/dev/null)" ]; then
        log "verrou obsolete (> ${LOCK_STALE_MINUTES} min), on le leve"
        rmdir "$LOCK_DIR" 2>/dev/null
        mkdir "$LOCK_DIR" 2>/dev/null || { log "verrou impossible a reprendre, abandon"; exit 0; }
    else
        log "nettoyage deja en cours, abandon"
        exit 0
    fi
fi
BOOT_REF="$TEMP_DIR/.cleanTemp.boot-ref"
trap 'rm -f "$BOOT_REF" 2>/dev/null; rmdir "$LOCK_DIR" 2>/dev/null' EXIT

# --- Date du dernier boot (reference pour les _MEI*) -----------------------------
# Fichier temoin date du boot : `find ! -newer` compare les mtime sans calcul.
up=$(cut -d' ' -f1 /proc/uptime 2>/dev/null)
up=${up%%.*}
case "$up" in ''|*[!0-9]*) up="" ;; esac
if [ -n "$up" ] && touch -d "@$(( $(date +%s) - up ))" "$BOOT_REF" 2>/dev/null; then
    log "dernier boot il y a $((up / 60)) min : seuls les _MEI* et *.tmp.node anterieurs sont supprimes"
else
    BOOT_REF=""
    log "date de boot inconnue : _MEI* et *.tmp.node sont conserves"
fi

log "dossier=$TEMP_DIR age minimal=${MIN_AGE_MINUTES} min$([ $DRY_RUN -eq 1 ] && echo ' (DRY-RUN)')"

# --- Suppression ----------------------------------------------------------------
deleted=0
failed=0
freed_kb=0

size_kb_of() {
    local kb
    kb=$(du -sk -- "$1" 2>/dev/null | cut -f1)
    case "$kb" in ''|*[!0-9]*) echo 0 ;; *) echo "$kb" ;; esac
}

# Supprime UNE entree (fichier ou dossier). Deux temps : rm, puis attrib -R
# (attribut "lecture seule" Windows, invisible des ACL) et rm a nouveau.
delete_entry() {
    local e="$1"
    rm -rf -- "$e" 2>/dev/null
    [ ! -e "$e" ] && return 0
    local wpath
    wpath=$(to_windows_path "$e")
    if [ -n "$wpath" ] && command -v cmd >/dev/null 2>&1; then
        if command -v timeout >/dev/null 2>&1; then
            timeout 10 cmd /c attrib -R "$wpath" /S /D >/dev/null 2>&1
        else
            cmd /c attrib -R "$wpath" /S /D >/dev/null 2>&1
        fi
        rm -rf -- "$e" 2>/dev/null
    fi
    [ ! -e "$e" ]
}

process_entry() {
    local e="$1" base kb
    base=$(basename -- "$e")
    kb=$(size_kb_of "$e")
    if [ $DRY_RUN -eq 1 ]; then
        log "supprimerait $base (${kb} Ko)"
        deleted=$((deleted+1))
        freed_kb=$((freed_kb+kb))
    elif delete_entry "$e"; then
        [ $VERBOSE -eq 1 ] && log "supprime $base (${kb} Ko)"
        deleted=$((deleted+1))
        freed_kb=$((freed_kb+kb))
    else
        # Fichier ouvert par un programme en cours : normal, on le reverra.
        [ $VERBOSE -eq 1 ] && log "garde $base (en cours d'utilisation ?)"
        failed=$((failed+1))
    fi
    return 0
}

# Motifs connus, a la racine de Temp seulement (-maxdepth 1), plus vieux que
# l'age minimal (mtime de l'entree elle-meme : un `_MEI` en cours d'usage a
# ete cree il y a quelques secondes). `find … -print0` + `while read` : jamais
# de `xargs` ni de glob qui s'arreterait sur un nom exotique.
clean_pattern() {
    local kind="$1" pattern="$2"
    find "$TEMP_DIR" -maxdepth 1 -mindepth 1 -type "$kind" -name "$pattern" \
        -mmin +"$MIN_AGE_MINUTES" -print0 2>/dev/null |
    while IFS= read -r -d '' e; do
        process_entry "$e" || log "erreur inattendue sur $(basename -- "$e"), on continue"
    done
}

# Entrees appartenant a un processus VIVANT de la session (`_MEI*` de
# PyInstaller, `*.tmp.node` d'Electron) : age minimal ET anterieur au dernier
# boot (`! -newer` = mtime pas plus recent que le temoin), cf. en-tete.
clean_pattern_before_boot() {
    local kind="$1" pattern="$2"
    if [ -z "$BOOT_REF" ] || [ ! -f "$BOOT_REF" ]; then
        return 0
    fi
    find "$TEMP_DIR" -maxdepth 1 -mindepth 1 -type "$kind" -name "$pattern" \
        -mmin +"$MIN_AGE_MINUTES" ! -newer "$BOOT_REF" -print0 2>/dev/null |
    while IFS= read -r -d '' e; do
        process_entry "$e" || log "erreur inattendue sur $(basename -- "$e"), on continue"
    done
}

# NB : `deleted`/`failed` sont incrementes dans un sous-shell (pipe) — on
# recompte a la fin par comparaison avant/apres plutot que par les compteurs.
count_entries() {
    find "$TEMP_DIR" -maxdepth 1 -mindepth 1 2>/dev/null | wc -l
}
before=$(count_entries)

clean_pattern_before_boot d '_MEI*'
clean_pattern_before_boot f '*.tmp.node'
clean_pattern f '*.tmp'
clean_pattern f 'nsb*.tmp'
clean_pattern d 'nsb*.tmp'
clean_pattern d 'compileCache_*'
clean_pattern f 'compileCache_*'
# Dossiers de travail Chrome/Chromium (scoped_dir*) et squirrel (installeurs)
clean_pattern d 'scoped_dir*'
clean_pattern d 'chrome_*'

after=$(count_entries)
case "$before$after" in *[!0-9]*) before=0; after=0 ;; esac
if [ $DRY_RUN -eq 1 ]; then
    log "Temp : passe a blanc terminee ($before entree(s) presentes)"
else
    log "Temp : $((before - after)) entree(s) supprimee(s), $after restante(s)"
fi

# --- Cache electron-updater (%LOCALAPPDATA%\<app>-updater\pending) -------------
# L'installeur telecharge reste apres la mise a jour. On ne vide que `pending`
# (jamais le dossier parent, qui porte la conf de l'updater), avec le meme age
# minimal : un telechargement en cours a un mtime recent.
if [ -n "$LOCAL_APP_DATA" ] && [ -d "$LOCAL_APP_DATA" ]; then
    find "$LOCAL_APP_DATA" -maxdepth 1 -mindepth 1 -type d -name '*-updater' -print0 2>/dev/null |
    while IFS= read -r -d '' upd; do
        pending="$upd/pending"
        [ -d "$pending" ] || continue
        shopt -s nocasematch
        case "$pending" in */-updater/pending|*-updater/pending) ;; *) shopt -u nocasematch; continue ;; esac
        shopt -u nocasematch
        find "$pending" -maxdepth 1 -mindepth 1 -mmin +"$MIN_AGE_MINUTES" -print0 2>/dev/null |
        while IFS= read -r -d '' e; do
            log "updater $(basename -- "$upd") : $( [ $DRY_RUN -eq 1 ] && echo 'supprimerait' || echo 'supprime') $(basename -- "$e")"
            [ $DRY_RUN -eq 1 ] || delete_entry "$e" || log "ECHEC suppression $(basename -- "$e")"
        done
    done
fi

log "termine"
exit 0
