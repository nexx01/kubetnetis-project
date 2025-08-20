 Неделя 3: Сеть, Ingress, Helm
Цель: Научиться открывать приложения, использовать пакеты.

✅ Задачи:
Включи Ingress в Minikube:
bash


1
minikube addons enable ingress
Создай Ingress-ресурс:
app1.local → сервис 1
app2.local → сервис 2
Добавь TLS (самоподписанный сертификат через openssl).
Установи Helm.
Создай свой Helm-чарт для Nginx-приложения.
Установи чарт: helm install myapp ./mychart
🎯 Совет: Опубликуй Helm-чарт на GitHub Pages — покажешь на собеседовании. 
