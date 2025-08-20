Отлично! Ниже — **пошаговая инструкция**, как развернуть **MySQL в Pod с PersistentVolumeClaim (PVC)** в Kubernetes или OpenShift с помощью `oc` / `kubectl`.

> 💡 Этот способ подходит для **тестов, демо, разработки**.  
> В продакшене лучше использовать **StatefulSet** и **Operator**, но для простого случая — Pod + PVC идеально.

---

## 🎯 Цель:
- Запустить **MySQL 8.0** в Pod
- Подключить **PVC** для сохранения данных
- Установить пароль root
- Открыть доступ

---

## ✅ Шаг 1: Создай PVC (для хранения данных MySQL)

```yaml
# pvc-mysql.yaml
apiVersion: v1
kind: PersistentVolumeClaim
meta
  name: mysql-pvc
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 5Gi
  storageClassName: standard  # Укажи свою, если нужно (или удали, если не важна)
```

Применить:
```bash
oc apply -f pvc-mysql.yaml
```

Проверить:
```bash
oc get pvc
```
→ Должно быть: `STATUS: Bound`

---

## ✅ Шаг 2: Создай Pod с MySQL

```yaml
# pod-mysql.yaml
apiVersion: v1
kind: Pod
meta
  name: mysql-pod
  labels:
    app: mysql
spec:
  containers:
  - name: mysql
    image: mysql:8.0
    env:
    - name: MYSQL_ROOT_PASSWORD
      value: "password123"  # ⚠️ В продакшене используй Secret!
    ports:
    - containerPort: 3306
    volumeMounts:
    - name: mysql-storage
      mountPath: /var/lib/mysql  # Директория данных MySQL
    resources:
      requests:
        memory: "1Gi"
        cpu: "500m"
      limits:
        memory: "2Gi"
        cpu: "1000m"
  volumes:
  - name: mysql-storage
    persistentVolumeClaim:
      claimName: mysql-pvc
  restartPolicy: Always
```

Применить:
```bash
oc apply -f pod-mysql.yaml
```

---

## ✅ Шаг 3: Создай Service (чтобы подключаться к MySQL)

```yaml
# service-mysql.yaml
apiVersion: v1
kind: Service
meta
  name: mysql-service
spec:
  selector:
    app: mysql
  ports:
    - protocol: TCP
      port: 3306
      targetPort: 3306
  type: ClusterIP  # Или NodePort, если нужен внешний доступ
```

Применить:
```bash
oc apply -f service-mysql.yaml
```

---

## ✅ Шаг 4: Проверка

### 1. Убедись, что Pod запущен:
```bash
oc get pod mysql-pod
```
→ Должно быть: `STATUS: Running`

### 2. Посмотри логи:
```bash
oc logs mysql-pod
```
→ Должно быть: `... MySQL init process done. Ready for start up.`

### 3. Подключись к MySQL изнутри Pod:
```bash
oc exec -it mysql-pod -- mysql -u root -p
```
→ Введи пароль: `password123`

---

## ✅ Шаг 5: Подключение снаружи (например, с локальной машины)

Если Service `type: NodePort`, найди порт:

```bash
oc get svc mysql-service
```
→ Например, `3306:31001/TCP`

Подключиcь:
```bash
mysql -h <node-ip> -P 31001 -u root -p
```

---

## 🔐 Шаг 6: (Опционально) Используй Secret для пароля

### Создай Secret:
```bash
oc create secret generic mysql-secret \
  --from-literal=MYSQL_ROOT_PASSWORD=password123
```

### Замени в Pod:
```yaml
env:
- name: MYSQL_ROOT_PASSWORD
  valueFrom:
    secretKeyRef:
      name: mysql-secret
      key: MYSQL_ROOT_PASSWORD
```

---

## 🧩 Альтернатива: Deployment (лучше для продакшена)

Если хочешь использовать **Deployment** вместо Pod:

```yaml
apiVersion: apps/v1
kind: Deployment
meta
  name: mysql-deployment
spec:
  replicas: 1
  selector:
    matchLabels:
      app: mysql
  template:
    meta
      labels:
        app: mysql
    spec:
      containers:
      - name: mysql
        image: mysql:8.0
        env:
        - name: MYSQL_ROOT_PASSWORD
          value: "password123"
        ports:
        - containerPort: 3306
        volumeMounts:
        - name: mysql-storage
          mountPath: /var/lib/mysql
      volumes:
      - name: mysql-storage
        persistentVolumeClaim:
          claimName: mysql-pvc
```

---

## 📌 Проверка команды

| Что проверить | Команда |
|--------------|--------|
| PVC | `oc get pvc` |
| Pod | `oc get pod mysql-pod` |
| Логи | `oc logs mysql-pod` |
| Service | `oc get svc mysql-service` |
| Вход в MySQL | `oc exec -it mysql-pod -- mysql -u root -p` |

---

## ⚠️ Важно

- **Не используй Pod в продакшене** — лучше **StatefulSet**
- **Всегда бэкапь данные**
- Используй **Secret**, а не plain text пароли
- PVC **не удаляется при удалении Pod** — данные сохранятся

---

## ✅ Удаление (если нужно)

```bash
oc delete pod mysql-pod
oc delete pvc mysql-pvc
oc delete service mysql-service
# PVC удалится отдельно, если нужно
```

---

Хочешь:
- Пример с **Helm**
- Автоматическую инициализацию БД (`.sql` файл)
- Подключение из другого Pod

👉 Напиши: **"С инициализацией"** или **"Через Helm"** — и я пришлю! 💾✅

