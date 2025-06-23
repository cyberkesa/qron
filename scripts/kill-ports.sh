#!/bin/bash

# Цвета для вывода
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Поиск и закрытие процессов на портах разработки...${NC}"

# Массив портов для проверки
PORTS=(3000 3001 3002 3003 3004 3005 3006 3007 3008 3009 3010)
KILLED=0

for PORT in "${PORTS[@]}"; do
  # Проверяем, есть ли процесс на порту
  PID=$(lsof -ti :$PORT 2>/dev/null)
  
  if [ -n "$PID" ]; then
    echo -e "${YELLOW}Найден процесс $PID на порту $PORT. Закрываю...${NC}"
    kill -9 $PID 2>/dev/null
    if [ $? -eq 0 ]; then
      echo -e "${GREEN}✓ Процесс $PID на порту $PORT успешно закрыт${NC}"
      KILLED=$((KILLED+1))
    else
      echo -e "${RED}✗ Не удалось закрыть процесс $PID на порту $PORT${NC}"
    fi
  fi
done

if [ $KILLED -eq 0 ]; then
  echo -e "${GREEN}Активных процессов на портах разработки не обнаружено${NC}"
else
  echo -e "${GREEN}Закрыто процессов: $KILLED${NC}"
fi

echo -e "${GREEN}Порты очищены, можно запускать сервер разработки${NC}" 