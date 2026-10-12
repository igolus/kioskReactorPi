#!/bin/bash
#
# purgeLogs.sh — purge des logs de la borne (C:\kioskReactor\logs).
#
# Garde les N derniers jours (defaut 15) et supprime le reste. Appele par
# scriptUtil\services-install.bat (repo miroir kioskReactorPi, dossier exclu de
# la synchro) a chaque boot et apres chaque update, ELEVE en administrateur,
# juste APRES reset_acl.bat qui remet les ACL de C:\kioskReactor\logs au propre
# et juste AVANT la (re)installation des services nssm qui ecrivent dans ce
# dossier (Agent-mt.log, camera.log, usb_scanner). C'est le seul moment ou l'on
# a a la fois les droits, des ACL saines et des ecrivains a l'arret.
# Utilisable aussi a la main :
#
#   bash purgeLogs.sh                 # purge, 15 jours
#   bash purgeLogs.sh --dry-run       # montre ce qui serait supprime, ne touche a rien
#   bash purgeLogs.sh --days 30       # autre retention
#   LOG_RETENTION_DAYS=7 bash purgeLogs.sh
#
# ROBUSTESSE — ce script ne doit JAMAIS :
#   - casser le boot : aucun `set -e`, toute erreur est journalisee et on
#     continue ; code de sortie 0 sauf refus de purger (garde-fou, code 2) ;
#   - purger un autre dossier que celui des logs : le chemin est resolu puis
#     verifie (doit se terminer par kioskReactor/logs), vide ou inexistant =
#     refus ;
#   - supprimer le log du JOUR, ouvert par le `tee` du lanceur, quel que soit
#     son mtime ;
#   - tourner deux fois en meme temps (verrou par mkdir, verrou obsolete
#     ignore apres 10 min).
#
# L'age d'un fichier `log-YYYY-MM-DD.log` est lu dans son NOM : c'est la seule
# information fiable — le mtime d'un log est repousse a chaque ecriture, et un
# log du 1er du mois ecrit tard le soir avait un mtime du lendemain. Les autres
# fichiers (.log sans date dans le nom, .log.1...) retombent sur le mtime.
#
# NEUTRE VIS-A-VIS DES ACL : aucun chmod. Sous cygwin, chmod reecrit les ACL
# Windows a sa maniere et defait le travail de reset_acl.bat qui vient de
# passer. Les droits viennent de l'elevation et des ACL fraiches ; la seule
# chose qui peut encore bloquer `rm` est l'attribut Windows "lecture seule",
# invisible des ACL : chaque suppression est donc tentee en 2 temps, rm puis
# attrib -R + rm. Un echec est journalise, jamais fatal.

LOG_DIR="${LOG_DIR:-/cygdrive/c/kioskReactor/logs}"
RETENTION_DAYS="${LOG_RETENTION_DAYS:-15}"
LOCK_STALE_MINUTES=10
DRY_RUN=0
VERBOSE=0

log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - purgeLogs: $*"
}

usage() {
    echo "usage: purgeLogs.sh [--dry-run] [--verbose] [--days N] [--dir CHEMIN]"
}

while [ $# -gt 0 ]; do
    case "$1" in
        --dry-run) DRY_RUN=1 ;;
        --verbose|-v) VERBOSE=1 ;;
        --days) shift; RETENTION_DAYS="$1" ;;
        --dir) shift; LOG_DIR="$1" ;;
        -h|--help) usage; exit 0 ;;
        *) log "option inconnue : $1"; usage; exit 2 ;;
    esac
    shift
done

# --- Garde-fous ---------------------------------------------------------------

case "$RETENTION_DAYS" in
    ''|*[!0-9]*)
        log "retention invalide ('$RETENTION_DAYS'), retour a 15 jours"
        RETENTION_DAYS=15 ;;
esac
if [ "$RETENTION_DAYS" -lt 1 ]; then
    log "retention < 1 jour refusee ('$RETENTION_DAYS'), retour a 15 jours"
    RETENTION_DAYS=15
fi

if [ -z "$LOG_DIR" ] || [ ! -d "$LOG_DIR" ]; then
    log "dossier de logs introuvable ('$LOG_DIR'), rien a purger"
    exit 2
fi

# Chemin RESOLU (liens, `..`) : c'est lui qu'on verifie et qu'on purge.
RESOLVED_DIR=$(cd "$LOG_DIR" 2>/dev/null && pwd -P)
case "$RESOLVED_DIR" in
    */kioskReactor/logs) ;;
    *)
        log "REFUS : '$RESOLVED_DIR' n'est pas un dossier kioskReactor/logs"
        exit 2 ;;
esac
LOG_DIR="$RESOLVED_DIR"

# --- Verrou -------------------------------------------------------------------

LOCK_DIR="$LOG_DIR/.purge.lock"
if ! mkdir "$LOCK_DIR" 2>/dev/null; then
    # Verrou present : obsolete (purge plantee / PC coupe) ou purge en cours ?
    if [ -n "$(find "$LOCK_DIR" -maxdepth 0 -mmin +$LOCK_STALE_MINUTES 2>/dev/null)" ]; then
        log "verrou obsolete (> ${LOCK_STALE_MINUTES} min), on le leve"
        rmdir "$LOCK_DIR" 2>/dev/null
        mkdir "$LOCK_DIR" 2>/dev/null || { log "verrou impossible a reprendre, abandon"; exit 0; }
    else
        log "purge deja en cours, abandon"
        exit 0
    fi
fi
trap 'rmdir "$LOCK_DIR" 2>/dev/null' EXIT

# --- Calcul de la date limite -------------------------------------------------

TODAY=$(date +%F)
TODAY_EPOCH=$(date -d "$TODAY" +%s 2>/dev/null)
if [ -z "$TODAY_EPOCH" ]; then
    log "date du jour illisible, abandon"
    exit 0
fi
# Un fichier date du jour J est supprime si J < aujourd'hui - retention.
CUTOFF_EPOCH=$((TODAY_EPOCH - RETENTION_DAYS * 86400))
TODAY_LOG="log-$TODAY.log"

log "dossier=$LOG_DIR retention=${RETENTION_DAYS}j limite=$(date -d "@$CUTOFF_EPOCH" +%F)$([ $DRY_RUN -eq 1 ] && echo ' (DRY-RUN)')"

# --- Suppression en 2 temps ---------------------------------------------------

to_windows_path() {
    if command -v cygpath >/dev/null 2>&1; then
        cygpath -w "$1" 2>/dev/null
    else
        echo "$1"
    fi
}

delete_file() {
    local f="$1"
    rm -f -- "$f" 2>/dev/null
    [ ! -e "$f" ] && return 0
    # Attribut Windows "lecture seule" : invisible des ACL, bloque rm.
    local wpath
    wpath=$(to_windows_path "$f")
    if [ -n "$wpath" ] && command -v cmd >/dev/null 2>&1; then
        cmd /c attrib -R "$wpath" >/dev/null 2>&1
        rm -f -- "$f" 2>/dev/null
    fi
    [ ! -e "$f" ]
}

# --- Parcours -----------------------------------------------------------------

deleted=0
kept=0
failed=0
freed_bytes=0

shopt -s nullglob
for f in "$LOG_DIR"/*.log "$LOG_DIR"/*.log.*; do
    [ -f "$f" ] || continue
    base=$(basename -- "$f")

    # Jamais le log du jour : il est ouvert par le tee du lanceur.
    if [ "$base" = "$TODAY_LOG" ]; then
        [ $VERBOSE -eq 1 ] && log "garde (log du jour) $base"
        kept=$((kept+1))
        continue
    fi

    # Age : date du NOM si possible, mtime sinon.
    file_epoch=""
    if [[ "$base" =~ ^log-([0-9]{4}-[0-9]{2}-[0-9]{2})\.log ]]; then
        file_epoch=$(date -d "${BASH_REMATCH[1]}" +%s 2>/dev/null)
    fi
    if [ -z "$file_epoch" ]; then
        file_epoch=$(stat -c %Y -- "$f" 2>/dev/null)
    fi
    if [ -z "$file_epoch" ]; then
        log "age illisible, garde $base"
        kept=$((kept+1))
        continue
    fi

    if [ "$file_epoch" -lt "$CUTOFF_EPOCH" ]; then
        size=$(stat -c %s -- "$f" 2>/dev/null || echo 0)
        if [ $DRY_RUN -eq 1 ]; then
            log "supprimerait $base ($size octets)"
            deleted=$((deleted+1))
            freed_bytes=$((freed_bytes+size))
        elif delete_file "$f"; then
            [ $VERBOSE -eq 1 ] && log "supprime $base ($size octets)"
            deleted=$((deleted+1))
            freed_bytes=$((freed_bytes+size))
        else
            log "ECHEC suppression $base (droits ?) — a verifier a la main"
            failed=$((failed+1))
        fi
    else
        [ $VERBOSE -eq 1 ] && log "garde $base"
        kept=$((kept+1))
    fi
done

log "termine : $deleted supprime(s) ($((freed_bytes / 1024)) Ko), $kept garde(s), $failed echec(s)"
exit 0
