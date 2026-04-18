# Golang Online Judge (GOOJ)

一个基于 Go 和 React 的在线评测系统（Online Judge），支持代码提交、实时评测、排行榜等功能。

## 项目简介

GOOJ 是一个简易的在线编程评测平台，后端使用 Go 语言开发，前端使用 React + Vite 构建。系统支持多种编程语言的代码提交和评测，提供题目列表、提交状态查询、排行榜等功能。

## 功能特性

- **题目管理**: 支持题目列表展示、难度分级、标签分类
- **代码提交**: 支持多种编程语言（C++、Java等）
- **实时评测**: 提交后实时显示评测状态和结果
- **排行榜**: 根据解题数量和评分显示用户排名
- **用户系统**: 用户资料、提交统计
- **比赛支持**: 比赛列表和题目集

## 技术栈

### 后端
- **Go 1.26.1**
- **Gin**: Web 框架
- **GORM**: ORM 框架
- **MySQL**: 数据库
- **CORS**: 跨域支持

### 前端
- **React 19**: 用户界面框架
- **Vite**: 构建工具
- **Tailwind CSS**: CSS 框架
- **ESLint**: 代码检查

## 安装和运行

### 环境要求
- Go 1.26+
- Node.js 18+
- MySQL 8.0+

### 后端设置
1. 克隆项目
   ```bash
   git clone https://github.com/Sakura1314lyc/golang-oj.git
   cd golang-oj
   ```

2. 安装 Go 依赖
   ```bash
   go mod download
   ```

3. 配置数据库
   - 创建 MySQL 数据库
   - 修改数据库连接配置（在代码中）

4. 运行后端
   ```bash
   go run main.go
   ```
   服务器将在 `http://localhost:8080` 启动

### 前端设置
1. 进入前端目录
   ```bash
   cd gooj-frontend
   ```

2. 安装依赖
   ```bash
   npm install
   ```

3. 启动开发服务器
   ```bash
   npm run dev
   ```
   前端将在 `http://localhost:5173` 启动

## 使用说明

1. 访问前端页面
2. 浏览题目列表
3. 选择题目并编写代码
4. 提交代码进行评测
5. 查看评测结果和状态

## 项目结构

```
golang-oj/
├── main.go              # 后端主文件
├── go.mod               # Go 模块文件
├── go.sum               # Go 依赖校验文件
├── gooj-frontend/       # 前端项目
│   ├── src/
│   │   ├── App.jsx      # 主应用组件
│   │   ├── main.jsx     # 入口文件
│   │   └── ...
│   ├── package.json     # 前端依赖
│   └── vite.config.js   # Vite 配置
├── package.json         # 根目录依赖（Tailwind CSS）
└── README.md            # 项目说明
```

## API 接口

### 主要接口
- `GET /api/problems` - 获取题目列表
- `POST /api/submit` - 提交代码
- `GET /api/submissions` - 获取提交记录
- `GET /api/leaderboard` - 获取排行榜
- `GET /api/contests` - 获取比赛列表

## 开发说明

### 后端开发
- 使用 Gin 框架搭建 RESTful API
- 使用 GORM 进行数据库操作
- 支持 CORS 跨域请求

### 前端开发
- 使用 React Hooks 管理状态
- 使用 Tailwind CSS 进行样式设计
- 支持暗色主题

## 贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 本项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 联系方式

项目维护者: Sakura1314lyc

GitHub: https://github.com/Sakura1314lyc/golang-oj</content>
<parameter name="filePath">d:\golang-oj\README.md