## 在 Ubuntu 上配置 SSH 免密登录用于部署 vertex-frontend

本文档说明如何在 **Ubuntu 服务器** 上配置 SSH，并在 **本地 Windows 开发机** 上生成密钥，实现 `deploy-to-cloud.bat` 全自动部署（无需每次输入密码）。

### 1. 在 Ubuntu 上安装并启动 SSH 服务

在 VPS 上以 root 或具有 sudo 权限的用户登录终端，执行：

```bash
sudo apt update
sudo apt install -y openssh-server

# 启动并设置开机自启
sudo systemctl enable --now ssh

# 查看状态（可选）
sudo systemctl status ssh
```

如果 `status` 显示为 `active (running)`，说明 SSH 服务已正常运行。

### 2. 在 Windows 本机生成 SSH 密钥

在 Windows 上打开终端（cmd / PowerShell / Windows Terminal 均可），执行：

```bash
ssh-keygen -t ed25519 -C "vertex-frontend-deploy"
```

交互说明：

1. 提示保存路径时，直接回车使用默认：
   - 一般为：`C:\Users\<你的用户名>\.ssh\id_ed25519`
2. 提示输入密码（passphrase）时，可以直接回车表示不设置；如果是生产环境并且你能接受每次输入一次密钥密码，也可以设置一个。

生成完成后，会得到：

- 私钥：`%USERPROFILE%\.ssh\id_ed25519`
- 公钥：`%USERPROFILE%\.ssh\id_ed25519.pub`

私钥只能保存在你自己的电脑上，不要上传到任何服务器或代码仓库。

### 3. 将公钥添加到 Ubuntu 服务器

1. 先用原来的方式（账号 + 密码）登录到 VPS：

   ```bash
   ssh root@<服务器 IP>
   ```

2. 在 VPS 上创建 `~/.ssh` 目录并设置权限：

   ```bash
   mkdir -p ~/.ssh
   chmod 700 ~/.ssh
   ```

3. 把 Windows 本机的公钥内容追加到 `~/.ssh/authorized_keys`。

   在 Windows 上，用编辑器打开：

   ```text
   %USERPROFILE%\.ssh\id_ed25519.pub
   ```

   复制里面整行内容（以 `ssh-ed25519` 开头）。

   在 VPS 上执行：

   ```bash
   nano ~/.ssh/authorized_keys
   ```

   将复制的那一行粘贴进去（可放在最后一行），保存并退出。然后设置权限：

   ```bash
   chmod 600 ~/.ssh/authorized_keys
   ```

> 也可以使用 `scp` 或其他方式把 `id_ed25519.pub` 文件传到服务器，再用 `cat id_ed25519.pub >> ~/.ssh/authorized_keys` 追加，效果一样。

### 4. 测试免密登录

在 Windows 终端中执行（注意替换 IP）：

```bash
ssh -i "%USERPROFILE%\.ssh\id_ed25519" root@142.171.169.111
```

首次连接时，会提示：

```text
The authenticity of host '142.171.169.111 (142.171.169.111)' can't be established.
...
Are you sure you want to continue connecting (yes/no/[fingerprint])?
```

输入 `yes` 回车后，如果能直接登录而 **不再提示输入密码**，说明免密登录配置成功。

之后 `deploy-to-cloud.bat` 会复用同一套配置，不会再弹出密码输入。

### 5.（可选）在服务器上关闭密码登录

如果你希望更安全一些，可以在确认密钥登录稳定后，关闭传统密码登录（谨慎操作，务必先确认密钥登录没有问题）。

在 VPS 上编辑 SSH 配置：

```bash
sudo nano /etc/ssh/sshd_config
```

确保有以下配置（如果有同名行，修改为如下值；没有就添加）：

```text
PasswordAuthentication no
PubkeyAuthentication yes
```

保存后重启 SSH 服务：

```bash
sudo systemctl restart ssh
```

此后即使知道 root 密码，也无法通过密码登录，只能通过配置好的 SSH 密钥登录。

### 6. 与 deploy-to-cloud.bat 的配合使用

在项目根目录的 `deploy-to-cloud.bat` 中，会有类似配置（示例）：

```bat
set "SERVER_USER=root"
set "SERVER_IP=142.171.169.111"
set "REMOTE_DIR=/opt/vertex-frontend"
set "SSH_KEY=%USERPROFILE%\.ssh\id_ed25519"
```

以及后续的调用：

```bat
ssh -i "%SSH_KEY%" %SERVER_USER%@%SERVER_IP% "mkdir -p %REMOTE_DIR%/"
scp -i "%SSH_KEY%" dist.tar.gz %SERVER_USER%@%SERVER_IP%:%REMOTE_DIR%/
ssh -i "%SSH_KEY%" %SERVER_USER%@%SERVER_IP% "cd %REMOTE_DIR%/ && tar -xzf dist.tar.gz && rm -f dist.tar.gz"
```

只要按本文档配置好密钥登录，`deploy-to-cloud.bat` 在执行这些命令时就不会再要求你输入密码，实现全自动部署。

