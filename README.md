# GOOJ — Golang Online Judge

一个基于 Go + React 的在线评测系统，支持多语言代码提交、真实编译判题、用户认证、排行榜和比赛管理。

## 技术栈

| 层级 | 技术 | 说明 |
|------|------|------|
| **后端** | Go 1.26 + GORM | RESTful API，模块化架构 |
| **数据库** | MySQL 8.0 | GORM ORM 自动迁移 |
| **判题引擎** | 本地沙箱 | 真实编译执行 C++/Go/Python/Java/JavaScript |
| **认证** | JWT | 用户注册、登录、Token 鉴权 |
| **前端** | React 19 + Vite + Tailwind CSS v4 | 组件化，响应式，暗色/亮色主题 |
| **编辑器** | CodeMirror 6 | 五种语言语法高亮，自动缩进，括号匹配，亮暗双主题 |
| **题库** | Codeforces API 导入 | 120 道 CF 题目，覆盖 rating 800–2000 |

## 功能特性

- **题目管理** — 148 道题目（28 道原创 + 120 道 Codeforces），Easy / Medium / Hard 难度，支持搜索和标签过滤
- **多语言支持** — C++17、Go、Python、Java、JavaScript 五种语言，各自带默认代码模板
- **真实判题** — 编译执行 + 逐测试点比对 + 超时控制 + 内存限制
- **用户系统** — 注册 / 登录 / JWT 鉴权 / 资料修改 / 密码修改 / 角色权限
- **个人面板** — 用户档案下拉菜单，展示 Solved Count、Rating、提交统计
- **排行榜** — 按评分/解题数排序，分页展示
- **提交记录** — 全局提交列表 + 个人提交历史，支持按状态过滤和分页
- **题目提交历史** — 在题目详情页内可展开查看自己对该题的所有提交记录
- **比赛管理** — 比赛列表（Running / Upcoming / Ended）、题目列表、排名
- **公告系统** — 管理员发布公告，前端 Dashboard 顶部展示通知横幅
- **管理功能** — 题目 CRUD、用户管理、重新判题、题目统计、公告管理
- **API 安全** — 速率限制、请求日志、CORS 配置
- **优雅关停** — 信号监听（SIGINT/SIGTERM），安全退出
- **暗色/亮色模式** — 一键切换，沉浸式暗色主题

## API 接口

| 路由 | 方法 | 说明 | 认证 |
|------|------|------|------|
| `/api/health` | GET | 健康检查 | — |
| `/api/auth/register` | POST | 用户注册 | — |
| `/api/auth/login` | POST | 用户登录 | — |
| `/api/announcements` | GET | 活跃公告列表 | — |
| `/api/problems` | GET | 题目列表（搜索/过滤/分页） | — |
| `/api/problems/:id` | GET | 题目详情（含样例） | — |
| `/api/contests` | GET | 比赛列表 | — |
| `/api/contests/:id` | GET | 比赛详情（含题目列表） | — |
| `/api/contests/:id/rank` | GET | 比赛排名 | — |
| `/api/leaderboard` | GET | 排行榜（分页/排序） | — |
| `/api/submissions` | GET | 提交记录（分页/过滤） | — |
| `/api/status/:id` | GET | 查询判题状态 | — |
| `/api/users/:id` | GET | 用户公开资料 | — |
| `/api/submit` | POST | 提交代码 | ✅ |
| `/api/profile` | GET | 用户资料 | ✅ |
| `/api/profile/update` | PUT | 更新资料（邮箱/头像/签名） | ✅ |
| `/api/profile/password` | PUT | 修改密码 | ✅ |
| `/api/my/submissions` | GET | 我的提交历史（分页/过滤） | ✅ |
| `/api/admin/problems/create` | POST | 创建题目 | ✅ Admin |
| `/api/admin/problems/:id` | PUT | 更新题目 | ✅ Admin |
| `/api/admin/problems/:id` | DELETE | 删除题目 | ✅ Admin |
| `/api/admin/users` | GET | 用户列表（分页） | ✅ Admin |
| `/api/admin/rejudge/:id` | POST | 重新判题 | ✅ Admin |
| `/api/admin/stats/problems` | GET | 全题目统计（提交数/通过率） | ✅ Admin |
| `/api/admin/stats/problems/:id` | GET | 单题统计 | ✅ Admin |
| `/api/admin/announcements` | GET | 公告管理列表 | ✅ Admin |
| `/api/admin/announcements/create` | POST | 发布公告 | ✅ Admin |
| `/api/admin/announcements/:id` | DELETE | 删除公告 | ✅ Admin |

## 快速开始

### 环境要求
- Go 1.26+
- Node.js 18+
- MySQL 8.0+
- g++ (MinGW-w64)、Python 3、Java JDK (可选)、Node.js (可选)

### 1. 配置数据库

```bash
# 创建数据库
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS gooj CHARACTER SET utf8mb4"
```

### 2. 启动后端

```bash
# 可选：从 .env 文件加载配置
cp .env.example .env

go mod download
go run main.go
# 服务运行在 http://localhost:8080
# 自动建表 + 种子数据（28 道原创题、122+ 测试用例、默认用户、比赛）
```

环境变量配置（可选，也可写入 `.env` 文件）：
| 变量 | 默认值 |
|------|--------|
| `DB_HOST` | localhost |
| `DB_PORT` | 3306 |
| `DB_USER` | root |
| `DB_PASSWORD` | lyc061215 |
| `DB_NAME` | gooj |
| `JWT_SECRET` | gooj-secret-key-2024 |
| `SERVER_PORT` | :8080 |

### 3. 启动前端

```bash
cd gooj-frontend
npm install
npm run dev
# 前端运行在 http://localhost:5173
```

## 题库扩展

项目自带 28 道原创题目。额外提供从 Codeforces 导入题目的工具：

```bash
# 1. 下载 Codeforces 题目数据
curl -s "https://codeforces.com/api/problemset.problems" -o tools/fetch_problems/cf_problems.json

# 2. 导入数据库（自动去重，可重复执行）
go run tools/fetch_problems/main.go
```

默认导入 rating 800–2000 范围的 120 道题目。可在 `main.go` 中调整 `maxCount` 和 rating 范围。

## 项目结构

```
golang-oj/
├── main.go                  # 入口（优雅关停）
├── config/config.go         # 配置（支持 .env 文件）
├── database/db.go           # 数据库连接 + 迁移
├── models/                  # 数据模型
│   ├── user.go              # 用户（bcrypt 密码 + 角色）
│   ├── problem.go           # 题目
│   ├── submission.go        # 提交记录（状态常量）
│   ├── contest.go           # 比赛
│   ├── test_case.go         # 测试用例
│   └── announcement.go      # 公告
├── handlers/                # HTTP 处理器
│   ├── auth.go              # 注册/登录/Profile/密码修改
│   ├── problem.go           # 题目列表/搜索/过滤/CRUD
│   ├── submission.go        # 提交/状态/列表/我的提交
│   ├── contest.go           # 比赛列表/详情/排名
│   ├── leaderboard.go       # 排行榜（分页/排序）
│   ├── user.go              # 用户列表/公开资料
│   ├── admin.go             # 管理后台（统计/重判/公告）
│   ├── health.go            # 健康检查
│   ├── pagination.go        # 分页工具
│   └── response.go          # 响应工具
├── middleware/               # 中间件
│   ├── auth.go              # JWT 鉴权 + Admin 验证
│   ├── cors.go              # 跨域
│   ├── logging.go           # 请求日志
│   └── ratelimit.go         # 速率限制
├── judge/judge.go           # 判题引擎（编译+运行+比对）
├── routes/routes.go         # 路由注册
├── seed/seed.go             # 种子数据
├── tools/fetch_problems/    # 从 Codeforces 导入题目的工具
│
└── gooj-frontend/           # 前端项目
    └── src/
        ├── App.jsx          # 主入口（路由、状态）
        ├── api/client.js    # API 封装
        ├── context/         # React Context（Auth / Toast）
        ├── components/
        │   ├── layout/      # 布局组件（Header、导航）
        │   ├── dashboard/   # 仪表盘（题目列表/排行榜/提交记录/比赛）
        │   ├── problem/     # 题目详情 + CodeMirror 编辑器 + 提交面板
        │   ├── submissions/ # 个人提交记录页
        │   ├── auth/        # 登录/注册模态框
        │   └── common/      # 通用组件（ErrorBoundary、LoadingSkeleton）
        └── index.css        # Tailwind + 自定义主题 + 动画
```

## 题目列表

| ID | 标题 | 难度 | 标签 |
|----|------|------|------|
| 1001 | A + B Problem | Easy | 数学,入门 |
| 1002 | 反转字符串 | Easy | 字符串 |
| 1003 | 两数之和 | Easy | 数组,哈希表 |
| 1004 | 回文数判断 | Easy | 数学 |
| 1005 | 最大子数组和 | Medium | 数组,动态规划 |
| 1006 | 斐波那契数列 | Easy | 递归,动态规划 |
| 1007 | 素数判断 | Easy | 数学 |
| 1008 | 二分查找 | Easy | 二分,数组 |
| 1009 | 括号匹配 | Easy | 栈,字符串 |
| 1010 | 删除排序数组中的重复项 | Easy | 数组,双指针 |
| 1011 | 最长公共前缀 | Easy | 字符串 |
| 1012 | 爬楼梯 | Easy | 动态规划 |
| 1013 | 只出现一次的数字 | Easy | 位运算 |
| 1014 | 移动零 | Easy | 数组,双指针 |
| 1015 | 存在重复元素 | Easy | 哈希表 |
| 1016 | 缺失的数字 | Easy | 位运算 |
| 1017 | 2 的幂 | Easy | 位运算 |
| 1018 | 阶乘 | Easy | 数学 |
| 1019 | 合并有序数组 | Easy | 数组,双指针 |
| 1020 | 加一 | Easy | 数组 |
| 1021 | 快乐数 | Easy | 数学,哈希表 |
| 1022 | 计数质数 | Medium | 筛法 |
| 1023 | 最大公约数和最小公倍数 | Easy | 数学 |
| 1024 | 数组的最大乘积 | Easy | 数组 |
| 1025 | 有效的字母异位词 | Easy | 字符串,哈希表 |
| 1026 | 排序数组 | Easy | 排序 |
| 1027 | 验证回文串 | Easy | 字符串,双指针 |
| 1028 | 买股票的最佳时机 | Medium | 数组,动态规划 |

## 判题说明

支持五种语言，真实编译执行：

- **C++**: `g++ -std=c++17 -O2` 编译 → 运行二进制
- **Go**: `go run` 执行（自动生成临时 `go.mod`）
- **Python**: `python` 解释执行
- **Java**: `javac` 编译 → `java` 运行
- **JavaScript**: `node` 解释执行

判题流程：编译 → 逐测试点运行 → 超时控制（含超过题目时间限制检测）→ 输出比对 → 返回结果

### 判题安全机制

- 超时控制：每个测试点设有独立超时上下文（题目时限 + 2s 缓冲）
- 双层超时检测：上下文取消 + 实际耗时比对
- 临时沙箱：每次判题在独立的临时目录中编译运行，判题完成后自动清理

## 默认账号

| 用户名 | 密码 | 角色 | Rating |
|--------|------|------|--------|
| admin | 123456 | Admin | 1500 |
| Alice | 123456 | User | 1350 |
| Bob | 123456 | User | 1200 |
| Charlie | 123456 | User | 1100 |
