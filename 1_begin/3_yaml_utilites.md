Да, **есть отличные утилиты для работы с YAML прямо из терминала** — они помогают читать, редактировать, проверять и преобразовывать YAML-файлы без GUI. Особенно полезны при работе с Kubernetes.

Вот **лучшие CLI-инструменты** для работы с YAML:

---

### 1. **`yq`** — мощный обработчик YAML (аналог `jq` для JSON)

> 🔗 Официальный сайт: [https://github.com/kislyuk/yq](https://github.com/kislyuk/yq)  
> ⚠️ Не путать с `mikefarah/yq` — есть две популярные версии. Рекомендуем `kislyuk/yq` (на Python), но `mikefarah/yq` тоже популярен.

#### 🔧 Установка (через pip):

```bash
pip install yq
```

Или (для `mikefarah/yq`):

```bash
# Linux
sudo wget https://github.com/mikefarah/yq/releases/latest/download/yq_linux_amd64 -O /usr/local/bin/yq
sudo chmod +x /usr/local/bin/yq
```

#### ✅ Примеры использования

```bash
# Прочитать значение поля
yq '.metadata.name' deployment.yaml
# Вывод: nginx-deployment

# Извлечь образ
yq '.spec.template.spec.containers[0].image' deployment.yaml
# Вывод: nginx:1.25

# Изменить образ (и сохранить в файл)
yq '.spec.template.spec.containers[0].image = "nginx:latest"' deployment.yaml > new.yaml

# Преобразовать YAML → JSON
yq -o=json . deployment.yaml
```

---

### 2. **`yamllint`** — проверка стиля и синтаксиса YAML

> 🔗 [https://yamllint.readthedocs.io](https://yamllint.readthedocs.io)

#### Установка:

```bash
pip install yamllint
```

#### Использование:

```bash
yamllint deployment.yaml
```

Покажет предупреждения:
- Неправильные отступы
- Лишние пробелы
- Стилевые ошибки

---

### 3. **`kube-linter`** — статический анализатор Kubernetes манифестов

> 🔗 [https://github.com/stackrox/kube-linter](https://github.com/stackrox/kube-linter)

Проверяет YAML на **безопасность и лучшие практики**:
- Отсутствие limit/requests
- Запуск от root
- Открытые привилегии

#### Пример:

```bash
kube-linter lint deployment.yaml
```

---

### 4. **`kustomize`** — шаблонизация без шаблонов (нативно в kubectl)

> 🔗 [https://kubectl.docs.kubernetes.io/guides/config_management/intro/](https://kubectl.docs.kubernetes.io/guides/config_management/intro/)

Позволяет:
- Управлять окружениями (dev, prod)
- Изменять образы, имена, labels без редактирования YAML

#### Пример:

```bash
# В папке с kustomization.yaml
kubectl kustomize ./overlays/production | kubectl apply -f -
```

---

### 5. **`fx`** — красивый просмотр JSON/YAML в терминале

> 🔗 [https://github.com/antonmedv/fx](https://github.com/antonmedv/fx)

Работает с потоками:

```bash
kubectl get pod mypod -o yaml | fx
```

Интерактивный режим: можно фильтровать, искать, раскрывать структуру.

---

### 6. **`vivid` + `bat`** — цветной вывод YAML

- `bat` — как `cat`, но с подсветкой синтаксиса
- `vivid` — генератор тем для `bat`

```bash
bat deployment.yaml
```

Установка:

```bash
# bat
sudo apt install bat   # Ubuntu/Debian
brew install bat       # macOS

# vivid
cargo install vivid
```

---

### 7. **`docker run` с yq (если не хочешь устанавливать)**

```bash
docker run --rm -i mikefarah/yq yq '.metadata.name' deployment.yaml < deployment.yaml
```

---

## 🧰 Полезные комбинации

```bash
# Посмотреть все имена подов из манифеста
yq '.items[].metadata.name' <(kubectl get pods -o yaml)

# Проверить, есть ли limits
yq '.spec.template.spec.containers[].resources.limits' deployment.yaml

# Найти все сервисы типа NodePort
kubectl get svc -o yaml | yq '.items[] | select(.spec.type == "NodePort") | .metadata.name'
```

---

## ✅ Рекомендуемый набор для терминала

| Утилита | Зачем |
|--------|------|
| `yq` | Читать/изменять YAML |
| `yamllint` | Проверять стиль |
| `bat` | Красивый `cat` |
| `kube-linter` | Проверка безопасности |
| `kustomize` | Управление конфигурацией |

