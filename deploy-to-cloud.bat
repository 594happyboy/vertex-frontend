@echo off
chcp 65001 >nul
echo ========================================
echo    前端项目一键部署脚本
echo ========================================
echo.

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

echo [2/3] 准备上传到服务器...
echo 目标服务器: 47.109.191.242
echo 目标路径: /opt/vertex-frontend/
echo.

echo [3/3] 开始上传 dist 文件夹...
echo 请在提示时输入服务器密码: Zzy654322
scp -r dist root@47.109.191.242:/opt/vertex-frontend/
if %errorlevel% neq 0 (
    echo.
    echo ❌ 上传失败！请检查：
    echo    1. 服务器 IP 和密码是否正确
    echo    2. 目标路径是否存在
    echo    3. 是否安装了 OpenSSH 客户端
    pause
    exit /b 1
)

echo.
echo ========================================
echo ✅ 部署成功！
echo ========================================
echo 访问地址: http://47.109.191.242
echo.
pause

