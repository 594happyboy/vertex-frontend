@echo off
chcp 65001 >nul
echo ========================================
echo Vue 3 前端项目创建脚本
echo ========================================
echo.

echo [检查] 检查Node.js是否安装...
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js未安装
    echo.
    echo 请先安装Node.js：
    echo 1. 访问 https://nodejs.org/
    echo 2. 下载LTS版本
    echo 3. 安装后重启电脑
    echo 4. 重新运行此脚本
    echo.
    pause
    exit /b 1
)
echo ✅ Node.js已安装

echo.
echo [检查] 检查npm是否可用...
npm -v >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm不可用
    pause
    exit /b 1
)
echo ✅ npm可用

echo.
echo [配置] 设置npm淘宝镜像（加速下载）...
npm config set registry https://registry.npmmirror.com
echo ✅ 镜像配置完成

echo.
echo [1/5] 返回上级目录...
cd ..
echo 当前目录：%CD%

echo.
echo [2/5] 创建Vue 3项目（需要1-2分钟）...
echo 项目名称：multifunctional-frontend
echo 使用JavaScript模板（简单易学）
echo.
call npm create vite@latest multifunctional-frontend -- --template vue
if %errorlevel% neq 0 (
    echo ❌ 项目创建失败
    pause
    exit /b 1
)
echo ✅ 项目创建成功

echo.
echo [3/5] 进入项目目录...
cd multifunctional-frontend
echo 当前目录：%CD%

echo.
echo [4/5] 安装项目依赖（需要2-5分钟）...
echo 正在安装基础依赖...
call npm install
if %errorlevel% neq 0 (
    echo ❌ 依赖安装失败
    pause
    exit /b 1
)
echo ✅ 基础依赖安装完成

echo.
echo 正在安装UI库和工具...
call npm install element-plus axios @element-plus/icons-vue
if %errorlevel% neq 0 (
    echo ❌ UI库安装失败
    pause
    exit /b 1
)
echo ✅ UI库安装完成

echo.
echo [5/5] 创建项目目录结构...
mkdir src\api src\components src\views src\types src\utils 2>nul
echo ✅ 目录创建完成

echo.
echo ========================================
echo 🎉 前端项目创建成功！
echo ========================================
echo.
echo 📁 项目位置：%CD%
echo.
echo 📝 下一步操作：
echo 1. 在Cursor中打开前端项目文件夹
echo    文件 → 打开文件夹 → 选择 multifunctional-frontend
echo.
echo 2. 参考《前端项目创建指南-安卓开发者版.md》进行配置
echo    - 配置 src/main.ts
echo    - 配置 vite.config.ts
echo    - 创建页面和组件
echo.
echo 3. 启动开发服务器
echo    在前端项目目录执行：npm run dev
echo.
echo 4. 浏览器访问：http://localhost:5173/
echo.
echo ========================================
echo.
pause

