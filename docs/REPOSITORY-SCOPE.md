# 公开源码仓库范围

此仓库跟踪 UW dev.124 的学校应用、内嵌 Base 源码、公开地理场景、轻量素材、依赖锁、验证和部署工具。保留原封存交付包和独立的运行数据。原始资料、账号凭据、聊天、数据库、存档、运行日志、私有配置、测试产物和第三方模型缓存由本地部署方管理。

## 完整校园美术

`CAMPUS-ART-FILES.json` 记录只在本地恢复的模型、纹理、概念图和艺术资产元数据。使用 `python scripts/restore-campus-art.py --delivery /path/to/Hyper-Dimension-UW-dev.124.zip` 从匹配的完整交付包恢复。工具验证 ZIP 和逐项 SHA-256，保护已有同名文件。源码 Git 历史只保留必要的运行代码、经署名许可的轻量素材和文档截图。

## 完整服务

`SOURCE-DEPENDENCIES.json` 记录 Hermes 源码缓存、uv 安装轮子和 ONNX 模型权重的固定摘要。用 `python scripts/restore-source-artifacts.py --delivery /path/to/Hyper-Dimension-UW-dev.124.zip` 恢复，或用该工具的 `--fetch` 选项按上游固定版本获取。完整服务还依赖部署环境自备的配置，见 [部署手册](DEPLOY-UW.md)。

`SOURCE-MANIFEST.json` 对应本次 Git 源码。通过 `npm run verify:source` 验证。早期版本文档对应各自版本，当前入口为根 README 和部署手册。项目权利和第三方许可见 [项目声明](../LICENSE) 及 [来源与许可](../LICENSES.md)。
