@echo off
setlocal EnableExtensions EnableDelayedExpansion
chcp 65001 >nul

call :log "========================================"
call :log "   前端项目一键部署脚本"
call :log "========================================"
call :log ""

rem ===== 服务器和 SSH 配置（按需修改） =====
set "SERVER_USER=root"
set "SERVER_IP=142.171.169.111"
set "REMOTE_DIR=/opt/vertex-frontend"
set "ARCHIVE_NAME=dist.tar.gz"
rem Windows 本机 SSH 私钥路径，默认指向当前用户目录，可通过脚本第一个参数覆盖
set "SSH_KEY=%USERPROFILE%\.ssh\id_ed25519"
if not "%~1"=="" set "SSH_KEY=%~1"

rem 检查依赖命令
call :require_command ssh "未找到 ssh，请在 Windows 中启用 OpenSSH 客户端"
call :require_command scp "未找到 scp，请在 Windows 中启用 OpenSSH 客户端"
call :require_command tar "未找到 tar，请安装 GNU tar 或启用 Windows 11 内置 tar"

if not exist "%SSH_KEY%" (
    call :log "[错误] 找不到 SSH 私钥文件: \"%SSH_KEY%\""
    call :log "请先按照 ubuntu-ssh-setup.md 配置密钥登录，或在运行脚本时传入自定义密钥路径。"
    goto :abort
)

call :log "[1/3] 开始构建生产版本..."
call npm run build
if %errorlevel% neq 0 (
    call :log ""
    call :log "❌ 构建失败！请检查错误信息。"
    goto :abort
)
call :log "✅ 构建完成！"
call :log ""

call :log "[1.5/3] 打包 dist 文件夹..."
if exist "%ARCHIVE_NAME%" del /f /q "%ARCHIVE_NAME%"
tar -czf "%ARCHIVE_NAME%" dist
if %errorlevel% neq 0 (
    call :log ""
    call :log "❌ 打包失败！请确认本机已安装 tar 并且命令可用。"
    goto :abort
)
call :log "✅ 打包完成！"
call :log ""

call :log "[2/3] 准备上传到服务器..."
call :log "目标服务器: %SERVER_IP%"
call :log "目标路径: %REMOTE_DIR%/"
call :log ""

call :log "[3/3] 开始上传 %ARCHIVE_NAME% ..."
call :log "检查/创建远程目录..."
ssh -i "%SSH_KEY%" %SERVER_USER%@%SERVER_IP% "mkdir -p %REMOTE_DIR%/"
if %errorlevel% neq 0 (
    call :log ""
    call :log "❌ 创建远程目录失败！请检查 SSH 配置与权限。"
    goto :abort
)
call :log "✅ 远程目录已准备。"

call :log "清理远程旧文件..."
ssh -i "%SSH_KEY%" %SERVER_USER%@%SERVER_IP% "rm -rf %REMOTE_DIR%/dist %REMOTE_DIR%/%ARCHIVE_NAME%"
if %errorlevel% neq 0 (
    call :log ""
    call :log "❌ 远程清理失败！请检查 SSH 配置与权限。"
    goto :abort
)
call :log "✅ 远程旧文件已清空。"

call :log "正在通过 SSH 密钥上传压缩包..."
scp -i "%SSH_KEY%" "%ARCHIVE_NAME%" %SERVER_USER%@%SERVER_IP%:%REMOTE_DIR%/
if %errorlevel% neq 0 (
    call :log ""
    call :log "❌ 上传失败！请检查服务器参数与网络。"
    goto :abort
)
call :log "✅ 上传完成！"

call :log "解压远程压缩包..."
ssh -i "%SSH_KEY%" %SERVER_USER%@%SERVER_IP% "cd %REMOTE_DIR%/ && tar -xzf %ARCHIVE_NAME% && rm -f %ARCHIVE_NAME%"
if %errorlevel% neq 0 (
    call :log ""
    call :log "❌ 解压失败！请检查远程 tar 与权限设置。"
    goto :abort
)
call :log "✅ 远程解压完成。"

call :log "清理本地打包文件..."
del /f /q "%ARCHIVE_NAME%" >nul 2>&1
call :log "✅ 本地临时文件已清理。"
call :log ""

call :log "========================================"
call :log "✅ 部署成功！"
call :log "========================================"
call :log "访问地址: http://%SERVER_IP%"
call :log ""
pause
goto :EOF

:log
setlocal EnableDelayedExpansion
set "msg=%~1"
if defined msg (
    echo(!msg!
) else (
    echo.
)
endlocal
goto :EOF

:require_command
where %~1 >nul 2>&1
if %errorlevel% neq 0 (
    call :log "[错误] %~2"
    goto :abort
)
goto :EOF

:abort
call :log ""
pause
exit /b 1
