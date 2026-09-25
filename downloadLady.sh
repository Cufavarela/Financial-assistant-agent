# Bash script to download Lady Ahorro site pages for ingestion.
# Error if any command fails
set -e
echo Downloading Lady Ahorro pages...
# -r -l 2: recurse two levels (homepage + /page/*)
# -np: do not ascend to parent directories
# -E: save extensionless HTML as .html (e.g. page/cursos.html)
# -D: stay on ladyahorro.com only
# no -A.html so pretty URLs like /page/cursos are accepted
# wget exits 8 when some URLs return server errors during a crawl; that is OK if pages were saved.
set +e
wget -q -r -l 2 -np -E -D ladyahorro.com https://ladyahorro.com/
code=$?
set -e
if [ "$code" -ne 0 ] && [ "$code" -ne 8 ]; then
  echo "wget failed with exit code $code" >&2
  exit "$code"
fi
if [ ! -f ladyahorro.com/index.html ]; then
  echo "Download failed: ladyahorro.com/index.html missing" >&2
  exit 1
fi
echo Done.
