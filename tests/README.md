# 测试入口

dev.124 当前发布校验从根目录的 npm run verify:source、npm run verify 和 npm run verify:models 开始，完整模型校验需先恢复对应美术。正式账号、论坛、私信与数据隔离场景使用 docs/DEPLOY-UW.md 所列的 scripts/verify-campus-live.mjs。

根目录 tests 中保留了 v0.11.3 留下的兼容用例。部分源文件绑定旧版像素渲染收据、固定站位 NPC、Canvas 2D 入口或旧地形基准。需要验证这些旧版本断言时，可使用对应的 665297a 源码版本。当前 Base 模块的测试位于 base/tests。

在恢复完整美术的 dev.124 检出中，历史合集 103 项中 96 项通过，7 项失败于上述旧版断言。发布验证使用当前路线、模型、浏览器和原生校园服务检查。
