# 贡献与维护

阅读 [源码范围](docs/REPOSITORY-SCOPE.md) 和 [部署手册](docs/DEPLOY-UW.md)。修改校园模型、地块或导航后，使用 `npm run verify` 核对校园数据和路线，恢复对应素材后再运行 `npm run verify:models`。使用独立运行目录和虚构账号验证社区、认证与会话功能。提交变更通过 Issue 或 Pull Request 讨论，附复现步骤或截图。任何新素材应附上作者、出处、许可及变更说明。校方或访客数据可用虚构示例替代。

For changes to the campus scene, run `npm run verify` and `npm run verify:models` after restoring the matching art. Report reproducible issues with version and steps, and include attribution for any new asset. Keep test accounts and runtime data in a separate local instance.
