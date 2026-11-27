# 公开源码仓库范围

此仓库跟踪 UW dev.124 的学校应用、内嵌 Base 源码、公开地理场景、轻量素材、依赖锁、验证和部署工具。保留原封存交付包和独立的运行数据。原始资料、账号凭据、聊天、数据库、存档、运行日志、私有配置、测试产物和第三方模型缓存由本地部署方管理。

## 完整校园美术

从 [dev.124 美术发布页](https://github.com/MkaliezZ/Hyper-Dimension-UW/releases/tag/v0.13.0-dev.124-art) 下载四个 ZIP 分卷到仓库根目录，运行 `python scripts/join-campus-art.py` 合并，再运行 `python scripts/restore-campus-art.py --art-pack Hyper-Dimension-UW-dev.124-art.zip`。工具使用 `CAMPUS-ART-RELEASE.json` 校验分卷和完整 ZIP，并按文件核对 SHA-256。美术包附来源和许可说明，包含运行素材和经整理的概念图。

`CAMPUS-ART-FILES.json` 保留完整交付 ZIP 的素材清单。持有完整交付 ZIP 时，仍可用 `python scripts/restore-campus-art.py --delivery /path/to/Hyper-Dimension-UW-dev.124.zip` 恢复。两种方式都保护已有的不同文件。

## 完整服务

`SOURCE-DEPENDENCIES.json` 记录 Hermes 源码缓存、uv 安装轮子和 ONNX 模型权重的固定摘要。用 `python scripts/restore-source-artifacts.py --delivery /path/to/Hyper-Dimension-UW-dev.124.zip` 恢复，或用该工具的 `--fetch` 选项按上游固定版本获取。完整服务还依赖部署环境自备的配置，见 [部署手册](DEPLOY-UW.md)。

`SOURCE-MANIFEST.json` 对应本次 Git 源码。通过 `npm run verify:source` 验证。早期版本文档对应各自版本，当前入口为根 README 和部署手册。项目权利和第三方许可见 [项目声明](../LICENSE) 及 [来源与许可](../LICENSES.md)。
