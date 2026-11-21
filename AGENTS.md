# UW 公开源码交接

先读 README.md、docs/REPOSITORY-SCOPE.md 和适用的部署或功能文档。当前公开版本为 dev.124，与封存交付包分开管理。运行 npm run verify:source 和 npm run verify。完整场景使用 scripts/restore-campus-art.py 校验并恢复本地素材，再运行 npm run verify:models。保留校区、建筑、导航、角色和 A2A 的已发布标识及历史存档契约。运行、认证和会话测试使用独立数据和虚构账号。任何新增素材应写明来源和许可证，用户数据、凭据及历史运行产物留在本地。Base 模块另见 base/AGENTS.md。
