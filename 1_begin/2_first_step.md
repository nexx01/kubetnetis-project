## 🚀 Персональный план: Kubernetes за 4 недели (для трудоустройства)

> 💼 Фокус: **практика + реальные кейсы + подготовка к собеседованиям**

---

### 📅 **Неделя 1: Основы Kubernetes (на Minikube)**

**Цель**: Научиться управлять объектами K8s, писать YAML, отлаживать.

#### ✅ Задачи:
1. Установи:
   - Docker Desktop (или standalone Docker)
   - `kubectl`
   - `minikube` → `minikube start --driver=docker`
2. Запусти Pod:
   ```bash
   kubectl run hello-pod --image=nginx --port=80
   ```
3. Создай Deployment в YAML:
   ```yaml
   # deployment.yaml
   apiVersion: apps/v1
   kind: Deployment
   meta
     name: nginx-deployment
   spec:
     replicas: 3
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
           image: nginx:1.25
           ports:
           - containerPort: 80
   ```
   Примени: `kubectl apply -f deployment.yaml`
4. Создай Service (NodePort):
   ```yaml
   # service.yaml
   apiVersion: v1
   kind: Service
   meta
     name: nginx-service
   spec:
     selector:
       app: nginx
     ports:
       - protocol: TCP
         port: 80
         targetPort: 80
     type: NodePort
   ```
   Открой в браузере: `minikube service nginx-service`
5. Потренируйся в отладке:
   - `kubectl describe pod <name>`
   - `kubectl logs <pod>`
   - `kubectl exec -it <pod> -- sh`

> 🔁 **Повтори с другим образом (например, Redis или простое Python-приложение)**

---

### 📅 **Неделя 2: Production-подобные объекты**

**Цель**: Научиться работать с конфигурацией, безопасностью, томами.

#### ✅ Задачи:
1. Создай `ConfigMap` и `Secret` для приложения (например, с переменными `APP_ENV=prod`, `DB_PASSWORD`).
2. Подключи их в Pod как переменные окружения или файлы.
3. Создай `PersistentVolume` и `PersistentVolumeClaim`:
   - Подключи том к Pod (например, для хранения данных Nginx или БД).
4. Настрой `Liveness` и `Readiness` пробы.
5. Разверни **MySQL** в Pod + PVC.
6. Создай `Namespace` для staging/production.

> 📂 Пришли код на GitHub — это уже **начало портфолио**.

---

### 📅 **Неделя 3: Сеть, Ingress, Helm**

**Цель**: Научиться открывать приложения, использовать пакеты.

#### ✅ Задачи:
1. Включи Ingress в Minikube:
   ```bash
   minikube addons enable ingress
   ```
2. Создай Ingress-ресурс:
   - `app1.local` → сервис 1
   - `app2.local` → сервис 2
3. Добавь TLS (самоподписанный сертификат через `openssl`).
4. Установи Helm.
5. Создай свой Helm-чарт для Nginx-приложения.
6. Установи чарт: `helm install myapp ./mychart`

> 🎯 Совет: Опубликуй Helm-чарт на GitHub Pages — покажешь на собеседовании.

---

### 📅 **Неделя 4: CI/CD + Мониторинг + Портфолио**

**Цель**: Сделать проект, как в реальной компании.

#### ✅ Задачи:
1. Возьми простое приложение (например, [Flask или Node.js](https://github.com/bretfisher/udemy-docker-ci)).
2. Напиши Dockerfile.
3. Создай K8s-манифесты (Deployment, Service, Ingress).
4. Настрой **CI/CD через GitHub Actions**:
   - При push в `main` → сборка образа → отправка в Docker Hub → деплой в Minikube (или в облако, если есть).
5. Установи **Prometheus + Grafana**:
   - Используй Helm: `helm repo add prometheus-community https://prometheus-community.github.io/helm-charts`
   - `helm install prom prometheus-community/kube-prometheus-stack`
6. Сделай дашборд: CPU, память, количество подов.

> 🏁 **Финал**: Залей всё в **GitHub-репозиторий** с `README.md`:
> - Как запустить
> - Скриншоты
> - Архитектура

---
