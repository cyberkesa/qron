#!/bin/bash

# Цвета для вывода
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Проверка портов разработки...${NC}"

# Массив портов для проверки
PORTS=(3000 3001 3002 3003 3004 3005 3006 3007 3008 3009 3010)
FOUND=0

for PORT in "${PORTS[@]}"; do
  # Проверяем, есть ли процесс на порту
  PID=$(lsof -ti :$PORT 2>/dev/null)
  
  if [ -n "$PID" ]; then
    # Получаем информацию о процессе более совместимым способом
    COMMAND=$(ps -p $PID -o comm | tail -n 1)
    USER=$(ps -p $PID -o user | tail -n 1)
    
    echo -e "${YELLOW}Порт $PORT:${NC} Процесс $PID ($COMMAND) запущен пользователем $USER"
    FOUND=$((FOUND+1))
  else
    echo -e "${GREEN}Порт $PORT:${NC} Свободен"
  fi
done

if [ $FOUND -eq 0 ]; then
  echo -e "${GREEN}Все порты разработки свободны${NC}"
else
  echo -e "${YELLOW}Обнаружено активных процессов: $FOUND${NC}"
  echo -e "${YELLOW}Для закрытия всех процессов выполните: yarn kill-ports${NC}"
fi 