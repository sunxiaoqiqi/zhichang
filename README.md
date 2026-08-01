# 职场沟通训练营

基于 Next.js、Drizzle ORM 和 SQLite 的职场沟通训练应用，包含用户登录、课程进度、训练题库、设备管理、数据分析及管理后台。

## 本地运行

需要 Node.js 22.13 或更高版本。

```bash
npm ci
npm run db:migrate
npm run dev
```

默认数据库文件为 `data/app.db`。首次启动后访问 `/setup` 创建管理员。

可用命令：

- `npm run dev`：启动开发服务器
- `npm run build`：生成生产构建
- `npm start`：启动生产服务器
- `npm test`：构建并运行测试
- `npm run db:generate`：生成数据库迁移
- `npm run db:migrate`：执行待应用的迁移
- `npm run db:backup`：在线备份 SQLite 数据库
- `npm run db:studio`：打开 Drizzle Studio

可通过环境变量 `DATABASE_PATH` 指定数据库绝对路径，通过 `BACKUP_DIR` 指定备份目录。完整生产部署方式见 [DEPLOYMENT.md](./DEPLOYMENT.md)。
