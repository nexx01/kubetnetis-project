Отлично! Ниже — как **авторизоваться в OpenShift** с пользователем `testUser` и паролем `testPassword`, а также как **автоматизировать вход** через CLI (`oc`).

---

## 🔐 Шаг 1: Вход в OpenShift через `oc login`

Если у тебя уже установлен `oc` (OpenShift CLI), выполните:

```bash
oc login https://your-openshift-cluster:6443 --username=testUser --password=testPassword
```

> 🔁 Замените `https://your-openshift-cluster:6443` на реальный адрес вашего OpenShift-кластера.

Пример:
```bash
oc login https://api.ocp.example.com:6443 --username=testUser --password=testPassword
```

✅ Вывод:
```
Login successful.

You don't have any projects. You can try to create a new project, by running:
    oc new-project <projectname>
```

---

## 🌐 Как узнать адрес кластера?

Если вы используете:
- **OpenShift Developer Sandbox** — адрес: `https://api.sandbox.x8i5.p1.openshiftapps.com:6443`
- **Локальный CRC (CodeReady Containers)** — `oc login -u kubeadmin -p <password> https://api.crc.testing:6443`
- **Корпоративный кластер** — спросите у администратора

---

## ✅ Проверка авторизации

```bash
oc whoami
# Вывод: testUser

oc whoami --show-server
# Покажет URL сервера

oc get projects
# Посмотреть доступные проекты
```

---

## 🧱 Если вход не проходит

### ❌ Ошибка: `x509: certificate signed by unknown authority`

Решение: добавьте флаг `--insecure-skip-tls-verify=true`

```bash
oc login https://api.your-cluster.com:6443 \
  --username=testUser \
  --password=testPassword \
  --insecure-skip-tls-verify=true
```

> ⚠️ Используйте только в тестовых средах! Это отключает проверку SSL.

---

## 🔁 Автоматизация входа (для скриптов)

### Вариант 1: Прямой логин в скрипте

```bash
#!/bin/bash
OC_SERVER="https://api.your-cluster.com:6443"
USER="testUser"
PASS="testPassword"

oc login "$OC_SERVER" --username="$USER" --password="$PASS" --insecure-skip-tls-verify=true
```

Сохраните как `login-openshift.sh`, сделайте исполняемым:

```bash
chmod +x login-openshift.sh
./login-openshift.sh
```

---

### Вариант 2: Использование токена (рекомендуется)

После первого входа, OpenShift выдаёт **токен**, который можно использовать без пароля:

```bash
# Получить токен
TOKEN=$(oc whoami --show-token)

# Использовать в следующий раз
oc login --token=$TOKEN --server=https://api.your-cluster.com:6443
```

#### Автоматизация с токеном:

```bash
# Сохраните токен (один раз после входа)
oc whoami --show-token > ~/.oc-token

# Вход по токену
TOKEN=$(cat ~/.oc-token)
oc login --token=$TOKEN --server=https://api.your-cluster.com:6443
```

---

## 💡 Советы

| Приём | Как |
|------|-----|
| Сохранить логин/пароль в переменных | `export OC_USER=testUser` |
| Не хранить пароль в истории | Войдите вручную, потом используйте `oc whoami --show-token` |
| Переключиться на проект | `oc project my-project` или `oc project default` |
| Выйти | `oc logout` |

---

## 🧰 Обновлённый скрипт: `login-openshift.sh`

```bash
#!/bin/bash

# login-openshift.sh — автоматический вход в OpenShift

OC_SERVER="https://api.your-cluster.com:6443"  # ← Замени на свой
USER="testUser"
PASS="testPassword"

echo "🔐 Вход в OpenShift: $OC_SERVER"
oc login "$OC_SERVER" \
  --username="$USER" \
  --password="$PASS" \
  --insecure-skip-tls-verify=true

if [ $? -eq 0 ]; then
  echo "✅ Успешно вошли как $USER"
  echo "📌 Текущий проект: $(oc project -q)"
else
  echo "❌ Ошибка входа"
  exit 1
fi
```

---

## ✅ Что делать после входа?

```bash
# Посмотреть проекты
oc get projects

# Создать проект
oc new-project myapp

# Переключиться
oc project myapp

# Запустить под
oc create deployment hello --image=nginx
oc expose deployment hello --port=80 --type=NodePort

# Посмотреть логи
stern -l app=hello
```

---

## 🚨 Безопасность

- Не храните пароли в скриптах в открытом виде.
- Используйте **токены** или **сервисные аккаунты** в продакшене.
- Для CI/CD — создавайте отдельные `ServiceAccount` с минимальными правами.

---

✅ Готово! Теперь вы можете:
- Входить в OpenShift по логину/паролю
- Автоматизировать вход
- Использовать `oc` и `stern` вместе

Отличный вопрос! В Windows **нельзя хранить пароли в открытом виде** в скриптах — это небезопасно. Вместо этого нужно использовать **безопасные механизмы хранения учетных данных**, такие как:

- 🔐 **Windows Credential Manager** (диспетчер учётных данных)
- 🗝 **DPAPI** (Data Protection API) — шифрование на уровне ОС
- 🪪 **Service Accounts / Tokens** (лучше всего для автоматизации)

---

## ✅ Цель
Хранить пароль от OpenShift (`testPassword`) безопасно и использовать его в PowerShell-скрипте без отображения в открытом виде.

---

## 🛠 Вариант 1: Использовать Windows Credential Manager

### ✅ Плюсы:
- Учётные данные хранятся в защищённом хранилище Windows
- Доступ только под вашей учётной записью
- Поддерживается PowerShell

---

### Шаг 1: Сохранить пароль через PowerShell

Запустите **PowerShell от имени пользователя** (не обязательно администратора):

```powershell
# Установите имя учётной записи (например, openshift-testUser)
$credential = Get-Credential

# При появлении окна введите:
#   Имя пользователя: testUser
#   Пароль: testPassword
```

Теперь сохраните в Credential Manager:

```powershell
# Имя, под которым сохраните (например, "OpenShift-testUser")
$name = "OpenShift-testUser"

# Сохраняем
$credential.Password | ConvertFrom-SecureString | Set-Content "$env:USERPROFILE\Documents\$name.txt"
```

> 🔐 Пароль сохраняется в зашифрованном виде, **только для вашего пользователя**

---

### Шаг 2: Использовать в скрипте

Создайте скрипт `login-openshift.ps1`:

```powershell
# login-openshift.ps1

$name = "OpenShift-testUser"
$path = "$env:USERPROFILE\Documents\$name.txt"

if (-Not (Test-Path $path)) {
    Write-Error "Учётные данные не найдены. Запустите setup.ps1 сначала."
    exit 1
}

# Читаем зашифрованный пароль
$securePassword = Get-Content $path | ConvertTo-SecureString
$credential = New-Object System.Management.Automation.PSCredential("testUser", $securePassword)

$username = $credential.Username
$plainPassword = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [Runtime.InteropServices.Marshal]::SecureStringToBSTR($credential.Password)
)

$server = "https://api.your-cluster.com:6443"

Write-Host "🔐 Вход в OpenShift как $username..." -ForegroundColor Green

# Выполняем oc login
$loginCmd = "login `"$server`" --username=`"$username`" --password=`"$plainPassword`" --insecure-skip-tls-verify=true"
oc $loginCmd

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Успешный вход в OpenShift" -ForegroundColor Green
    Write-Host "📌 Текущий проект: $(oc project -q)" -ForegroundColor Yellow
} else {
    Write-Error "❌ Ошибка входа в OpenShift"
}

# Очистка (опционально)
$plainPassword = ""
```

---

### Запуск

```powershell
.\login-openshift.ps1
```

---

## 🧱 Вариант 2: Простой способ (только для тестов!)

> ⚠️ **Не используйте в продакшене или на рабочих машинах**

Создайте файл `config.ps1` (добавьте в `.gitignore`):

```powershell
# config.ps1 (не включайте в репозиторий!)
$env:OPENSHIFT_USER = "testUser"
$env:OPENSHIFT_PASS = "testPassword"
```

И в основном скрипте:

```powershell
. .\config.ps1

oc login https://api.your-cluster.com:6443 `
  --username=$env:OPENSHIFT_USER `
  --password=$env:OPENSHIFT_PASS `
  --insecure-skip-tls-verify=true
```

---

## 🏆 Рекомендуемый способ: Использовать **токен** (лучше пароля!)

1. Войдите вручную один раз:
   ```powershell
   oc login https://api.your-cluster.com:6443 --username=testUser --password=testPassword --insecure-skip-tls-verify=true
   ```

2. Получите токен:
   ```powershell
   $token = oc whoami --show-token
   ```

3. Сохраните токен зашифрованно:

   ```powershell
   $token | ConvertTo-SecureString -AsPlainText -Force | ConvertFrom-SecureString | Set-Content "$env:USERPROFILE\Documents\openshift-token.txt"
   ```

4. Используйте в скрипте:

   ```powershell
   $token = Get-Content "$env:USERPROFILE\Documents\openshift-token.txt" | ConvertTo-SecureString
   $plainToken = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($token))

   oc login --token=$plainToken --server=https://api.your-cluster.com:6443 --insecure-skip-tls-verify=true
   ```

---

## 🔐 Безопасность: советы

| Что делать | Как |
|----------|-----|
| ❌ Не хранить пароль в открытом виде | Никогда в `.ps1`, `.sh`, `.env` |
| ✅ Использовать DPAPI | `ConvertTo-SecureString` |
| ✅ Использовать токены | `oc whoami --show-token` |
| ✅ Добавить в `.gitignore` | `config.ps1`, `*.txt` с паролями |
| ✅ Ограничить права | Используйте ServiceAccount с минимальными правами |

---

## 🧰 Полезные команды

```powershell
# Проверить вход
oc whoami

# Показать токен
oc whoami --show-token

# Выйти
oc logout
```

---

## ✅ Вывод

| Способ | Когда использовать |
|-------|---------------------|
| **Credential + SecureString** | Локальная разработка, PowerShell |
| **Токен + зашифрованный файл** | Автоматизация, скрипты |
| **Вручную (ввод пароля)** | Самый безопасный способ |
| **Переменные среды** | Только для тестов, не в Git |

