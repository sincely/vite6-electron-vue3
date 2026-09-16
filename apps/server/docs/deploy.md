# 部署文档

## Docker 部署 MySQL 8.4.11 完整使用说明

本文档从零开始，涵盖拉取镜像、初始化密码、启动容器、指定端口的完整流程。

---

## 一、拉取 MySQL 镜像

```bash
docker pull mysql:8.4.11
```

拉取完成后，用以下命令确认镜像存在：

```bash
docker images | grep mysql
```

看到类似输出即成功：

```text
mysql    8.4.11    xxxxxxxxxxxx    2 weeks ago    600MB
```

> 如果你用的是自定义镜像名（如 `mysql-8.4.11`），把命令里的 `mysql:8.4.11` 换成你的镜像名即可。

---

## 二、初始化 root 密码

MySQL 8 镜像首次启动时会强制要求设置 root 密码，通过环境变量传入，三选一：

| 环境变量 | 说明 | 适用场景 |
| --- | --- | --- |
| `MYSQL_ROOT_PASSWORD=密码` | 指定 root 密码 | 推荐，生产/开发都可用 |
| `MYSQL_ALLOW_EMPTY_PASSWORD=yes` | 允许空密码 | 仅本地临时测试，极不安全 |
| `MYSQL_RANDOM_ROOT_PASSWORD=yes` | 自动生成随机密码 | 密码会打印在容器日志里 |

本文档以 `MYSQL_ROOT_PASSWORD=123456` 为例。

> **关键点**：这个环境变量**只在数据目录首次初始化时生效**。一旦数据目录里已有数据，再改这个变量无效，必须用 SQL 命令改密码（见第七节）。

---

## 三、启动容器并指定端口

### 3.1 端口映射格式

```text
-p 宿主机端口:容器端口
```

- **容器端口**：MySQL 固定监听 `3306`，不要改。
- **宿主机端口**：你从外部访问时用的端口，本文档用 `8089`。

所以映射写 `-p 8089:3306`，即：外部访问宿主机的 8089，实际连到容器的 3306。

### 3.2 基础启动命令

```bash
docker run --name mysql \
  -e MYSQL_ROOT_PASSWORD=123456 \
  -p 8089:3306 \
  -d mysql:8.4.11
```

### 3.3 推荐启动命令（带数据持久化）

```bash
docker run --name mysql \
  -e MYSQL_ROOT_PASSWORD=123456 \
  -e TZ=Asia/Shanghai \
  -p 8089:3306 \
  -v mysql-data:/var/lib/mysql \
  --restart unless-stopped \
  -d mysql:8.4.11
```

### 3.4 参数逐条说明

| 参数 | 说明 |
| --- | --- |
| `--name mysql` | 容器名称，自定义，后续操作用这个名字 |
| `-e MYSQL_ROOT_PASSWORD=123456` | 初始化 root 密码（仅首次生效） |
| `-e TZ=Asia/Shanghai` | 设置容器时区为东八区 |
| `-p 8089:3306` | 宿主机 8089 → 容器 3306 |
| `-v mysql-data:/var/lib/mysql` | 数据持久化到命名卷 `mysql-data` |
| `--restart unless-stopped` | 宿主机重启或容器异常退出后自动启动 |
| `-d` | 后台运行 |
| `mysql:8.4.11` | 使用的镜像 |

> **务必加 `-v` 挂载数据卷**，否则 `docker rm` 后数据全部丢失。

---

## 四、验证启动是否成功

### 4.1 查看容器状态

```bash
docker ps
```

看到 `mysql` 容器状态为 `Up` 即成功。

### 4.2 查看启动日志

```bash
docker logs mysql
```

看到类似以下内容表示初始化完成：

```text
[Note] [Entrypoint]: MySQL init process done. Ready for start up.
[System] [MY-010931] [Server] /usr/sbin/mysqld: ready for connections.
```

---

## 五、连接 MySQL

### 5.1 从宿主机连接

```bash
mysql -h 127.0.0.1 -P 8089 -u root -p
```

输入密码 `123456` 即可登录。

> **注意大小写**：`-P`（大写）是端口，`-p`（小写）是密码提示，别写错。

### 5.2 从其他机器连接

```bash
mysql -h 宿主机IP -P 8089 -u root -p
```

需确保宿主机防火墙或云服务器安全组放行 8089 端口。

### 5.3 进入容器内部连接

```bash
docker exec -it mysql mysql -u root -p
```

---

## 六、常用容器操作

| 操作 | 命令 |
| --- | --- |
| 查看运行中的容器 | `docker ps` |
| 查看所有容器 | `docker ps -a` |
| 启动容器 | `docker start mysql` |
| 停止容器 | `docker stop mysql` |
| 重启容器 | `docker restart mysql` |
| 查看日志 | `docker logs mysql` |
| 实时查看日志 | `docker logs -f mysql` |
| 进入容器 Shell | `docker exec -it mysql bash` |
| 删除容器 | `docker rm -f mysql` |

---

## 七、修改 root 密码

### 7.1 容器正常运行时的修改

官方镜像会创建 `root@localhost` 和 `root@%` 两个账号，建议一起修改，否则远程连接的密码不会变：

```bash
docker exec -it mysql mysql -u root -p旧密码 -e "
ALTER USER 'root'@'localhost' IDENTIFIED BY '新密码';
ALTER USER 'root'@'%' IDENTIFIED BY '新密码';
FLUSH PRIVILEGES;"
```

### 7.2 忘记密码时

只能删容器和数据卷重新初始化（**数据会丢失**，请先确认有备份）：

```bash
docker rm -f mysql
docker volume rm mysql-data
# 再重新执行第三节的启动命令，换上新密码
```

---

## 八、常见报错排查

### 8.1 Database is uninitialized and password option is not specified

**原因**：启动时没指定 root 密码相关环境变量。

**解决**：加上 `-e MYSQL_ROOT_PASSWORD=密码`，或另外两个密码变量之一。

### 8.2 容器名已被占用

```text
Conflict. The container name "/mysql" is already in use
```

**解决**：换名字，或删除旧容器：

```bash
docker rm -f mysql
```

### 8.3 端口已被占用

```text
Bind for 0.0.0.0:8089 failed: port is already allocated
```

**解决**：换一个宿主机端口，或找出占用者：

```bash
# Linux / macOS
lsof -i :8089
# Windows
netstat -ano | findstr 8089
```

### 8.4 密码设置了但不生效

**原因**：之前初始化失败，数据卷里有残留数据。

**解决**：删除数据卷后重新初始化：

```bash
docker rm -f mysql
docker volume rm mysql-data
# 再重新执行启动命令
```

### 8.5 环境变量写法错误

```bash
-eMYSQL_ROOT_PASSWORD=123456   # ❌ 错误，-e 后没空格
-e MYSQL_ROOT_PASSWORD=123456  # ✅ 正确
```

### 8.6 老客户端报 Authentication plugin 'mysql_native_password' ...

**原因**：MySQL 8.4 默认禁用了 `mysql_native_password` 插件，只支持 `caching_sha2_password`。旧版客户端/驱动（如旧版 Navicat、旧 JDBC/PHP mysqlnd）会连接失败。

**解决**（二选一）：

- 升级客户端/驱动到支持 `caching_sha2_password` 的版本（推荐）；
- 或在启动命令中追加参数临时启用旧插件：

```bash
docker run --name mysql \
  -e MYSQL_ROOT_PASSWORD=123456 \
  -p 8089:3306 \
  -v mysql-data:/var/lib/mysql \
  -d mysql:8.4.11 \
  --mysql-native-password=ON
```

---

## 九、数据备份与恢复

### 9.1 备份

```bash
docker exec mysql mysqldump -u root -p123456 --all-databases > backup.sql
```

只备份单个库：

```bash
docker exec mysql mysqldump -u root -p123456 数据库名 > backup.sql
```

### 9.2 恢复

```bash
docker exec -i mysql mysql -u root -p123456 < backup.sql
```

> 注意恢复命令里是 `-i` 而不是 `-it`，管道输入不需要伪终端。

---

## 十、完整流程速查（复制即用）

```bash
# 1. 拉取镜像
docker pull mysql:8.4.11

# 2. 启动容器（初始化密码 + 指定端口 + 数据持久化）
docker run --name mysql \
  -e MYSQL_ROOT_PASSWORD=123456 \
  -e TZ=Asia/Shanghai \
  -p 8089:3306 \
  -v mysql-data:/var/lib/mysql \
  --restart unless-stopped \
  -d mysql:8.4.11

# 3. 查看日志确认启动成功
docker logs mysql

# 4. 连接测试
mysql -h 127.0.0.1 -P 8089 -u root -p
```

---

## 十一、关键提醒

1. **端口格式**：`-p 宿主机端口:容器端口`，容器内固定 3306，不要改。
2. **`-P` 与 `-p`**：连接命令里大写 `-P` 是端口，小写 `-p` 是密码提示。
3. **密码变量只生效一次**：初始化后改环境变量无效，需用 SQL 命令改。
4. **务必挂载数据卷**：`-v mysql-data:/var/lib/mysql`，否则删容器即丢数据。
5. **生产环境密码要复杂**：`123456` 仅适合本地测试。
6. **安全组/防火墙**：跨机器访问时，宿主机端口需放行；生产环境建议不要对公网暴露 3306/映射端口。
7. **MySQL 8.4 认证插件**：默认禁用 `mysql_native_password`，老客户端连不上时见 8.6 节。
