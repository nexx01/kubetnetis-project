Отлично! Ниже — **пошаговое руководство**, как создать **PersistentVolume (PV)** и **PersistentVolumeClaim (PVC)**, а затем подключить их к **Pod** для хранения данных (например, веб-файлов Nginx или данных базы данных).

---

## 🎯 Цель:
- Создать **PV** (объём хранения на узле)
- Создать **PVC** (запрос на использование этого объёма)
- Подключить PVC к **Pod с Nginx**, чтобы сохранять веб-файлы между перезапусками

---

## 🛠 Шаг 1: Создай директорию на узле (для `hostPath`)

> ⚠️ Этот пример использует `hostPath` — подходит для **локального кластера** (Minikube, kind, локальный k8s).  
> В продакшене (например, в облаке) используй `gcePersistentDisk`, `awsElasticBlockStore`, `nfs` и т.д.

На **рабочем узле** (или локальной машине, если Minikube) создай директорию:

```bash
sudo mkdir -p /mnt/data
echo "Hello from persistent storage!" > /mnt/data/index.html
```

---

## 📄 Шаг 2: Создай PersistentVolume (PV)

```yaml
# pv.yaml
apiVersion: v1
kind: PersistentVolume
metadata:
  name: nginx-pv
spec:
  capacity:
    storage: 1Gi
  volumeMode: Filesystem
  accessModes:
    - ReadWriteOnce
  persistentVolumeReclaimPolicy: Retain
  storageClassName: manual
  hostPath:
    path: /mnt/data
```

Применить:
```bash
kubectl apply -f pv.yaml
```

Проверить:
```bash
kubectl get pv
```
Должно быть: `STATUS: Available`

---

## 📄 Шаг 3: Создай PersistentVolumeClaim (PVC)

```yaml
# pvc.yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: nginx-pvc
spec:
  storageClassName: manual
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 1Gi
```

Применить:
```bash
kubectl apply -f pvc.yaml
```

Проверить:
```bash
kubectl get pvc
```
Должно быть: `STATUS: Bound`

---

## 📄 Шаг 4: Создай Pod с Nginx и подключённым PVC

```yaml
# pod-nginx.yaml
apiVersion: v1
kind: Pod
metadata:
  name: nginx-pod
spec:
  containers:
    - name: nginx
      image: nginx:alpine
      ports:
        - containerPort: 80
      volumeMounts:
        - name: nginx-storage
          mountPath: /usr/share/nginx/html
  volumes:
    - name: nginx-storage
      persistentVolumeClaim:
        claimName: nginx-pvc
```

Применить:
```bash
kubectl apply -f pod-nginx.yaml
```

---

## ✅ Проверка

1. Убедись, что Pod запущен:
```bash
kubectl get pod nginx-pod
```

2. Проверь, что файл из PV доступен:
```bash
kubectl exec nginx-pod -- cat /usr/share/nginx/html/index.html
```
Вывод:
```
Hello from persistent storage!
```

3. Открой Nginx в браузере (если есть доступ):
```bash
kubectl port-forward nginx-pod 8080:80
```
→ Открой [http://localhost:8080](http://localhost:8080) — увидишь текст.

---

## 🔁 Что будет при перезапуске?

Если удалить Pod:
```bash
kubectl delete pod nginx-pod
kubectl apply -f pod-nginx.yaml
```

→ Новый Pod **снова подключится к тому же PVC** → данные **сохранятся**.

---

## 🧩 Важные моменты

| Параметр | Значение | Пояснение |
|--------|--------|----------|
| `accessModes` | `ReadWriteOnce` | Только один узел может читать/писать |
| `persistentVolumeReclaimPolicy` | `Retain` | После удаления PVC данные **не удаляются** |
| `storageClassName` | `manual` | Должно совпадать в PV и PVC |
| `volumeMode` | `Filesystem` | Для обычных файлов (не блочных устройств) |

> 💡 Чтобы удалить данные, нужно вручную удалить содержимое `/mnt/data` и сам PV.

---

## 🚀 Альтернатива: Deployment + PVC

Если хочешь использовать **Deployment** (лучше для продакшена):

```yaml
# deployment-nginx.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx-deployment
spec:
  replicas: 1
  selector:
    matchLabels:
      app: nginx
  template:
    metadata:
      labels:
        app: nginx
    spec:
      containers:
        - name: nginx
          image: nginx:alpine
          ports:
            - containerPort: 80
          volumeMounts:
            - name: nginx-storage
              mountPath: /usr/share/nginx/html
      volumes:
        - name: nginx-storage
          persistentVolumeClaim:
            claimName: nginx-pvc
```

---

## 🧰 Проверка команды

```bash
kubectl get pv          # Посмотреть все PV
kubectl get pvc         # Посмотреть PVC
kubectl get pod         # Проверить Pod
kubectl describe pvc nginx-pvc  # Подробности о привязке
```

---

## ✅ Итог

Ты создал:
- **PersistentVolume** → физическое хранилище
- **PersistentVolumeClaim** → запрос на использование
- **Pod** → использует PVC для сохранения данных

Теперь данные Nginx (или БД, например, MySQL) **не потеряются при перезапуске**.

---

Нужен пример с **MySQL** или **PostgreSQL**? Напиши: **"Да, с БД"** — и я пришлю! 💾✨
