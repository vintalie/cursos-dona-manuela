#!/bin/bash

BASE_DIR=$(pwd)
OUTPUT_FILE="project_report.txt"

TARGET_DIRS=("src" "app" "routes")
IGNORED_DIRS=("node_modules" "vendor" "database.sqlite")

FOUND_COUNT=0

echo "Gerando relatório de conteúdo dos arquivos..." > "$OUTPUT_FILE"
echo "Pasta base: $BASE_DIR" >> "$OUTPUT_FILE"
echo "====================================" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

# -------------------
# Função para ignorar node_modules e vendor
# -------------------
PRUNE_EXPR=""
for IGN in "${IGNORED_DIRS[@]}"; do
  PRUNE_EXPR="$PRUNE_EXPR -name $IGN -o"
done

# Remove último -o
PRUNE_EXPR=${PRUNE_EXPR% -o}

# -------------------
# Busca recursiva real das pastas alvo
# -------------------

for TARGET in "${TARGET_DIRS[@]}"; do

  echo "Procurando diretórios chamados '$TARGET'..." >> "$OUTPUT_FILE"

  FOUND_DIRS=$(find "$BASE_DIR" \
    -type d \( $PRUNE_EXPR \) -prune -false -o \
    -type d -name "$TARGET" -print)

  if [ -z "$FOUND_DIRS" ]; then
    echo "Pasta '$TARGET' não encontrada em nenhuma subpasta." >> "$OUTPUT_FILE"
    echo "" >> "$OUTPUT_FILE"
    continue
  fi

  while IFS= read -r DIR; do
    FOUND_COUNT=$((FOUND_COUNT + 1))

    echo "====================" >> "$OUTPUT_FILE"
    echo "Conteúdo da pasta encontrada: $DIR" >> "$OUTPUT_FILE"
    echo "--------------------" >> "$OUTPUT_FILE"

    find "$DIR" \
      -type d \( $PRUNE_EXPR \) -prune -false -o \
      -type f -print0 | while IFS= read -r -d "" FILE; do

        echo ">> Arquivo: $FILE" >> "$OUTPUT_FILE"
        echo "------------------------------------" >> "$OUTPUT_FILE"
        cat "$FILE" >> "$OUTPUT_FILE"
        echo "" >> "$OUTPUT_FILE"
        echo "------------------------------------" >> "$OUTPUT_FILE"
        echo "" >> "$OUTPUT_FILE"
      done

    echo "====================" >> "$OUTPUT_FILE"
    echo "" >> "$OUTPUT_FILE"

  done <<< "$FOUND_DIRS"

done

# -------------------
# Relatório Final
# -------------------

echo "Relatório de busca concluído." >> "$OUTPUT_FILE"
echo "------------------------------------" >> "$OUTPUT_FILE"

if [ "$FOUND_COUNT" -gt 0 ]; then
  echo "Total de diretórios alvo encontrados: $FOUND_COUNT" >> "$OUTPUT_FILE"
else
  echo "Nenhum diretório alvo foi encontrado no projeto." >> "$OUTPUT_FILE"
fi

echo "" >> "$OUTPUT_FILE"
echo "O relatório completo foi gravado em $OUTPUT_FILE."

exit 0
