# 职场沟通训练营：服务器部署说明

## 运行架构

- Node.js 22.13 或更高版本
- 标准 Next.js Node.js 服务
- 本地 SQLite 数据库（Drizzle ORM + better-sqlite3）
- nginx 负责 HTTPS 和反向代理
- systemd 负责进程守护和开机启动

数据库路径由 `DATABASE_PATH` 指定。生产环境必须使用代码目录之外的绝对路径，例如 `/var/lib/zhichang/app.db`，避免更新代码时覆盖数据。

## 首次部署

```bash
cd /opt/61shu
npm ci
sudo install -d -o www-data -g www-data /var/lib/zhichang /var/backups/zhichang
DATABASE_PATH=/var/lib/zhichang/app.db npm run db:migrate
npm run build
```

创建 `/etc/systemd/system/zhichang.service`：

```ini
[Unit]
Description=Zhichang Training Next.js application
After=network.target

[Service]
Type=simple
User=www-data
Group=www-data
WorkingDirectory=/opt/61shu
Environment=NODE_ENV=production
Environment=PORT=3000
Environment=HOSTNAME=127.0.0.1
Environment=DATABASE_PATH=/var/lib/zhichang/app.db
ExecStart=/usr/bin/npm start
Restart=on-failure
RestartSec=5
NoNewPrivileges=true
PrivateTmp=true

[Install]
WantedBy=multi-user.target
```

启用服务：

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now zhichang
sudo systemctl status zhichang
```

nginx 站点配置：

```nginx
server {
    listen 80;
    server_name book.sunxiaoqi.top;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

验证 nginx 配置后重载，并使用 Certbot 配置 HTTPS。首次访问 `/setup` 创建管理员；创建成功后该入口自动失效。

## 日常发布

```bash
cd /opt/61shu
git pull --ff-only
npm ci
DATABASE_PATH=/var/lib/zhichang/app.db npm run db:backup
DATABASE_PATH=/var/lib/zhichang/app.db npm run db:migrate
npm run build
sudo systemctl restart zhichang
curl --fail http://127.0.0.1:3000/api/health
```

健康检查应返回 `status: ok`、`database: ok` 和当前版本号。发布后还应分别完成一次管理员、免费版用户和收费版用户登录测试，并验证第 2 课访问与训练额度限制。

## 备份

在线备份命令不会直接复制正在写入的数据库文件：

```bash
DATABASE_PATH=/var/lib/zhichang/app.db BACKUP_DIR=/var/backups/zhichang npm run db:backup
```

建议通过 cron 每天执行，并将备份同步到另一台机器或对象存储。定期清理旧备份并实际演练恢复。不要只备份 `app.db` 而遗漏 WAL 文件；优先使用项目提供的在线备份命令。

## SQLite 运行约束

- 只运行一个 Next.js 应用实例写入该数据库。
- 不要把数据库放在 NFS 等网络文件系统中。
- 项目已启用 WAL、外键约束和 5 秒 busy timeout。
- 若以后需要多实例部署或写入并发明显增长，应迁移到 PostgreSQL。

## 回滚

应用问题可切回上一条已验证的 Git 提交，重新构建并重启服务。涉及数据库结构变更时，先停止写入，再使用发布前备份恢复；不要直接删除生产表。
