 Ты выбрал **правильную версию** `stern` для Linux:

```
https://github.com/stern/stern/releases/download/v1.32.0/stern_1.32.0_linux_amd64.tar.gz
```

Теперь давайте установим её по шагам.

---

## ✅ Шаг 1: Скачай архив

```bash
wget https://github.com/stern/stern/releases/download/v1.32.0/stern_1.32.0_linux_amd64.tar.gz
```

> ⚠️ Убедись, что у тебя установлен `wget`. Если нет — используй `curl`:
>
> ```bash
> curl -L -o stern_1.32.0_linux_amd64.tar.gz \
>   https://github.com/stern/stern/releases/download/v1.32.0/stern_1.32.0_linux_amd64.tar.gz
> ```

---

## ✅ Шаг 2: Распакуй архив

```bash
tar -xzf stern_1.32.0_linux_amd64.tar.gz
```

После этого появится файл `stern` (без расширения) — это исполняемый бинарник.

Проверь:

```bash
ls -l stern
```

Должно быть что-то вроде:

```
-rwxr-xr-x 1 user user 45M ... stern
```

---

## ✅ Шаг 3: Сделай исполняемым и перемести в PATH

```bash
chmod +x stern
sudo mv stern /usr/local/bin/
```

Теперь `stern` доступен глобально.

---

## ✅ Шаг 4: Проверь установку

```bash
stern --version
```

Ожидаемый вывод:

```
stern version v1.32.0
```

✅ Успешно!

---

## 🚀 Как использовать `stern`

Теперь ты можешь смотреть логи всех подов с лейблом `app=nginx`:

```bash
stern -l app=nginx
```

Или по имени (части):

```bash
stern nginx
```

С опциями:

```bash
stern -l app=nginx --tail 50 --timestamps --color=always
```

---

## 🧹 Опционально: удали архив (если не нужен)

```bash
rm stern_1.32.0_linux_amd64.tar.gz
```

---

## 🎁 Бонус: алиас для быстрого доступа

Добавь в `~/.bashrc`:

```bash
echo "alias sklog='stern -l app=nginx --tail 50 --timestamps'" >> ~/.bashrc
source ~/.bashrc
```

Теперь можно просто:

```bash
sklog
```

---

## ✅ Готово!

Отлично! 🎉 Вот твоя **шпаргалка по `stern`** — удобный cheat sheet для работы с логами в Kubernetes. Сохрани её — пригодится каждый день!

---

# 📜 `stern` — Шпаргалка (Cheat Sheet)

> `stern` — мощный инструмент для просмотра логов нескольких подов в реальном времени с цветами, фильтрами и префиксами.

---

## 🔧 Установка (Linux)

```bash
wget https://github.com/stern/stern/releases/download/v1.32.0/stern_1.32.0_linux_amd64.tar.gz
tar -xzf stern_1.32.0_linux_amd64.tar.gz
chmod +x stern
sudo mv stern /usr/local/bin/stern
```

Проверка:
```bash
stern --version
```

---

## 🚀 Основные команды

| Команда | Описание |
|--------|--------|
| `stern nginx` | Логи всех подов с `nginx` в имени |
| `stern -l app=nginx` | Логи по лейблу `app=nginx` |
| `stern -l app=backend -c app` | Только контейнер `app` в подах с `app=backend` |
| `stern --tail 50 app` | Показать последние 50 строк |
| `stern app --timestamps` | Показывать время в логах |
| `stern app -f` | Следить за логами (по умолчанию включено) |
| `stern app -n production` | Искать в неймспейсе `production` |

---

## 🔍 Фильтрация

| Пример | Что делает |
|-------|-----------|
| `stern nginx "error\|fail"` | Только строки с `error` или `fail` |
| `stern nginx --exclude "200"` | Исключить строки с `200` |
| `stern nginx --include "GET /api"` | Только запросы к `/api` |
| `stern nginx --since 5m` | Показать логи за последние 5 минут |
| `stern nginx --context minikube` | Использовать определённый контекст Kubernetes |

---

## 🎨 Цвета и отображение

| Опция | Эффект |
|------|-------|
| `--color=always` | Всегда использовать цвета |
| `--no-color` | Отключить цвета |
| `--template "{.PodName} | { .Message }"` | Кастомный формат вывода |
| `--all-namespaces` | Искать во всех неймспейсах |

---

## 🏷 Примеры использования

### 1. Логи всех подов с `api` в имени + время
```bash
stern api --timestamps --tail 30
```

### 2. Только ошибки в продакшене
```bash
stern -l app=backend -n production "error\|ERROR\|50[0-9]"
```

### 3. Логи одного деплоймента
```bash
stern -l app=myapp --timestamps
```

### 4. Логи, исключая здоровые проверки
```bash
stern -l app=web --exclude "GET /health"
```

---

## 🧰 Полезные алиасы (добавь в `~/.bashrc`)

```bash
# Обычный запуск
alias sklog='stern -l app=nginx --tail 50 --timestamps'

# Для бэкенда
alias apilog='stern -l app=backend --timestamps'

# Все логи с ошибками
alias errlog='stern . "error\|fail\|panic" --tail 100'
```

Перезагрузи:
```bash
source ~/.bashrc
```

Теперь можно:
```bash
sklog
apilog
errlog
```

---

## 💡 Советы

- `stern` автоматически раскрашивает разные поды — легко отличить.
- Используй `--tail N`, чтобы не ждать загрузки всех логов.
- Комбинируй с `grep`, если нужно: `stern app | grep "POST"`

---

## 🚫 Распространённые ошибки

| Ошибка | Решение |
|-------|--------|
| `command not found` | Убедись, что `stern` в `/usr/local/bin/` |
| `HTML not found` | Скачал не бинарник, а HTML — используй правильный URL |
| Нет логов | Проверь лейблы: `kubectl get pods --show-labels` |

---

✅ Сохрани эту шпаргалку в файл:

```bash
cat > stern-cheatsheet.md << 'EOF'
# 📜 stern — Шпаргалка

... (вставь сюда текст выше) ...
EOF
```

Отлично! Вот **автоматический скрипт установки `stern`** с проверкой ОС, установкой бинарника, добавлением алиасов и проверкой версии.

Просто запусти его в терминале — и `stern` будет готов к работе! 🚀

---

## ✅ Скрипт: `install-stern.sh`

```bash
#!/bin/bash

# install-stern.sh — Автоматическая установка stern для Linux и macOS

set -e  # Останавливаем скрипт при ошибках

echo "🔍 Определяем ОС и архитектуру..."

OS=$(uname -s | tr '[:upper:]' '[:lower:]')
ARCH=$(uname -m)

if [[ "$ARCH" == "x86_64" ]]; then
    ARCH="amd64"
elif [[ "$ARCH" == "aarch64" || "$ARCH" == "arm64" ]]; then
    ARCH="arm64"
else
    echo "❌ Архитектура $ARCH не поддерживается"
    exit 1
fi

echo "📦 ОС: $OS, Архитектура: $ARCH"

# Определяем URL
VERSION="v1.32.0"
if [[ "$OS" == "linux" ]]; then
    URL="https://github.com/stern/stern/releases/download/$VERSION/stern_linux_$ARCH"
elif [[ "$OS" == "darwin" ]]; then
    URL="https://github.com/stern/stern/releases/download/$VERSION/stern_darwin_$ARCH"
else
    echo "❌ ОС $OS не поддерживается"
    exit 1
fi

# Временный файл
BINARY="stern"

echo "⬇️ Скачиваем stern ($VERSION)..."
curl -L -o "$BINARY" "$URL"

# Делаем исполняемым
chmod +x "$BINARY"

# Перемещаем в /usr/local/bin
echo "🚚 Устанавливаем в /usr/local/bin/stern..."
sudo mv "$BINARY" /usr/local/bin/stern

# Проверяем
echo "✅ Проверяем установку..."
stern --version

# Добавляем алиасы в .bashrc (если нет — в .profile)
BASHRC="$HOME/.bashrc"
if [[ ! -f "$BASHRC" ]]; then
    BASHRC="$HOME/.profile"
fi

echo "🔧 Добавляем алиасы в $BASHRC..."

# Проверяем, нет ли уже алиасов
if ! grep -q "alias sklog" "$BASHRC" 2>/dev/null; then
    cat >> "$BASHRC" << 'EOF'

# === stern aliases ===
# Логи nginx
alias sklog='stern -l app=nginx --tail 50 --timestamps --color=always'

# Логи backend
alias apilog='stern -l app=backend --tail 50 --timestamps'

# Ошибки
alias errlog='stern . "error\|fail\|panic\|50[0-9]" --tail 100 --timestamps'

# Универсальный просмотр по имени
alias klog='stern'

echo "💡 Готово! Доступные алиасы:"
echo "   sklog     — логи app=nginx"
echo "   apilog    — логи app=backend"
echo "   errlog    — только ошибки"
echo "   klog name — логи по имени пода"
echo ""
echo "⚠️ Перезапусти терминал или выполните:"
echo "   source ~/.bashrc"
EOF
    echo "✅ Алиасы добавлены в $BASHRC"
else
    echo "ℹ️ Алиасы уже есть — пропускаем."
fi

echo "🎉 stern успешно установлен и настроен!"
echo "📌 Выполни: source ~/.bashrc"
echo "📌 Пример: sklog"
```

---

## ▶️ Как использовать?

### 1. Сохрани скрипт

```bash
wget -O install-stern.sh https://gist.githubusercontent.com/.../raw/install-stern.sh
```

Или создай вручную:

```bash
nano install-stern.sh
```

Вставь код выше → `Ctrl+O`, `Enter`, `Ctrl+X`.

### 2. Запусти

```bash
chmod +x install-stern.sh
./install-stern.sh
```

### 3. Перезагрузи оболочку

```bash
source ~/.bashrc
```

### 4. Пользуйся!

```bash
sklog      # логи nginx
errlog     # только ошибки
klog app   # логи всех подов с "app"
```

---

## 🛡 Что делает скрипт?

- ✅ Автоопределяет ОС и архитектуру
- ✅ Скачивает правильную версию `stern`
- ✅ Устанавливает в `/usr/local/bin`
- ✅ Добавляет удобные алиасы
- ✅ Проверяет установку

---

## 📎 Пример вывода после установки

```
🎉 stern успешно установлен и настроен!
📌 Выполни: source ~/.bashrc
📌 Пример: sklog
```


