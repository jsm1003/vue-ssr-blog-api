 # 后端api服务器

首先注册leancloud账号https://leancloud.cn
然后 创建一个应用 应用名为 test

在test数据存储中，分别创建Article Draft Tag 三个class

下载lean CLI工具并安装 具体操作看这里https://leancloud.cn/docs/leanengine_cli.html

然后执行命令 `lean login` 登陆leancloud账户
             `lean init` 初始化项目 并选择你的应用test


然后 `npm install` 安装依赖

然后 `lean up` 启动api服务器
