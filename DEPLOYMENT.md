# 职场沟通训练营：上线与运维说明

## 运行基线

- Node.js `22.13` 或更高版本
- Cloudflare Workers / Vinext
- D1 数据库绑定名称：`DB`
- 健康检查：`GET /api/health`

## 首次部署

1. 安装依赖并生成生产构建：

   ```bash
   npm ci
   npm run build
   ```

2. 在部署平台创建 D1 数据库，并将绑定名设置为 `DB`。项目的 `.openai/hosting.json` 已声明该绑定。

3. 按顺序执行三份远程数据库迁移：

   ```bash
   npm run db:migrate:v1:remote
   npm run db:migrate:v2:remote
   npm run db:migrate:v3:remote
   npm run db:migrate:v4:remote
   ```

4. 首次打开 `/setup` 创建管理员。创建成功后，该入口会自动失效。

5. 使用管理员账号检查：用户管理、设备管理、数据分析、训练题管理和操作审计。

## 日常发布

1. 发布前运行 `npm test`。
2. 数据库结构变化前运行 `npm run db:backup:remote`。
3. 先执行新增迁移，再发布应用代码。
4. 发布后访问 `/api/health`，应返回 `status: ok` 与 `database: ok`。
5. 分别以普通用户和管理员完成一次登录冒烟测试。

## 数据与安全口径

- 密码只保存 PBKDF2 哈希及随机盐，后台不能读取原密码。
- 用户以不可变 UUID 作为唯一编号；账号名只用于登录，可修改但不能与其他用户重复。设备、训练和统计均按 UUID 归属。
- 新建或重置密码时，临时密码仅显示一次。
- 设备按“账户 + 本地设备标识”唯一汇总；清理浏览器数据后会被识别为新设备。
- 登录地点来自 Cloudflare 请求头，是近似位置，不是 GPS 精确位置。
- 有效时长按 60 秒心跳累计；页面隐藏或连续 5 分钟无操作后停止计时。
- CSV 导出与后台关键操作都会写入操作审计。

## 回滚

- 应用问题：回滚到上一条已验收的 Git 提交并重新发布。
- 数据问题：停止写入后，用发布前导出的 D1 备份恢复。迁移均为增量操作，不建议直接删除生产表。
