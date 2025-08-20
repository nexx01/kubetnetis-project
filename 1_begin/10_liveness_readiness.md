Отлично! Ниже — **подробный пример настройки `livenessProbe` и `readinessProbe`** в Kubernetes/OpenShift для типичного приложения (например, Spring Boot или Nginx).

---

## 🔍 В чём разница?

| Проба | Зачем нужна |
|------|-------------|
| **`livenessProbe`** | Проверяет, "живо" ли приложение. Если падает — **перезапускает под** |
| **`readinessProbe`** | Проверяет, готово ли приложение принимать трафик. Если нет — **удаляет из Service** (не направляет туда запросы) |

---

## ✅ Пример: Deployment с Liveness и Readiness

```yaml
# deployment-probes.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: myapp-deployment
spec:
  replicas: 2
  selector:
    matchLabels:
      app: myapp
  template:
    meta
      labels:
        app: myapp
    spec:
      containers:
      - name: myapp
        image: nginx:alpine
        ports:
        - containerPort: 80

        # === Readiness Probe ===
        # Готов ли контейнер принимать трафик?
        readinessProbe:
          httpGet:
            path: /health
            port: 80
          initialDelaySeconds: 5
          periodSeconds: 10
          timeoutSeconds: 3
          successThreshold: 1
          failureThreshold: 3

        # === Liveness Probe ===
        # Живо ли приложение? Если нет — перезапустить.
        livenessProbe:
          httpGet:
            path: /health
            port: 80
          initialDelaySeconds: 15
          periodSeconds: 20
          timeoutSeconds: 5
          successThreshold: 1
          failureThreshold: 3

        # Опционально: startupProbe (для медленно стартующих приложений)
        # startupProbe:
        #   httpGet:
        #     path: /health
        #     port: 80
        #   failureThreshold: 30
        #   periodSeconds: 10
```

---

## 📌 Пояснение параметров

### 🔹 `httpGet`
- Проверяет HTTP-эндпоинт (например, `/health`, `/actuator/health` для Spring Boot)

> 💡 Альтернативы:
> - `exec`: команда внутри контейнера: `cat /tmp/healthy`
> - `tcpSocket`: просто проверяет, открыт ли порт

---

### 🔹 `initialDelaySeconds`
- Через сколько секунд после старта начинать проверку
- **`readiness`** — можно меньше (5–10 сек), т.к. приложение может быть готово быстро
- **`liveness`** — больше (15–30 сек), чтобы не убить под во время запуска

---

### 🔹 `periodSeconds`
- Как часто проверять (по умолчанию 10 сек)

---

### 🔹 `timeoutSeconds`
- Сколько ждать ответа (если не ответил — ошибка)

---

### 🔹 `successThreshold`
- Сколько успешных проверок нужно для статуса "успех"  
  → Обычно `1`

---

### 🔹 `failureThreshold`
- Сколько неудачных попыток до действия:
  - Для `readiness`: под удаляется из Service
  - Для `liveness`: под перезапускается

---

## 🛠 Пример для Spring Boot

Если у тебя **Spring Boot**, используй `/actuator/health`:

```yaml
livenessProbe:
  httpGet:
    path: /actuator/health
    port: 8080
    httpHeaders:
    - name: Accept
      value: application/json
  initialDelaySeconds: 60
  periodSeconds: 30
  timeoutSeconds: 5
  failureThreshold: 5

readinessProbe:
  httpGet:
    path: /actuator/health
    port: 8080
  initialDelaySeconds: 30
  periodSeconds: 10
  timeoutSeconds: 3
  failureThreshold: 3
```

> ✅ Убедись, что в `application.yml` включён health:
> ```yaml
> management:
>   endpoint:
>     health:
>       enabled: true
>   endpoints:
>     web:
>       exposure:
>         include: health,info
> ```

---

## 🧪 Как проверить?

1. Примени манифест:
   ```bash
   oc apply -f deployment-probes.yaml
   ```

2. Посмотри статус:
   ```bash
   oc get pods
   ```
   → Должно быть: `READY 1/1`

3. Посмотри детали:
   ```bash
   oc describe pod <pod-name>
   ```
   → Внизу увидишь:
   ```
   Liveness:   http-get http://:80/health delay=15s timeout=5s period=20s
   Readiness:  http-get http://:80/health delay=5s timeout=3s period=10s
   ```

---

## ⚠️ Распространённые ошибки

| Ошибка | Как исправить |
|------|----------------|
| `CrashLoopBackOff` | Увеличь `initialDelaySeconds` |
| Под не получает трафик | Проверь `readinessProbe` — возможно, `/health` не отвечает |
| Частые перезапуски | Увеличь `failureThreshold` или `periodSeconds` |
| Нет доступа к `/health` | Убедись, что приложение его предоставляет |

---

## 🚀 Дополнительно: `startupProbe`

Для приложений, которые стартуют **дольше 1 минуты** (например, Java с большим JAR):

```yaml
startupProbe:
  httpGet:
    path: /actuator/health
    port: 8080
  failureThreshold: 30
  periodSeconds: 10
  timeoutSeconds: 5
# Отключает liveness/readiness до успешного старта
```

---

## ✅ Итог

```yaml
readinessProbe:  # Готов к работе? Да/нет → включить в балансировку
livenessProbe:   # Упал? → перезапустить под
startupProbe:    # Медленный старт? → дать время, не убивая
```

---

Хочешь пример:
- Для **Node.js**
- Для **Python (Flask/Django)**
- С `exec` или `tcpSocket`
- Или с **OpenShift Routes / Ingress**

👉 Напиши: **"Нужен Flask"** или **"С exec"** — и я пришлю! ✅
