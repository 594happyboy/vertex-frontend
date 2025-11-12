@echo off
chcp 65001 >nul
echo ========================================
echo    前端项目一键部署脚本
echo ========================================
echo.

set SERVER_IP=142.171.169.111

echo [1/3] 开始构建生产版本...
call npm run build
if %errorlevel% neq 0 (
    echo.
    echo ❌ 构建失败！请检查错误信息。
    pause
    exit /b 1
)
echo ✅ 构建完成！
echo.

echo [1.5/3] 打包 dist 文件夹...
if exist dist.tar.gz del /f /q dist.tar.gz
tar -czf dist.tar.gz dist
if %errorlevel% neq 0 (
    echo.
    echo ❌ 打包失败！请确认本机已安装 tar 并且命令可用。
    pause
    exit /b 1
)
echo ✅ 打包完成！
echo.

echo [2/3] 准备上传到服务器...
echo 目标服务器: %SERVER_IP%
echo 目标路径: /opt/vertex-frontend/
echo.

echo [3/3] 开始上传 dist.tar.gz ...
echo 检查远程目录是否存在...
ssh root@%SERVER_IP% "mkdir -p /opt/vertex-frontend/"
if %errorlevel% neq 0 (
    echo.
    echo ❌ 创建远程目录失败！请检查：
    echo    1. SSH 是否配置正确
    echo    2. 目标路径是否有写入权限
    echo    3. 服务器状态是否正常
    pause
    exit /b 1
)
echo 清理远程旧文件...
ssh root@%SERVER_IP% "rm -rf /opt/vertex-frontend/dist /opt/vertex-frontend/dist.tar.gz"
if %errorlevel% neq 0 (
    echo.
    echo ❌ 远程清理失败！请检查 SSH 配置与权限。
    pause
    exit /b 1
)
echo 请在提示时输入服务器密码: 
scp dist.tar.gz root@%SERVER_IP%:/opt/vertex-frontend/
if %errorlevel% neq 0 (
    echo.
    echo ❌ 上传失败！请检查：
    echo    1. 服务器 IP 和密码是否正确
    echo    2. 目标路径是否存在
    echo    3. 是否安装了 OpenSSH 客户端
    pause
    exit /b 1
)

echo 解压远程压缩包...
ssh root@%SERVER_IP% "cd /opt/vertex-frontend/ && tar -xzf dist.tar.gz && rm -f dist.tar.gz"
if %errorlevel% neq 0 (
    echo.
    echo ❌ 解压失败！请检查远程是否安装 tar 或路径权限。
    pause
    exit /b 1
)

echo 清理本地打包文件...
del /f /q dist.tar.gz >nul 2>&1


echo.
echo ========================================
echo ✅ 部署成功！
echo ========================================
echo 访问地址: http://%SERVER_IP%
echo.
pause

