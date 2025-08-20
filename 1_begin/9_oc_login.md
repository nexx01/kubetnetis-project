# ====================================================
# Start-OpenShiftLogin.ps1
# Автовход в OpenShift — поддержка нескольких кластеров
# Запускается при входе пользователя
# ====================================================

$ErrorActionPreference = "Stop"

$baseDir = "$env:USERPROFILE\Documents\OpenShift"
$clustersDir = "$baseDir\clusters"
$tokensDir = "$baseDir\tokens"

# Проверка структуры
if (-not (Test-Path $clustersDir)) {
    Write-EventLog -LogName Application -Source "OpenShift MultiCluster" -EntryType Error -EventId 2001 -Message "Папка clusters не найдена: $clustersDir"
    Exit 1
}

# Создаём источник лога
$logSource = "OpenShift MultiCluster"
if (-not [System.Diagnostics.EventLog]::SourceExists($logSource)) {
    New-EventLog -LogName Application -Source $logSource
}

Write-Host "🔍 Поиск кластеров в $clustersDir..." -ForegroundColor Cyan

# Обрабатываем каждый кластер
Get-ChildItem $clustersDir -Filter "*.json" | ForEach-Object {
    try {
        $config = Get-Content $_.FullName | ConvertFrom-Json
        $tokenPath = "$tokensDir\$($config.Name).txt"

        if (-not (Test-Path $tokenPath)) {
            Write-Warning "❌ Токен не найден для кластера: $($config.Name)"
            Write-EventLog -LogName Application -Source $logSource -EntryType Warning -EventId 2002 -Message "Токен не найден: $($config.Name)"
            return
        }

        # Читаем токен
        $secureToken = Get-Content $tokenPath | ConvertTo-SecureString
        $bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secureToken)
        $plainToken = [Runtime.InteropServices.Marshal]::PtrToStringAuto($bstr)

        # Флаг --insecure-skip-tls-verify
        $insecureFlag = if ($config.Insecure) { "--insecure-skip-tls-verify=true" } else { "" }

        # Команда входа
        $loginCmd = "login --token=$plainToken --server=$($config.Server) $insecureFlag"
        Write-Host "🔐 Подключаюсь к $($config.DisplayName) ($($config.Name))..." -ForegroundColor Green

        $result = oc $loginCmd 2>&1
        $exitCode = $LASTEXITCODE

        if ($exitCode -eq 0) {
            Write-Host "✅ Успешный вход: $($config.DisplayName)" -ForegroundColor Green
            Write-EventLog -LogName Application -Source $logSource -EntryType Information -EventId 2000 -Message "Успешный вход в: $($config.DisplayName) ($($config.Name)) как $(oc whoami)"

            # Обновляем токен (на случай обновления)
            $newToken = oc whoami --show-token
            $newToken | ConvertTo-SecureString -AsPlainText -Force | ConvertFrom-SecureString | Set-Content $tokenPath
        } else {
            Write-Error "❌ Ошибка входа в $($config.DisplayName): $result"
            Write-EventLog -LogName Application -Source $logSource -EntryType Error -EventId 2003 -Message "Ошибка входа в: $($config.DisplayName). Код: $exitCode. Ошибка: $result"
        }
Отлично! Вот **расширенная версия скрипта с поддержкой нескольких OpenShift-кластеров**, автоматическим входом при старте и выбором активного кластера.

---

## 🌐 Что умеет скрипт?

✅ Поддержка нескольких кластеров  
✅ Автоматический вход при старте  
✅ Зашифрованное хранение токенов  
✅ Выбор активного кластера  
✅ Логирование в системный журнал  
✅ Автообновление токенов

---

## 📁 Структура

```
%USERPROFILE%\Documents\OpenShift\
├── clusters\
│   ├── cluster-prod.json      ← конфиг: prod
│   ├── cluster-dev.json       ← конфиг: dev
│   └── ...
├── tokens\
│   ├── prod.txt               ← зашифрованный токен
│   └── dev.txt
└── Start-OpenShiftLogin.ps1   ← основной скрипт
```

---

## 🔧 Шаг 1: Подготовка — создайте папки и конфиги

```powershell
# Создаём структуру
$base = "$env:USERPROFILE\Documents\OpenShift"
New-Item -Path "$base\clusters" -ItemType Directory -Force
New-Item -Path "$base\tokens" -ItemType Directory -Force
```

### Создайте конфиг для каждого кластера

#### Пример: `cluster-dev.json`

```powershell
@{
    Name        = "dev"
    DisplayName = "Development"
    Server      = "https://api.dev.ocp.example.com:6443"
    Insecure    = $true
} | ConvertTo-Json | Set-Content "$base\clusters\cluster-dev.json"
```

#### Пример: `cluster-prod.json`

```powershell
@{
    Name        = "prod"
    DisplayName = "Production"
    Server      = "https://api.prod.ocp.example.com:6443"
    Insecure    = $true
} | ConvertTo-Json | Set-Content "$base\clusters\cluster-prod.json"
```

---

## 🔐 Шаг 2: Сохраните токены (один раз)

Сначала вручную войдите в каждый кластер:

```powershell
oc login https://api.dev.ocp.example.com:6443 --username=testUser --password=testPassword --insecure-skip-tls-verify=true
$token = oc whoami --show-token
$token | ConvertTo-SecureString -AsPlainText -Force | ConvertFrom-SecureString | Set-Content "$base\tokens\dev.txt"

oc login https://api.prod.ocp.example.com:6443 --username=testUser --password=testPassword --insecure-skip-tls-verify=true
$token = oc whoami --show-token
$token | ConvertTo-SecureString -AsPlainText -Force | ConvertFrom-SecureString | Set-Content "$base\tokens\prod.txt"
```

---

## 📜 Шаг 3: Основной скрипт `Start-OpenShiftLogin.ps1`

Создайте:

```powershell
$scriptPath = "$env:USERPROFILE\Documents\OpenShift\Start-OpenShiftLogin.ps1"
New-Item -Path $scriptPath -Force
notepad $scriptPath
```

Вставьте:

```powershell
# ====================================================
# Start-OpenShiftLogin.ps1
# Автовход в OpenShift — поддержка нескольких кластеров
# Запускается при входе пользователя
# ====================================================

$ErrorActionPreference = "Stop"

$baseDir = "$env:USERPROFILE\Documents\OpenShift"
$clustersDir = "$baseDir\clusters"
$tokensDir = "$baseDir\tokens"

# Проверка структуры
if (-not (Test-Path $clustersDir)) {
    Write-EventLog -LogName Application -Source "OpenShift MultiCluster" -EntryType Error -EventId 2001 -Message "Папка clusters не найдена: $clustersDir"
    Exit 1
}

# Создаём источник лога
$logSource = "OpenShift MultiCluster"
if (-not [System.Diagnostics.EventLog]::SourceExists($logSource)) {
    New-EventLog -LogName Application -Source $logSource
}

Write-Host "🔍 Поиск кластеров в $clustersDir..." -ForegroundColor Cyan

# Обрабатываем каждый кластер
Get-ChildItem $clustersDir -Filter "*.json" | ForEach-Object {
    try {
        $config = Get-Content $_.FullName | ConvertFrom-Json
        $tokenPath = "$tokensDir\$($config.Name).txt"

        if (-not (Test-Path $tokenPath)) {
            Write-Warning "❌ Токен не найден для кластера: $($config.Name)"
            Write-EventLog -LogName Application -Source $logSource -EntryType Warning -EventId 2002 -Message "Токен не найден: $($config.Name)"
            return
        }

        # Читаем токен
        $secureToken = Get-Content $tokenPath | ConvertTo-SecureString
        $bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secureToken)
        $plainToken = [Runtime.InteropServices.Marshal]::PtrToStringAuto($bstr)

        # Флаг --insecure-skip-tls-verify
        $insecureFlag = if ($config.Insecure) { "--insecure-skip-tls-verify=true" } else { "" }

        # Команда входа
        $loginCmd = "login --token=$plainToken --server=$($config.Server) $insecureFlag"
        Write-Host "🔐 Подключаюсь к $($config.DisplayName) ($($config.Name))..." -ForegroundColor Green

        $result = oc $loginCmd 2>&1
        $exitCode = $LASTEXITCODE

        if ($exitCode -eq 0) {
            Write-Host "✅ Успешный вход: $($config.DisplayName)" -ForegroundColor Green
            Write-EventLog -LogName Application -Source $logSource -EntryType Information -EventId 2000 -Message "Успешный вход в: $($config.DisplayName) ($($config.Name)) как $(oc whoami)"

            # Обновляем токен (на случай обновления)
            $newToken = oc whoami --show-token
            $newToken | ConvertTo-SecureString -AsPlainText -Force | ConvertFrom-SecureString | Set-Content $tokenPath
        } else {
            Write-Error "❌ Ошибка входа в $($config.DisplayName): $result"
            Write-EventLog -LogName Application -Source $logSource -EntryType Error -EventId 2003 -Message "Ошибка входа в: $($config.DisplayName). Код: $exitCode. Ошибка: $result"
        }

        # Очистка
        $plainToken = ""
        [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr)
    } catch {
        Write-Error "🚨 Ошибка обработки $($_.Name): $_"
        Write-EventLog -LogName Application -Source $logSource -EntryType Error -EventId 2004 -Message "Ошибка кластера: $($_.Exception.Message)"
    }
}

Write-Host "🏁 Готово. Все кластеры обработаны." -ForegroundColor Yellow
```

---

## ⏱ Шаг 4: Добавьте в автозагрузку

Выполните в PowerShell:

```powershell
$Action = New-ScheduledTaskAction `
    -Execute "powershell.exe" `
    -Argument "-ExecutionPolicy Bypass -File `"$env:USERPROFILE\Documents\OpenShift\Start-OpenShiftLogin.ps1`""

$Trigger = New-ScheduledTaskTrigger -AtLogOn

$Settings = New-ScheduledTaskSettingsSet `
    -AllowStartIfOnBatteries `
    -DontStopIfGoingOnBatteries `
    -StartWhenAvailable

$Task = New-ScheduledTask -Action $Action -Trigger $Trigger -Settings $Settings

Register-ScheduledTask `
    -TaskName "OpenShift Multi-Cluster Auto Login" `
    -InputObject $Task `
    -User $env:USERNAME `
    -Description "Автоматический вход в несколько OpenShift-кластеров"
```

---

## 🧪 Проверка

1. Перезагрузите компьютер
2. Откройте PowerShell:
   ```powershell
   oc config current-context
   ```
   или
   ```powershell
   oc whoami --show-server
   ```

3. Проверьте журнал событий:
   - Откройте `Просмотр событий` → `Журналы Windows` → `Приложение`
   - Ищите источник `OpenShift MultiCluster`

---

## 🎯 Как переключаться между кластерами?

```powershell
# Посмотреть доступные контексты
oc config get-contexts

# Переключиться на dev
oc config use-context default/api-dev-ocp-example-com:6443/testUser

# Или на prod
oc config use-context default/api-prod-ocp-example-com:6443/testUser
```

---

## 🛡️ Безопасность

- Токены зашифрованы DPAPI
- Скрипт работает от имени пользователя
- Никаких паролей в открытом виде
- Все действия логируются

---

## ✅ Вывод

Теперь у вас:
- Поддержка **нескольких кластеров**
- **Автоматический вход** при старте
- **Безопасное хранение** токенов
- **Логирование** ошибок и успехов

---

## 🎁 Бонус: скрипт для переключения кластеров

Добавьте в `~\Documents\OpenShift\switch-cluster.ps1`:

```powershell
param([string]$ClusterName)

$contexts = oc config get-contexts -o name
$match = $contexts | Where-Object { $_ -like "*$ClusterName*" }

if ($match) {
    oc config use-context $match
    Write-Host "✅ Переключено на: $match" -ForegroundColor Green
} else {
    Write-Error "❌ Контекст с именем '$ClusterName' не найден"
}
```

Использование:
```powershell
.\switch-cluster.ps1 dev
.\switch-cluster.ps1 prod
```

---

✅ Готово! Теперь вы можете управлять **множеством кластеров** легко и безопасно.

Хочешь — могу:
- Сделать **GUI-выбор кластера** (с окном)
- Интегрировать с **системным треем**
- Добавить **уведомления о статусе**

Напиши: **"Да, дай GUI!"** 😊
