# GOOJ — Golang Online Judge

一个基于 Go + React 的在线评测系统，支持多语言代码提交、真实编译判题、用户认证、排行榜和比赛管理。

## 技术栈

| 层级 | 技术 | 说明 |
|------|------|------|
| **后端** | Go 1.26 + Gin + GORM | RESTful API，模块化架构 |
| **数据库** | MySQL 8.0 | GORM ORM 自动迁移 |
| **判题引擎** | 本地沙箱 | 真实编译执行 C++/Go/Python |
| **认证** | JWT | 用户注册、登录、Token 鉴权 |
| **前端** | React 19 + Vite + Tailwind CSS v4 | 组件化，响应式，暗色主题 |
| **编辑器** | CodeMirror 6 | 语法高亮，自动缩进，括号匹配 |

## 功能特性

- **题目管理** — 28 道题目，覆盖 Easy / Medium 难度
- **多语言支持** — C++17、Go、Python 三语言提交
- **真实判题** — 编译执行 + 测试点比对 + 超时控制
- **用户系统** — 注册 / 登录 / JWT 鉴权 / Rating
- **排行榜** — 按评分排序，实时更新
- **提交记录** — 历史提交查看，状态轮询
- **比赛管理** — 比赛列表、赛程状态
- **暗色模式** — 一键切换亮色/暗色主题

## API 接口

| 路由 | 方法 | 说明 | 认证 |
|------|------|------|------|
| `/api/health` | GET | 健康检查 | — |
| `/api/auth/register` | POST | 用户注册 | — |
| `/api/auth/login` | POST | 用户登录 | — |
| `/api/problems` | GET | 题目列表 | — |
| `/api/problems/:id` | GET | 题目详情（含样例） | — |
| `/api/submit` | POST | 提交代码 | ✅ |
| `/api/status/:id` | GET | 查询判题状态 | — |
| `/api/submissions` | GET | 提交记录 | — |
| `/api/leaderboard` | GET | 排行榜 | — |
| `/api/contests` | GET | 比赛列表 | — |
| `/api/profile` | GET | 用户资料 | ✅ |

## 快速开始

### 环境要求
- Go 1.26+
- Node.js 18+
- MySQL 8.0+
- g++ (MinGW-w64), Python 3

### 1. 配置数据库

```bash
# 创建数据库
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS gooj CHARACTER SET utf8mb4"
```

### 2. 启动后端

```bash
go mod download
go run main.go
# 服务运行在 http://localhost:8080
# 自动建表 + 种子数据（28 题、122 测试用例、用户、比赛）
```

环境变量配置（可选）：
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

## 项目结构

```
golang-oj/
├── main.go                  # 入口
├── config/config.go         # 配置
├── database/db.go           # 数据库连接 + 迁移
├── models/                  # 数据模型
│   ├── user.go              # 用户（bcrypt 密码）
│   ├── problem.go           # 题目
│   ├── submission.go        # 提交记录
│   ├── contest.go           # 比赛
│   └── test_case.go         # 测试用例
├── handlers/                # HTTP 处理器
│   ├── auth.go              # 注册/登录/Profile
│   ├── problem.go           # 题目列表/详情
│   ├── submission.go        # 提交/状态/列表
│   ├── contest.go           # 比赛
│   ├── leaderboard.go       # 排行榜
│   └── health.go            # 健康检查
├── middleware/               # 中间件
│   ├── cors.go              # 跨域
│   └── auth.go              # JWT 鉴权
├── judge/judge.go           # 判题引擎（编译+运行+比对）
├── routes/routes.go         # 路由注册
├── seed/seed.go             # 种子数据
│
└── gooj-frontend/           # 前端项目
    └── src/
        ├── App.jsx          # 主入口（路由、状态）
        ├── api/client.js    # API 封装
        ├── context/         # React Context
        ├── components/
        │   ├── layout/      # 布局组件
        │   ├── dashboard/   # 仪表盘
        │   ├── problem/     # 题目 + 编辑器
        │   ├── auth/        # 登录/注册
        │   └── common/      # 通用组件
        └── index.css        # Tailwind + 动画
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

支持三种语言，真实编译执行：

- **C++**: `g++ -std=c++17 -O2` 编译 → 运行二进制
- **Go**: `go run` 直接执行
- **Python**: `python` 解释执行

判题流程：编译 → 逐测试点运行 → 超时控制 → 输出比对 → 返回结果

## 默认账号

| 用户名 | 密码 | Rating |
|--------|------|--------|
| admin | 123456 | 1500 |
| Alice | 123456 | 1350 |
| Bob | 123456 | 1200 |
