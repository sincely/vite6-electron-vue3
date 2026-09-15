/*
 Navicat Premium Dump SQL

 Source Server         : test
 Source Server Type    : MySQL
 Source Server Version : 80407 (8.4.7)
 Source Host           : localhost:3306
 Source Schema         : app

 Target Server Type    : MySQL
 Target Server Version : 80407 (8.4.7)
 File Encoding         : 65001

 Date: 15/09/2026
 说明：
   本次重写聚焦于「用户表 / 角色表 / 菜单路由表」，整体对齐前端 Vue Router 4 的路由结构与
   系统管理页（system/menu、system/role、system/user）实际使用的字段命名：
     - 前端路由 meta 字段:  title / icon / order / sidebar / group / keepAlive / link / iframe / roles
     - 前端菜单管理字段:    id / parentId / menuType / menuName / icon / routeName / path / component /
                            redirect / permission / frame / link / sort / visible / status / isCache / remark
     - 前端角色管理字段:    id / roleName / roleCode / roleSort / dataScope / status / permissions / remark
     - 前端用户管理字段:    id / username / nickname / gender / mobile / email / avatar / roleIds / status

   主要变更：
     1) 字段名规范化：route_path -> path；order_num -> sort；hide_in_menu -> visible；
                     keep_alive -> is_cache；icon_type / i18n_key / active_menu / multi_tab 移除。
     2) menu_type 由 tinyint 改为 VARCHAR(10)，取值 'DIR' | 'MENU' | 'BUTTON'，与前端一致。
     3) parent_id 由可空改为 NOT NULL DEFAULT 0（顶级菜单 = 0），与前端菜单树 parentId=0 一致。
     4) 新增 frame / link / is_cache / data_scope / deleted / is_system 等字段，
        删除冗余的 ButtonAuth / RoleButton 表，按钮作为 sys_menu 的 BUTTON 行存在。
     5) 状态/可见性统一使用 CHAR(1) 取值 '0' / '1'。
     6) 种子数据完整覆盖前端 asyncRouteTree：仪表板 / 结果 / 异常 / 系统管理 / 嵌套菜单 /
        组件演示 / 组件中心 / 模板中心 / 功能示例 / 内嵌网页 十大顶级目录。
     7) 按钮权限 (BUTTON) 关联到对应菜单下，便于前端按 permission 字符串鉴权。
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ============================================================
--  依赖旧表先清掉（FK 安全顺序）
-- ============================================================
DROP TABLE IF EXISTS `RoleButton`;
DROP TABLE IF EXISTS `ButtonAuth`;
DROP TABLE IF EXISTS `RoleRoute`;
DROP TABLE IF EXISTS `UserRole`;
DROP TABLE IF EXISTS `RouteAuth`;
DROP TABLE IF EXISTS `Roles`;
DROP TABLE IF EXISTS `Users`;

-- ============================================================
--  用户表 Users
-- ============================================================
DROP TABLE IF EXISTS `Users`;
CREATE TABLE `Users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL COMMENT '登录用户名（唯一）',
  `password` varchar(255) NOT NULL COMMENT '登录密码（bcrypt 加密存储）',
  `nick_name` varchar(50) DEFAULT NULL COMMENT '昵称',
  `real_name` varchar(50) DEFAULT NULL COMMENT '真实姓名',
  `gender` enum('male','female','other') NOT NULL DEFAULT 'other' COMMENT '性别',
  `age` tinyint unsigned DEFAULT NULL COMMENT '年龄',
  `avatar` varchar(255) DEFAULT NULL COMMENT '头像地址',
  `email` varchar(100) DEFAULT NULL COMMENT '邮箱',
  `phone` varchar(20) DEFAULT NULL COMMENT '手机号',
  `id_card` varchar(18) DEFAULT NULL COMMENT '身份证号',
  `address` varchar(255) DEFAULT NULL COMMENT '地址',
  `dept_id` int DEFAULT NULL COMMENT '所属部门ID（预留，便于接入部门表 sys_dept）',
  `status` char(1) NOT NULL DEFAULT '1' COMMENT '状态：1=启用 0=禁用',
  `is_system` char(1) NOT NULL DEFAULT '0' COMMENT '是否系统内置：1=是 0=否（系统内置不可删除）',
  `last_login_ip` varchar(45) DEFAULT NULL COMMENT '最近登录 IP',
  `last_login_time` datetime DEFAULT NULL COMMENT '最近登录时间',
  `current_refresh_token` varchar(512) DEFAULT NULL COMMENT '当前生效的 Refresh Token（用于单设备登录控制）',
  `session_id` varchar(36) DEFAULT NULL COMMENT '当前会话 ID（UUID，用于单设备登录控制）',
  `session_expire` datetime DEFAULT NULL COMMENT '会话过期时间',
  `remark` varchar(500) DEFAULT '' COMMENT '备注',
  `create_by` varchar(50) DEFAULT '' COMMENT '创建人',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_by` varchar(50) DEFAULT '' COMMENT '更新人',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted` char(1) NOT NULL DEFAULT '0' COMMENT '逻辑删除：1=是 0=否',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_username` (`username`),
  KEY `idx_user_phone` (`phone`),
  KEY `idx_user_email` (`email`),
  KEY `idx_user_dept_id` (`dept_id`),
  KEY `idx_user_status` (`status`),
  KEY `idx_user_create_time` (`create_time`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='用户表';

-- ----------------------------
-- Records of Users
-- ----------------------------
BEGIN;
INSERT INTO `Users` (`id`, `username`, `password`, `nick_name`, `real_name`, `gender`, `avatar`, `email`, `phone`, `dept_id`, `status`, `is_system`, `last_login_ip`, `last_login_time`, `current_refresh_token`, `session_id`, `session_expire`, `remark`, `create_by`, `create_time`, `update_by`, `update_time`, `deleted`) VALUES (1, 'user',  '$2b$10$Lsz9OdgKyuShCfzxQL7AcewmJKvQz47Xx.33E5MZCOA8a5GnSD1Hm', 'Alice', NULL, 2, 'avatar1.png', 'alice@example.com', '15374536782', NULL, '1', '0', '127.0.0.1', '2026-08-04 00:13:45', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJuYW1lIjoidXNlciIsInJvbGVJZCI6MSwicm9sZUlkcyI6WzEsMl0sInJvbGVDb2RlIjoiYWRtaW4iLCJyb2xlQ29kZXMiOlsiYWRtaW4iLCJ1c2VyIl0sInJvbGVOYW1lIjoi566h55CG5ZGYIiwicm9sZU5hbWVzIjpbIueuoeeQhuWRmCIsIuaZrumAmueUqOaItyJdLCJzZXNzaW9uSWQiOiI5ZDdlMDk5NC05ZGE4LTQ1NmItYWY4NC0wYmMwYzZkYWFjODgiLCJpYXQiOjE3ODU3NzM2MjUsImV4cCI6MTc4NjM3ODQyNX0.-o391fG5UpF78z3BXDGbj7VbBYxVglkfeNspqTHMXVE', '9d7e0994-9da8-456b-af84-0bc0c6daac88', '2026-08-11 00:13:46', '普通用户 Alice', 'system', '2026-08-04 00:13:45', 'system', '2026-08-04 00:13:45', '0');
INSERT INTO `Users` (`id`, `username`, `password`, `nick_name`, `real_name`, `gender`, `avatar`, `email`, `phone`, `dept_id`, `status`, `is_system`, `last_login_ip`, `last_login_time`, `current_refresh_token`, `session_id`, `session_expire`, `remark`, `create_by`, `create_time`, `update_by`, `update_time`, `deleted`) VALUES (2, 'admin', '$2b$10$Lsz9OdgKyuShCfzxQL7AcewmJKvQz47Xx.33E5MZCOA8a5GnSD1Hm', 'Bob',   NULL, 1, 'avatar2.png', 'bob@example.com',   '15374536782', NULL, '1', '1', '127.0.0.1', '2026-08-05 00:16:58', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsInVzZXJuYW1lIjoiYWRtaW4iLCJyb2xlSWQiOjEsInJvbGVJZHMiOlsxLDIsM10sInJvbGVDb2RlIjoiYWRtaW4iLCJyb2xlQ29kZXMiOlsiYWRtaW4iLCJ1c2VyIiwic3VwZXIiXSwicm9sZU5hbWUiOiLnrqHnkIblkZgiLCJyb2xlTmFtZXMiOlsi566h55CG5ZGYIiwi5pmu6YCa55So5oi3Iiwi6LaF57qn566h55CG5ZGYIl0sInNlc3Npb25JZCI6IjcxZDdiY2JmLWQ3MzAtNDIyNi1hNmE0LTVhOTNhNDFlN2YwMiIsImlhdCI6MTc4NTg2MDIxOCwiZXhwIjoxNzg2NDY1MDE4fQ.5x6ooAjqLkm3w7sMAWJxz92XX_ruUezPJw34GGy6E8o', '71d7bcbf-d730-4226-a6a4-5a93a41e7f02', '2026-08-12 00:16:59', '系统内置管理员', 'system', '2026-08-04 00:13:45', 'system', '2026-08-05 00:16:58', '0');
INSERT INTO `Users` (`id`, `username`, `password`, `nick_name`, `real_name`, `gender`, `avatar`, `email`, `phone`, `dept_id`, `status`, `is_system`, `last_login_ip`, `last_login_time`, `current_refresh_token`, `session_id`, `session_expire`, `remark`, `create_by`, `create_time`, `update_by`, `update_time`, `deleted`) VALUES (5, 'werwer','$2b$10$Rjh2GERNOJocRFHPuyfmouty3/89LJdl7UCDW2Fgdwoj8E8/KMv56', '12312',  NULL, 1, NULL, '1738248422@qq.com', '15651376329', NULL, '1', '0', NULL, NULL, NULL, NULL, NULL, '', 'admin', '2026-05-27 23:50:03', 'admin', '2026-05-27 23:50:03', '0');
INSERT INTO `Users` (`id`, `username`, `password`, `nick_name`, `real_name`, `gender`, `avatar`, `email`, `phone`, `dept_id`, `status`, `is_system`, `last_login_ip`, `last_login_time`, `current_refresh_token`, `session_id`, `session_expire`, `remark`, `create_by`, `create_time`, `update_by`, `update_time`, `deleted`) VALUES (6, '123',  '$2b$10$3QPEF0fhZGZp7EjY0JqZZOBTut03FEp9NqfVC9yOKEBhLh8c8p2Zy', '123123', NULL, 1, NULL, '1738248432@qq.com', '15651376322', NULL, '1', '0', NULL, NULL, NULL, NULL, NULL, '', 'admin', '2026-05-28 00:05:17', 'admin', '2026-05-28 00:05:17', '0');
COMMIT;

-- ============================================================
--  角色表 Roles
--  说明：保留旧列名 role_id / description（与后端 authService.js、userDao.js 中
--        'r.role_id' / 'r.description' 等硬编码 JOIN 兼容），同时新增
--        role_sort / data_scope / deleted 等字段做最小增强。
-- ============================================================
DROP TABLE IF EXISTS `Roles`;
CREATE TABLE `Roles` (
  `role_id` int NOT NULL AUTO_INCREMENT,
  `role_name` varchar(50) NOT NULL COMMENT '角色名称',
  `role_code` varchar(50) NOT NULL COMMENT '角色编码（程序内唯一标识，用于前端路由 meta.roles）',
  `role_sort` int NOT NULL DEFAULT '0' COMMENT '显示排序，数值越小越靠前',
  `data_scope` char(1) NOT NULL DEFAULT '1' COMMENT '数据权限：1=全部 2=本部门 3=本部门及下级 4=本人 5=自定义',
  `status` char(1) NOT NULL DEFAULT '1' COMMENT '状态：1=启用 0=禁用',
  `is_system` char(1) NOT NULL DEFAULT '0' COMMENT '是否系统内置：1=是 0=否（内置不可删除）',
  `description` varchar(500) DEFAULT NULL COMMENT '角色描述',
  `create_by` varchar(50) DEFAULT '' COMMENT '创建人',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_by` varchar(50) DEFAULT '' COMMENT '更新人',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted` char(1) NOT NULL DEFAULT '0' COMMENT '逻辑删除：1=是 0=否',
  PRIMARY KEY (`role_id`),
  UNIQUE KEY `uk_role_code` (`role_code`),
  UNIQUE KEY `uk_role_name` (`role_name`),
  KEY `idx_role_status` (`status`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='角色表';

-- ----------------------------
-- Records of Roles
-- ----------------------------
BEGIN;
INSERT INTO `Roles` (`role_id`, `role_name`, `role_code`, `role_sort`, `data_scope`, `status`, `is_system`, `description`, `create_by`, `create_time`, `update_by`, `update_time`, `deleted`) VALUES (1, '管理员',     'admin', 1, '1', '1', '1', '系统内置管理员，可访问后台管理能力',  'system', '2026-08-04 00:13:45', 'admin', '2026-08-03 22:50:44', '0');
INSERT INTO `Roles` (`role_id`, `role_name`, `role_code`, `role_sort`, `data_scope`, `status`, `is_system`, `description`, `create_by`, `create_time`, `update_by`, `update_time`, `deleted`) VALUES (2, '普通用户',   'user',  3, '4', '1', '1', '系统内置普通用户，仅查看仪表板/结果页',         'system', '2026-08-04 00:13:45', 'admin', '2026-08-03 22:50:44', '0');
INSERT INTO `Roles` (`role_id`, `role_name`, `role_code`, `role_sort`, `data_scope`, `status`, `is_system`, `description`, `create_by`, `create_time`, `update_by`, `update_time`, `deleted`) VALUES (3, '超级管理员', 'super', 0, '1', '1', '1', '系统内置超级管理员，拥有全部菜单与按钮权限', 'system', '2026-08-04 00:13:45', 'admin', '2026-08-04 21:46:19', '0');
COMMIT;

-- ============================================================
--  菜单路由表 RouteAuth
--  与前端 src/render/router/index.js 的 asyncRouteTree 一一对应
--  - menu_type: DIR（目录） / MENU（菜单页） / BUTTON（按钮权限）
--  - parent_id = 0 表示顶级菜单
-- ============================================================
DROP TABLE IF EXISTS `RouteAuth`;
CREATE TABLE `RouteAuth` (
  `id` int NOT NULL AUTO_INCREMENT,
  `parent_id` int NOT NULL DEFAULT '0' COMMENT '父级菜单ID，0=顶级',
  `menu_type` varchar(10) NOT NULL DEFAULT 'MENU' COMMENT '菜单类型：DIR=目录 MENU=菜单页 BUTTON=按钮',
  `menu_name` varchar(50) NOT NULL COMMENT '菜单/按钮显示名称',
  `sort` int NOT NULL DEFAULT '0' COMMENT '显示排序，数值越小越靠前（与前端 meta.order / 子项排序一致）',
  `icon` varchar(100) DEFAULT NULL COMMENT '菜单图标（Lucide / iconify 名称）',
  `route_name` varchar(255) DEFAULT NULL COMMENT '前端路由 name（唯一）',
  `path` varchar(255) DEFAULT NULL COMMENT '前端路由路径（含父路径前缀）',
  `component` varchar(255) DEFAULT NULL COMMENT '前端组件路径（DIR 指向 Layout，子页指向 view 或 component）',
  `redirect` varchar(255) DEFAULT NULL COMMENT '重定向路径',
  `permission` varchar(100) DEFAULT NULL COMMENT '权限标识（格式 module:resource:action）',
  `frame` char(1) NOT NULL DEFAULT '0' COMMENT '是否内嵌 iframe（前端 meta.iframe）：1=是 0=否',
  `link` varchar(255) DEFAULT NULL COMMENT '外链地址（前端 meta.link），与 frame 配合',
  `is_cache` char(1) NOT NULL DEFAULT '0' COMMENT '是否缓存组件（前端 meta.keepAlive）：1=是 0=否',
  `visible` char(1) NOT NULL DEFAULT '1' COMMENT '是否在菜单中显示：1=显示 0=隐藏',
  `status` char(1) NOT NULL DEFAULT '1' COMMENT '状态：1=启用 0=禁用',
  `is_system` char(1) NOT NULL DEFAULT '0' COMMENT '是否系统内置：1=是 0=否',
  `remark` varchar(500) DEFAULT '' COMMENT '备注',
  `create_by` varchar(50) DEFAULT '' COMMENT '创建人',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_by` varchar(50) DEFAULT '' COMMENT '更新人',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted` char(1) NOT NULL DEFAULT '0' COMMENT '逻辑删除：1=是 0=否',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_route_name` (`menu_type`, `route_name`),
  KEY `idx_route_parent_id` (`parent_id`),
  KEY `idx_route_type` (`menu_type`),
  KEY `idx_route_status` (`status`),
  KEY `idx_route_permission` (`permission`),
  KEY `idx_route_visible` (`visible`)
) ENGINE=InnoDB AUTO_INCREMENT=200 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='菜单路由权限表（DIR/MENU 对齐前端 router，BUTTON 对齐权限点）';

-- ----------------------------
-- Records of RouteAuth
--   按 src/render/router/index.js 的 asyncRouteTree 自上而下同步
-- ----------------------------
BEGIN;
-- 一级顶级目录（sidebar: true）
INSERT INTO `RouteAuth` (`id`, `parent_id`, `menu_type`, `menu_name`, `sort`, `icon`, `route_name`, `path`, `component`, `redirect`, `permission`, `frame`, `link`, `is_cache`, `visible`, `status`, `is_system`, `remark`) VALUES
(  1, 0, 'DIR',  '仪表板',     1, 'home',                       NULL,                          '/desktop',     'Layout',                              '/desktop',                     '',  '0', NULL, '0', '1', '1', '1', '前端 router: /desktop'),
(  2, 0, 'DIR',  '结果页面',   2, 'circle-check',               NULL,                          '/result',      'Layout',                              '/result/success',              '',  '0', NULL, '0', '1', '1', '1', '前端 router: /result'),
(  3, 0, 'DIR',  '异常处理',   3, 'alert-triangle',             NULL,                          '/exception',   'Layout',                              '/exception/404',               '',  '0', NULL, '0', '1', '1', '1', '前端 router: /exception'),
(  4, 0, 'DIR',  '系统管理',   4, 'settings',                   NULL,                          '/manage',      'Layout',                              '/manage/user',                 '',  '0', NULL, '0', '1', '1', '1', '前端 router: /manage'),
(  5, 0, 'DIR',  '嵌套菜单',   5, 'list',                       NULL,                          '/nested',      'Layout',                              '/nested/menu1/menu1-1',        '',  '0', NULL, '0', '1', '1', '1', '前端 router: /nested'),
(  6, 0, 'DIR',  '组件演示',   6, 'blocks',                     NULL,                          '/components',  'Layout',                              '/components/notification-demo','',  '0', NULL, '0', '1', '1', '1', '前端 router: /components'),
(  7, 0, 'DIR',  '组件中心',   7, 'shapes',                     NULL,                          '/widgets',     'Layout',                              '/widgets/icon',                '',  '0', NULL, '0', '1', '1', '1', '前端 router: /widgets'),
(  8, 0, 'DIR',  '模板中心',   8, 'layout-template',            NULL,                          '/template',    'Layout',                              '/template/cards',              '',  '0', NULL, '0', '1', '1', '1', '前端 router: /template'),
(  9, 0, 'DIR',  '功能示例',   9, 'flask-conical',              NULL,                          '/examples',    'Layout',                              '/examples/permission/switch-role','','0', NULL, '0', '1', '1', '1', '前端 router: /examples'),
( 10, 0, 'DIR',  '内嵌网页',  10, 'square-arrow-out-up-right',  NULL,                          '/external',    'Layout',                              '',                             '',  '0', NULL, '0', '1', '1', '1', '前端 router: /external');

-- /desktop 仪表板子菜单（parent_id=1）
INSERT INTO `RouteAuth` (`id`, `parent_id`, `menu_type`, `menu_name`, `sort`, `icon`, `route_name`, `path`, `component`, `redirect`, `permission`, `frame`, `link`, `is_cache`, `visible`, `status`, `is_system`, `remark`) VALUES
( 11, 1, 'MENU', '工作台',     1, 'layout-dashboard', 'desktop',                '/desktop',           '@/views/dashboard/console/index.vue', '', 'dashboard:view',   '0', NULL, '1', '1', '1', '1', ''),
( 12, 1, 'MENU', '数据看板',   2, 'home',             'dashboard-home',        '/desktop/dashboard', '@/views/home/index.vue',              '', 'dashboard:view',   '0', NULL, '1', '1', '1', '1', ''),
( 13, 1, 'MENU', '分析页',     3, 'chart-line',       'dashboard-analysis',    '/desktop/analysis',  '@/views/dashboard/analysis/index.vue', '', 'dashboard:view',   '0', NULL, '1', '1', '1', '1', ''),
( 14, 1, 'MENU', '电子商务',   4, 'shopping-cart',    'dashboard-ecommerce',   '/desktop/ecommerce', '@/views/dashboard/ecommerce/index.vue','', 'dashboard:view',   '0', NULL, '1', '1', '1', '1', ''),
( 15, 1, 'MENU', '人力资源',   5, 'users-round',      'dashboard-hrm',         '/desktop/hrm',       '@/views/dashboard/hrm/index.vue',      '', 'dashboard:view',   '0', NULL, '1', '1', '1', '1', ''),
( 16, 1, 'MENU', '职位仪表盘', 6, 'briefcase',        'dashboard-jobs',        '/desktop/jobs',      '@/views/dashboard/jobs/index.vue',     '', 'dashboard:view',   '0', NULL, '1', '1', '1', '1', ''),
( 17, 1, 'MENU', '销售看板',   7, 'trending-up',      'dashboard-sales',       '/desktop/sales',     '@/views/dashboard/sales/index.vue',    '', 'dashboard:view',   '0', NULL, '1', '1', '1', '1', ''),
( 18, 1, 'MENU', '社交媒体',   8, 'share-2',          'dashboard-social',      '/desktop/social',    '@/views/dashboard/social/index.vue',   '', 'dashboard:view',   '0', NULL, '1', '1', '1', '1', ''),
( 19, 1, 'MENU', '加密货币',   9, 'bitcoin',          'dashboard-crypto',      '/desktop/crypto',    '@/views/dashboard/crypto/index.vue',   '', 'dashboard:view',   '0', NULL, '1', '1', '1', '1', '');

-- /result 结果页面子菜单（parent_id=2）
INSERT INTO `RouteAuth` (`id`, `parent_id`, `menu_type`, `menu_name`, `sort`, `icon`, `route_name`, `path`, `component`, `redirect`, `permission`, `frame`, `link`, `is_cache`, `visible`, `status`, `is_system`, `remark`) VALUES
( 20, 2, 'MENU', '成功页', 1, 'circle-check', 'result-success', '/result/success', '@/views/result/success/index.vue', '', 'result:view', '0', NULL, '1', '1', '1', '1', ''),
( 21, 2, 'MENU', '失败页', 2, 'circle-x',     'result-fail',    '/result/fail',    '@/views/result/fail/index.vue',    '', 'result:view', '0', NULL, '1', '1', '1', '1', '');

-- /exception 异常处理子菜单（parent_id=3）
INSERT INTO `RouteAuth` (`id`, `parent_id`, `menu_type`, `menu_name`, `sort`, `icon`, `route_name`, `path`, `component`, `redirect`, `permission`, `frame`, `link`, `is_cache`, `visible`, `status`, `is_system`, `remark`) VALUES
( 22, 3, 'MENU', '404 未找到', 1, 'file-x',        'exception-404', '/exception/404', '@/views/exception/404/index.vue', '', 'exception:view', '0', NULL, '1', '1', '1', '1', ''),
( 23, 3, 'MENU', '500 服务器错误', 2, 'server-crash', 'exception-500', '/exception/500', '@/views/exception/500/index.vue', '', 'exception:view', '0', NULL, '1', '1', '1', '1', '');

-- /manage 系统管理子菜单（parent_id=4）
INSERT INTO `RouteAuth` (`id`, `parent_id`, `menu_type`, `menu_name`, `sort`, `icon`, `route_name`, `path`, `component`, `redirect`, `permission`, `frame`, `link`, `is_cache`, `visible`, `status`, `is_system`, `remark`) VALUES
( 24, 4, 'MENU', '用户管理', 1, 'users',        'system-user', '/manage/user', '@/views/system/user/index.vue', '', 'system:user:view',  '0', NULL, '1', '1', '1', '1', ''),
( 25, 4, 'MENU', '角色管理', 2, 'shield-check', 'system-role', '/manage/role', '@/views/system/role/index.vue', '', 'system:role:view',  '0', NULL, '1', '1', '1', '1', ''),
( 26, 4, 'MENU', '菜单管理', 3, 'list-tree',    'system-menu', '/manage/menu', '@/views/system/menu/index.vue', '', 'system:menu:view',  '0', NULL, '1', '1', '1', '1', '');

-- /nested 嵌套菜单（parent_id=5）
INSERT INTO `RouteAuth` (`id`, `parent_id`, `menu_type`, `menu_name`, `sort`, `icon`, `route_name`, `path`, `component`, `redirect`, `permission`, `frame`, `link`, `is_cache`, `visible`, `status`, `is_system`, `remark`) VALUES
( 27, 5,  'DIR',  '菜单 1',    1, 'list-tree',   NULL,                  '/nested/menu1',  '',  '/nested/menu1/menu1-1', '', '0', NULL, '0', '1', '1', '1', '前端 router: nested/menu1 透传分组'),
( 28, 27, 'MENU', '菜单 1-1',  1, 'file',        'nested-menu1-1','/nested/menu1/menu1-1',  '@/views/nested/menu1/menu1-1/index.vue', '', '', '0', NULL, '1', '1', '1', '1', ''),
( 29, 27, 'MENU', '菜单 1-2',  2, 'file',        'nested-menu1-2','/nested/menu1/menu1-2',  '@/views/nested/menu1/menu1-2/index.vue', '', '', '0', NULL, '1', '1', '1', '1', ''),
( 30, 5,  'DIR',  '菜单 2',    2, 'folder',      NULL,                  '/nested/menu2',  '',  '/nested/menu2/menu2-1', '', '0', NULL, '0', '1', '1', '1', '前端 router: nested/menu2 透传分组'),
( 31, 30, 'MENU', '菜单 2-1',  1, 'file',        'nested-menu2-1','/nested/menu2/menu2-1',  '@/views/nested/menu2/menu2-1/index.vue', '', '', '0', NULL, '1', '1', '1', '1', ''),
( 32, 5,  'MENU', '菜单 3',    3, 'layers',      'nested-menu3',  '/nested/menu3',  '@/views/nested/menu3/index.vue',  '', '', '0', NULL, '1', '1', '1', '1', '');

-- /components 组件演示（parent_id=6）
INSERT INTO `RouteAuth` (`id`, `parent_id`, `menu_type`, `menu_name`, `sort`, `icon`, `route_name`, `path`, `component`, `redirect`, `permission`, `frame`, `link`, `is_cache`, `visible`, `status`, `is_system`, `remark`) VALUES
( 33, 6, 'MENU', '通知演示', 1, 'bell',    'notification-demo', '/components/notification-demo', '@/views/notification-demo/index.vue', '', 'components:demo:view', '0', NULL, '1', '1', '1', '1', ''),
( 34, 6, 'MENU', '请求演示', 2, 'webhook', 'request-demo',      '/components/request-demo',      '@/views/request-demo/index.vue',      '', 'components:demo:view', '0', NULL, '1', '1', '1', '1', '');

-- /widgets 组件中心（parent_id=7）
INSERT INTO `RouteAuth` (`id`, `parent_id`, `menu_type`, `menu_name`, `sort`, `icon`, `route_name`, `path`, `component`, `redirect`, `permission`, `frame`, `link`, `is_cache`, `visible`, `status`, `is_system`, `remark`) VALUES
( 35, 7, 'MENU', '图标',           1,  'smile',                  'widgets-icon',           '/widgets/icon',           '@/views/widgets/icon/index.vue',           '', 'widgets:view', '0', NULL, '1', '1', '1', '1', ''),
( 36, 7, 'MENU', '图像裁剪',       2,  'crop',                   'widgets-image-crop',     '/widgets/image-crop',     '@/views/widgets/image-crop/index.vue',     '', 'widgets:view', '0', NULL, '1', '1', '1', '1', ''),
( 37, 7, 'MENU', '文件上传',       3,  'upload',                 'widgets-file-upload',    '/widgets/file-upload',    '@/views/widgets/file-upload/index.vue',    '', 'widgets:view', '0', NULL, '1', '1', '1', '1', ''),
( 38, 7, 'MENU', '大文件上传',     4,  'cloud-upload',           'widgets-chunk-upload',   '/widgets/chunk-upload',   '@/views/widgets/chunk-upload/index.vue',   '', 'widgets:view', '0', NULL, '1', '1', '1', '1', 'showTextBadge=New'),
( 39, 7, 'MENU', 'Excel 导入导出', 5,  'file-spreadsheet',       'widgets-excel',          '/widgets/excel',          '@/views/widgets/excel/index.vue',          '', 'widgets:view', '0', NULL, '1', '1', '1', '1', ''),
( 40, 7, 'MENU', '数字滚动',       6,  'sigma',                  'widgets-count-to',       '/widgets/count-to',       '@/views/widgets/count-to/index.vue',       '', 'widgets:view', '0', NULL, '1', '1', '1', '1', ''),
( 41, 7, 'MENU', '容器变形',       7,  'layers-3',               'widgets-morph-container','/widgets/morph-container','@/views/widgets/morph-container/index.vue','', 'widgets:view', '0', NULL, '1', '1', '1', '1', 'showTextBadge=New'),
( 42, 7, 'MENU', '富文本编辑器',   8,  'notebook-pen',           'widgets-wang-editor',    '/widgets/wang-editor',    '@/views/widgets/wang-editor/index.vue',    '', 'widgets:view', '0', NULL, '1', '1', '1', '1', ''),
( 43, 7, 'MENU', '水印',           9,  'droplets',               'widgets-watermark',      '/widgets/watermark',      '@/views/widgets/watermark/index.vue',      '', 'widgets:view', '0', NULL, '1', '1', '1', '1', ''),
( 44, 7, 'MENU', '右键菜单',      10,  'square-mouse-pointer',   'widgets-context-menu',   '/widgets/context-menu',   '@/views/widgets/context-menu/index.vue',   '', 'widgets:view', '0', NULL, '1', '1', '1', '1', ''),
( 45, 7, 'MENU', '二维码',        11,  'qr-code',                'widgets-qrcode',         '/widgets/qrcode',         '@/views/widgets/qrcode/index.vue',         '', 'widgets:view', '0', NULL, '1', '1', '1', '1', ''),
( 46, 7, 'MENU', '拖拽',          12,  'grip-vertical',          'widgets-drag',           '/widgets/drag',           '@/views/widgets/drag/index.vue',           '', 'widgets:view', '0', NULL, '1', '1', '1', '1', ''),
( 47, 7, 'MENU', '文字滚动',      13,  'scroll-text',            'widgets-text-scroll',    '/widgets/text-scroll',    '@/views/widgets/text-scroll/index.vue',    '', 'widgets:view', '0', NULL, '1', '1', '1', '1', ''),
( 48, 7, 'MENU', '礼花',          14,  'party-popper',           'widgets-fireworks',      '/widgets/fireworks',      '@/views/widgets/fireworks/index.vue',      '', 'widgets:view', '0', NULL, '1', '1', '1', '1', '');

-- /template 模板中心（parent_id=8）
INSERT INTO `RouteAuth` (`id`, `parent_id`, `menu_type`, `menu_name`, `sort`, `icon`, `route_name`, `path`, `component`, `redirect`, `permission`, `frame`, `link`, `is_cache`, `visible`, `status`, `is_system`, `remark`) VALUES
( 49, 8, 'MENU', '聊天',   1, 'messages-square',     'template-chat',    '/template/chat',    '@/views/template/chat/index.vue',    '', 'template:view', '0', NULL, '1', '1', '1', '1', ''),
( 50, 8, 'MENU', '卡片',   2, 'layers',              'template-cards',   '/template/cards',   '@/views/template/cards/index.vue',   '', 'template:view', '0', NULL, '1', '1', '1', '1', ''),
( 51, 8, 'MENU', '横幅',   3, 'gallery-horizontal',  'template-banners', '/template/banners', '@/views/template/banners/index.vue', '', 'template:view', '0', NULL, '1', '1', '1', '1', ''),
( 52, 8, 'MENU', '图表',   4, 'bar-chart-3',         'template-charts',  '/template/charts',  '@/views/template/charts/index.vue',  '', 'template:view', '0', NULL, '1', '1', '1', '1', ''),
( 53, 8, 'MENU', '日历',   5, 'calendar',            'template-calendar','/template/calendar','@/views/template/calendar/index.vue','', 'template:view', '0', NULL, '1', '1', '1', '1', ''),
( 54, 8, 'MENU', '定价',   6, 'credit-card',         'template-pricing', '/template/pricing', '@/views/template/pricing/index.vue', '', 'template:view', '0', NULL, '1', '1', '1', '1', '');

-- /examples 功能示例（parent_id=9）
INSERT INTO `RouteAuth` (`id`, `parent_id`, `menu_type`, `menu_name`, `sort`, `icon`, `route_name`, `path`, `component`, `redirect`, `permission`, `frame`, `link`, `is_cache`, `visible`, `status`, `is_system`, `remark`) VALUES
( 55,  9, 'DIR',  '权限管理',   1, 'lock',          NULL,                      '/examples/permission',  '',  '/examples/permission/switch-role', '', '0', NULL, '0', '1', '1', '1', '前端 router: examples/permission 透传分组'),
( 56, 55, 'MENU', '切换角色',   1, 'user-round',    'example-switch-role',  '/examples/permission/switch-role',  '@/views/examples/permission/switch-role/index.vue',  '', 'examples:permission:switch', '0', NULL, '1', '1', '1', '1', ''),
( 57, 55, 'MENU', '按钮权限',   2, 'shield-check',  'example-button-auth',  '/examples/permission/button-auth',  '@/views/examples/permission/button-auth/index.vue',  '', 'examples:permission:button', '0', NULL, '1', '1', '1', '1', ''),
( 58, 55, 'MENU', '页面可见性', 3, 'eye',           'example-page-visibility', '/examples/permission/page-visibility', '@/views/examples/permission/page-visibility/index.vue', '', 'examples:permission:visibility', '0', NULL, '1', '1', '1', '1', '前端 meta.roles=[admin]，仅管理员可见'),
( 59,  9, 'MENU', '基础表格',   2, 'table',         'example-table-basic',     '/examples/table-basic',     '@/views/examples/tables/basic.vue',     '', 'examples:table:view',  '0', NULL, '1', '1', '1', '1', ''),
( 60,  9, 'MENU', '高级表格',   3, 'table-2',       'advance-table-demo',      '/examples/table-advanced',  '@/views/advanceTable/index.vue',         '', 'examples:table:view',  '0', NULL, '1', '1', '1', '1', ''),
( 61,  9, 'MENU', '可编辑表格', 4, 'notebook-pen',  'example-table-editable',  '/examples/table-editable',  '@/views/editableTable/index.vue',         '', 'examples:table:view',  '0', NULL, '1', '1', '1', '1', ''),
( 62,  9, 'MENU', '树表格',     5, 'list-tree',     'example-table-tree',      '/examples/table-tree',      '@/views/treeTable/index.vue',            '', 'examples:table:view',  '0', NULL, '1', '1', '1', '1', ''),
( 63,  9, 'MENU', '基础表单',   6, 'file-input',    'example-form-basic',      '/examples/form',            '@/views/examples/forms/basic.vue',       '', 'examples:form:view',   '0', NULL, '1', '1', '1', '1', ''),
( 64,  9, 'MENU', '搜索表单',   7, 'search',        'example-search-form',     '/examples/search-form',     '@/views/examples/forms/search-bar.vue',  '', 'examples:form:view',   '0', NULL, '1', '1', '1', '1', ''),
( 65,  9, 'MENU', '左树右表',   8, 'list-tree',     'example-tree-table',      '/examples/tree-table',      '@/views/examples/tables/tree.vue',       '', 'examples:table:view',  '0', NULL, '1', '1', '1', '1', ''),
( 66,  9, 'MENU', 'Socket 连接', 9, 'wifi',         'example-socket',          '/examples/socket',          '@/views/examples/socket/index.vue',      '', 'examples:socket:view', '0', NULL, '1', '1', '1', '1', '');

-- /external 内嵌网页（parent_id=10）
INSERT INTO `RouteAuth` (`id`, `parent_id`, `menu_type`, `menu_name`, `sort`, `icon`, `route_name`, `path`, `component`, `redirect`, `permission`, `frame`, `link`, `is_cache`, `visible`, `status`, `is_system`, `remark`) VALUES
( 67, 10, 'MENU', 'Vue 官网(外部链接)',     1, 'atom',    'external-vue',     '/external/vue',     '@/views/iframe/route', '', 'external:view', '0', 'https://cn.vuejs.org',     '1', '1', '1', '1', 'meta.link=外部浏览器打开'),
( 68, 10, 'MENU', 'Electron 官网(内嵌)',    2, 'zap',     'external-electron','/external/electron','@/views/iframe/route', '', 'external:view', '1', 'https://www.electronjs.org','1', '1', '1', '1', 'meta.iframe=true'),
( 69, 10, 'MENU', 'GitHub(内嵌)',           3, 'github',  'external-github',  '/external/github',  '@/views/iframe/route', '', 'external:view', '1', 'https://github.com',        '1', '1', '1', '1', 'meta.iframe=true');

-- 个人中心（hideInMenu / 不出现在侧边栏，仅头像下拉进入；parent_id=0，sort 置后，visible=0）
INSERT INTO `RouteAuth` (`id`, `parent_id`, `menu_type`, `menu_name`, `sort`, `icon`, `route_name`, `path`, `component`, `redirect`, `permission`, `frame`, `link`, `is_cache`, `visible`, `status`, `is_system`, `remark`) VALUES
( 70, 0, 'MENU', '个人中心', 99, 'user-round', 'profile', '/profile', '@/views/profile/index.vue', '', 'profile:view', '0', NULL, '1', '0', '1', '1', '前端 router: /profile，hideInMenu');

-- 按钮权限（BUTTON 类型，挂在对应菜单下）
-- 用户管理 (id=24)
INSERT INTO `RouteAuth` (`id`, `parent_id`, `menu_type`, `menu_name`, `sort`, `icon`, `route_name`, `path`, `component`, `redirect`, `permission`, `frame`, `link`, `is_cache`, `visible`, `status`, `is_system`, `remark`) VALUES
( 80, 24, 'BUTTON', '新增',       1, NULL, NULL, '', NULL, '', 'system:user:add',  '0', NULL, '0', '1', '1', '0', ''),
( 81, 24, 'BUTTON', '编辑',       2, NULL, NULL, '', NULL, '', 'system:user:edit', '0', NULL, '0', '1', '1', '0', ''),
( 82, 24, 'BUTTON', '删除',       3, NULL, NULL, '', NULL, '', 'system:user:delete','0', NULL, '0', '1', '1', '0', ''),
( 83, 24, 'BUTTON', '重置密码',   4, NULL, NULL, '', NULL, '', 'system:user:reset','0', NULL, '0', '1', '1', '0', ''),
( 84, 24, 'BUTTON', '导出',       5, NULL, NULL, '', NULL, '', 'system:user:export','0', NULL, '0', '1', '1', '0', ''),
( 85, 24, 'BUTTON', '分配角色',   6, NULL, NULL, '', NULL, '', 'system:user:assign-role','0', NULL, '0', '1', '1', '0', '');

-- 角色管理 (id=25)
INSERT INTO `RouteAuth` (`id`, `parent_id`, `menu_type`, `menu_name`, `sort`, `icon`, `route_name`, `path`, `component`, `redirect`, `permission`, `frame`, `link`, `is_cache`, `visible`, `status`, `is_system`, `remark`) VALUES
( 90, 25, 'BUTTON', '新增',       1, NULL, NULL, '', NULL, '', 'system:role:add', '0', NULL, '0', '1', '1', '0', ''),
( 91, 25, 'BUTTON', '编辑',       2, NULL, NULL, '', NULL, '', 'system:role:edit','0', NULL, '0', '1', '1', '0', ''),
( 92, 25, 'BUTTON', '删除',       3, NULL, NULL, '', NULL, '', 'system:role:delete','0', NULL, '0', '1', '1', '0', ''),
( 93, 25, 'BUTTON', '分配菜单',   4, NULL, NULL, '', NULL, '', 'system:role:menu','0', NULL, '0', '1', '1', '0', ''),
( 94, 25, 'BUTTON', '分配按钮',   5, NULL, NULL, '', NULL, '', 'system:role:button','0', NULL, '0', '1', '1', '0', '');

-- 菜单管理 (id=26)
INSERT INTO `RouteAuth` (`id`, `parent_id`, `menu_type`, `menu_name`, `sort`, `icon`, `route_name`, `path`, `component`, `redirect`, `permission`, `frame`, `link`, `is_cache`, `visible`, `status`, `is_system`, `remark`) VALUES
( 100, 26, 'BUTTON', '新增',      1, NULL, NULL, '', NULL, '', 'system:menu:add',   '0', NULL, '0', '1', '1', '0', ''),
( 101, 26, 'BUTTON', '编辑',      2, NULL, NULL, '', NULL, '', 'system:menu:edit',  '0', NULL, '0', '1', '1', '0', ''),
( 102, 26, 'BUTTON', '删除',      3, NULL, NULL, '', NULL, '', 'system:menu:delete','0', NULL, '0', '1', '1', '0', '');
COMMIT;

-- ============================================================
--  用户-角色关联 UserRole
-- ============================================================
DROP TABLE IF EXISTS `UserRole`;
CREATE TABLE `UserRole` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL COMMENT '用户ID',
  `role_id` int NOT NULL COMMENT '角色ID',
  `create_by` varchar(50) DEFAULT '' COMMENT '创建人',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_role` (`user_id`,`role_id`),
  KEY `idx_user_role_role_id` (`role_id`),
  CONSTRAINT `fk_user_role_role` FOREIGN KEY (`role_id`) REFERENCES `Roles` (`role_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_user_role_user` FOREIGN KEY (`user_id`) REFERENCES `Users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='用户角色关联表';

-- ----------------------------
-- Records of UserRole
-- ----------------------------
BEGIN;
INSERT INTO `UserRole` (`id`, `user_id`, `role_id`, `create_by`, `create_time`) VALUES
( 1, 1, 2, 'system', '2026-08-04 00:13:45'),
( 2, 2, 1, 'system', '2026-08-04 00:13:45'),
( 3, 2, 2, 'system', '2026-08-04 00:13:45'),
( 4, 2, 3, 'system', '2026-08-04 00:13:45'),
( 5, 5, 1, 'admin',  '2026-05-27 23:50:03'),
( 6, 6, 1, 'admin',  '2026-05-28 00:05:17');
COMMIT;

-- ============================================================
--  角色-菜单关联 RoleRoute
--   ���配策略：
--     - super (id=3): 全部菜单（含 BUTTON）
--     - admin (id=1): 全部 DIR/MENU + 用户/角色/菜单管理下的 BUTTON
--     - user  (id=2): 仅 /desktop、/result、/profile 基础菜单
-- ============================================================
DROP TABLE IF EXISTS `RoleRoute`;
CREATE TABLE `RoleRoute` (
  `id` int NOT NULL AUTO_INCREMENT,
  `role_id` int NOT NULL COMMENT '角色ID',
  `route_id` int NOT NULL COMMENT '菜单ID',
  `create_by` varchar(50) DEFAULT '' COMMENT '创建人',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_role_route` (`role_id`,`route_id`),
  KEY `idx_role_route_route_id` (`route_id`),
  CONSTRAINT `fk_role_route_role`  FOREIGN KEY (`role_id`)  REFERENCES `Roles`     (`role_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_role_route_route` FOREIGN KEY (`route_id`) REFERENCES `RouteAuth` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=500 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='角色菜单权限关联表';

-- ----------------------------
-- Records of RoleRoute
-- ----------------------------
BEGIN;

-- ===== user 角色 (id=2)：基础查看权限 =====
INSERT INTO `RoleRoute` (`role_id`, `route_id`, `create_by`, `create_time`) VALUES
( 2,  1, 'system', '2026-08-04 21:39:59'),  -- 仪表板 DIR
( 2, 11, 'system', '2026-08-04 21:39:59'),  -- 工作台
( 2, 12, 'system', '2026-08-04 21:39:59'),  -- 数据看板
( 2, 13, 'system', '2026-08-04 21:39:59'),  -- 分析页
( 2, 14, 'system', '2026-08-04 21:39:59'),  -- 电子商务
( 2, 15, 'system', '2026-08-04 21:39:59'),  -- 人力资源
( 2, 16, 'system', '2026-08-04 21:39:59'),  -- 职位仪表盘
( 2, 17, 'system', '2026-08-04 21:39:59'),  -- 销售看板
( 2, 18, 'system', '2026-08-04 21:39:59'),  -- 社交媒体
( 2, 19, 'system', '2026-08-04 21:39:59'),  -- 加密货币
( 2,  2, 'system', '2026-08-04 21:39:59'),  -- 结果页面 DIR
( 2, 20, 'system', '2026-08-04 21:39:59'),  -- 成功页
( 2, 21, 'system', '2026-08-04 21:39:59'),  -- 失败页
( 2, 70, 'system', '2026-08-04 21:39:59');  -- 个人中心

-- ===== admin 角色 (id=1)：业务管理员 =====
INSERT INTO `RoleRoute` (`role_id`, `route_id`, `create_by`, `create_time`) VALUES
-- 全部顶级目录
( 1,  1, 'system', '2026-08-04 21:39:59'),
( 1,  2, 'system', '2026-08-04 21:39:59'),
( 1,  3, 'system', '2026-08-04 21:39:59'),
( 1,  4, 'system', '2026-08-04 21:39:59'),
( 1,  5, 'system', '2026-08-04 21:39:59'),
( 1,  6, 'system', '2026-08-04 21:39:59'),
( 1,  7, 'system', '2026-08-04 21:39:59'),
( 1,  8, 'system', '2026-08-04 21:39:59'),
( 1,  9, 'system', '2026-08-04 21:39:59'),
( 1, 10, 'system', '2026-08-04 21:39:59'),
-- 仪表板子项
( 1, 11, 'system', '2026-08-04 21:39:59'),
( 1, 12, 'system', '2026-08-04 21:39:59'),
( 1, 13, 'system', '2026-08-04 21:39:59'),
( 1, 14, 'system', '2026-08-04 21:39:59'),
( 1, 15, 'system', '2026-08-04 21:39:59'),
( 1, 16, 'system', '2026-08-04 21:39:59'),
( 1, 17, 'system', '2026-08-04 21:39:59'),
( 1, 18, 'system', '2026-08-04 21:39:59'),
( 1, 19, 'system', '2026-08-04 21:39:59'),
-- 结果页
( 1, 20, 'system', '2026-08-04 21:39:59'),
( 1, 21, 'system', '2026-08-04 21:39:59'),
-- 异常处理
( 1, 22, 'system', '2026-08-04 21:39:59'),
( 1, 23, 'system', '2026-08-04 21:39:59'),
-- 系统管理三个页面
( 1, 24, 'system', '2026-08-04 21:39:59'),
( 1, 25, 'system', '2026-08-04 21:39:59'),
( 1, 26, 'system', '2026-08-04 21:39:59'),
-- 系统管理下的按钮权限
( 1, 80, 'system', '2026-08-04 21:39:59'),
( 1, 81, 'system', '2026-08-04 21:39:59'),
( 1, 82, 'system', '2026-08-04 21:39:59'),
( 1, 83, 'system', '2026-08-04 21:39:59'),
( 1, 84, 'system', '2026-08-04 21:39:59'),
( 1, 85, 'system', '2026-08-04 21:39:59'),
( 1, 90, 'system', '2026-08-04 21:39:59'),
( 1, 91, 'system', '2026-08-04 21:39:59'),
( 1, 92, 'system', '2026-08-04 21:39:59'),
( 1, 93, 'system', '2026-08-04 21:39:59'),
( 1, 94, 'system', '2026-08-04 21:39:59'),
( 1,100, 'system', '2026-08-04 21:39:59'),
( 1,101, 'system', '2026-08-04 21:39:59'),
( 1,102, 'system', '2026-08-04 21:39:59'),
-- 嵌套/组件/模板/功能示例/外链
( 1, 27, 'system', '2026-08-04 21:39:59'),
( 1, 28, 'system', '2026-08-04 21:39:59'),
( 1, 29, 'system', '2026-08-04 21:39:59'),
( 1, 30, 'system', '2026-08-04 21:39:59'),
( 1, 31, 'system', '2026-08-04 21:39:59'),
( 1, 32, 'system', '2026-08-04 21:39:59'),
( 1, 33, 'system', '2026-08-04 21:39:59'),
( 1, 34, 'system', '2026-08-04 21:39:59'),
( 1, 35, 'system', '2026-08-04 21:39:59'),
( 1, 36, 'system', '2026-08-04 21:39:59'),
( 1, 37, 'system', '2026-08-04 21:39:59'),
( 1, 38, 'system', '2026-08-04 21:39:59'),
( 1, 39, 'system', '2026-08-04 21:39:59'),
( 1, 40, 'system', '2026-08-04 21:39:59'),
( 1, 41, 'system', '2026-08-04 21:39:59'),
( 1, 42, 'system', '2026-08-04 21:39:59'),
( 1, 43, 'system', '2026-08-04 21:39:59'),
( 1, 44, 'system', '2026-08-04 21:39:59'),
( 1, 45, 'system', '2026-08-04 21:39:59'),
( 1, 46, 'system', '2026-08-04 21:39:59'),
( 1, 47, 'system', '2026-08-04 21:39:59'),
( 1, 48, 'system', '2026-08-04 21:39:59'),
( 1, 49, 'system', '2026-08-04 21:39:59'),
( 1, 50, 'system', '2026-08-04 21:39:59'),
( 1, 51, 'system', '2026-08-04 21:39:59'),
( 1, 52, 'system', '2026-08-04 21:39:59'),
( 1, 53, 'system', '2026-08-04 21:39:59'),
( 1, 54, 'system', '2026-08-04 21:39:59'),
( 1, 55, 'system', '2026-08-04 21:39:59'),
( 1, 56, 'system', '2026-08-04 21:39:59'),
( 1, 57, 'system', '2026-08-04 21:39:59'),
( 1, 58, 'system', '2026-08-04 21:39:59'),
( 1, 59, 'system', '2026-08-04 21:39:59'),
( 1, 60, 'system', '2026-08-04 21:39:59'),
( 1, 61, 'system', '2026-08-04 21:39:59'),
( 1, 62, 'system', '2026-08-04 21:39:59'),
( 1, 63, 'system', '2026-08-04 21:39:59'),
( 1, 64, 'system', '2026-08-04 21:39:59'),
( 1, 65, 'system', '2026-08-04 21:39:59'),
( 1, 66, 'system', '2026-08-04 21:39:59'),
( 1, 67, 'system', '2026-08-04 21:39:59'),
( 1, 68, 'system', '2026-08-04 21:39:59'),
( 1, 69, 'system', '2026-08-04 21:39:59'),
( 1, 70, 'system', '2026-08-04 21:39:59');

-- ===== super 角色 (id=3)：拥有全部菜单与按钮 =====
INSERT INTO `RoleRoute` (`role_id`, `route_id`, `create_by`, `create_time`)
SELECT 3, id, 'system', NOW() FROM `RouteAuth` WHERE `deleted` = '0';
COMMIT;

-- ============================================================
--  字典表 Dict（保持原有结构）
-- ============================================================
DROP TABLE IF EXISTS `Dict`;
CREATE TABLE `Dict` (
  `id` int NOT NULL AUTO_INCREMENT,
  `dict_name` varchar(100) NOT NULL COMMENT '字典名称',
  `dict_code` varchar(100) NOT NULL COMMENT '字典编码',
  `status` char(1) NOT NULL DEFAULT '1' COMMENT '状态：1=启用 0=禁用',
  `remark` varchar(500) DEFAULT '' COMMENT '备注',
  `create_by` varchar(50) DEFAULT '' COMMENT '创建人',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_by` varchar(50) DEFAULT '' COMMENT '更新人',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_dict_name` (`dict_name`),
  UNIQUE KEY `uk_dict_code` (`dict_code`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='字典管理表';

-- ----------------------------
-- Records of Dict
-- ----------------------------
BEGIN;
INSERT INTO `Dict` (`id`, `dict_name`, `dict_code`, `status`, `remark`, `create_by`, `create_time`, `update_by`, `update_time`) VALUES (1, '111', '11', '1', '1111111', '', '2026-08-04 22:20:22', '', '2026-08-04 22:27:09');
INSERT INTO `Dict` (`id`, `dict_name`, `dict_code`, `status`, `remark`, `create_by`, `create_time`, `update_by`, `update_time`) VALUES (2, '去玩儿去玩儿', 'code', '1', '111', '', '2026-08-04 22:28:43', '', '2026-08-04 22:28:43');
COMMIT;

-- ============================================================
--  登录日志 LoginLog（保持原有结构）
-- ============================================================
DROP TABLE IF EXISTS `LoginLog`;
CREATE TABLE `LoginLog` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL COMMENT '用户ID',
  `username` varchar(50) DEFAULT NULL COMMENT '用户名',
  `login_type` varchar(20) DEFAULT NULL COMMENT '登录类型：password/code/sms',
  `ip_address` varchar(45) DEFAULT NULL COMMENT 'IP地址',
  `location` varchar(255) DEFAULT NULL COMMENT '登录地点',
  `browser` varchar(100) DEFAULT NULL COMMENT '浏览器',
  `os` varchar(100) DEFAULT NULL COMMENT '操作系统',
  `user_agent` varchar(500) DEFAULT NULL COMMENT '完整UA',
  `status` char(1) NOT NULL DEFAULT '1' COMMENT '登录状态：1=成功 0=失败',
  `message` varchar(255) DEFAULT NULL COMMENT '登录消息',
  `session_id` varchar(36) DEFAULT NULL COMMENT '会话ID',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '登录时间',
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_username` (`username`),
  KEY `idx_ip_address` (`ip_address`),
  KEY `idx_status` (`status`),
  KEY `idx_create_time` (`create_time`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='登录日志表';

-- ----------------------------
-- Records of LoginLog
-- ----------------------------
BEGIN;
INSERT INTO `LoginLog` (`id`, `user_id`, `username`, `login_type`, `ip_address`, `location`, `browser`, `os`, `user_agent`, `status`, `message`, `session_id`, `create_time`) VALUES (1, 2, 'admin', 'password', '127.0.0.1', '本地访问', 'Google Chrome', 'macOS', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36', '1', '登录成功', '12010452-44a7-4295-9a3a-5c33e2c96c28', '2026-08-04 00:13:29');
INSERT INTO `LoginLog` (`id`, `user_id`, `username`, `login_type`, `ip_address`, `location`, `browser`, `os`, `user_agent`, `status`, `message`, `session_id`, `create_time`) VALUES (2, 2, 'Admin', 'password', '127.0.0.1', '本地访问', 'Google Chrome', 'macOS', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36', '1', '登录成功', '1734b15b-f5ba-4ea8-837a-75e11bcd5374', '2026-08-04 00:13:41');
INSERT INTO `LoginLog` (`id`, `user_id`, `username`, `login_type`, `ip_address`, `location`, `browser`, `os`, `user_agent`, `status`, `message`, `session_id`, `create_time`) VALUES (3, NULL, 'Super', 'password', '127.0.0.1', '本地访问', 'Google Chrome', 'macOS', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36', '0', '用户名或密码错误', NULL, '2026-08-04 00:13:42');
INSERT INTO `LoginLog` (`id`, `user_id`, `username`, `login_type`, `ip_address`, `location`, `browser`, `os`, `user_agent`, `status`, `message`, `session_id`, `create_time`) VALUES (4, 2, 'admin', 'password', '127.0.0.1', '本地访问', 'Google Chrome', 'macOS', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36', '1', '登录成功', '41cc0664-03f6-49d5-b34c-e8c934bb85c4', '2026-08-04 00:13:44');
INSERT INTO `LoginLog` (`id`, `user_id`, `username`, `login_type`, `ip_address`, `location`, `browser`, `os`, `user_agent`, `status`, `message`, `session_id`, `create_time`) VALUES (5, 1, 'User', 'password', '127.0.0.1', '本地访问', 'Google Chrome', 'macOS', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36', '1', '登录成功', '9d7e0994-9da8-456b-af84-0bc0c6daac88', '2026-08-04 00:13:45');
INSERT INTO `LoginLog` (`id`, `user_id`, `username`, `login_type`, `ip_address`, `location`, `browser`, `os`, `user_agent`, `status`, `message`, `session_id`, `create_time`) VALUES (6, NULL, 'Super', 'password', '127.0.0.1', '本地访问', 'Google Chrome', 'macOS', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36', '0', '用户名或密码错误', NULL, '2026-08-04 00:13:46');
INSERT INTO `LoginLog` (`id`, `user_id`, `username`, `login_type`, `ip_address`, `location`, `browser`, `os`, `user_agent`, `status`, `message`, `session_id`, `create_time`) VALUES (7, 2, 'admin', 'password', '127.0.0.1', '本地访问', 'Google Chrome', 'macOS', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36', '1', '登录成功', 'fda4ea9d-21da-4a84-a544-80bda803aad5', '2026-08-04 00:13:48');
INSERT INTO `LoginLog` (`id`, `user_id`, `username`, `login_type`, `ip_address`, `location`, `browser`, `os`, `user_agent`, `status`, `message`, `session_id`, `create_time`) VALUES (8, 2, 'admin', 'password', '127.0.0.1', '本地访问', 'Google Chrome', 'macOS', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36', '1', '登录成功', '8e53cafa-b0b7-4257-8ded-e8bf48b04144', '2026-08-04 22:12:34');
INSERT INTO `LoginLog` (`id`, `user_id`, `username`, `login_type`, `ip_address`, `location`, `browser`, `os`, `user_agent`, `status`, `message`, `session_id`, `create_time`) VALUES (9, 2, 'admin', 'password', '127.0.0.1', '本地访问', 'Google Chrome', 'macOS', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36', '1', '登录成功', 'bc8116bf-2537-4756-ab73-e54d2e8220a0', '2026-08-04 23:26:45');
INSERT INTO `LoginLog` (`id`, `user_id`, `username`, `login_type`, `ip_address`, `location`, `browser`, `os`, `user_agent`, `status`, `message`, `session_id`, `create_time`) VALUES (10, 2, 'admin', 'password', '127.0.0.1', '本地访问', 'Google Chrome', 'macOS', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36', '1', '登录成功', 'd33a88a1-93e9-489b-aed3-52d9e1819547', '2026-08-04 23:27:11');
INSERT INTO `LoginLog` (`id`, `user_id`, `username`, `login_type`, `ip_address`, `location`, `browser`, `os`, `user_agent`, `status`, `message`, `session_id`, `create_time`) VALUES (11, 2, 'admin', 'password', '127.0.0.1', '本地访问', 'Google Chrome', 'macOS', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36', '1', '登录成功', '2f528b39-7cea-4f08-b714-56dfe9d1fdfa', '2026-08-04 23:31:19');
INSERT INTO `LoginLog` (`id`, `user_id`, `username`, `login_type`, `ip_address`, `location`, `browser`, `os`, `user_agent`, `status`, `message`, `session_id`, `create_time`) VALUES (12, 2, 'Admin', 'password', '::1', '本地访问', 'Unknown', 'Unknown', 'curl/8.7.1', '1', '登录成功', 'eba6a579-fb62-4a4d-9d25-962d09ff07fc', '2026-08-04 23:32:19');
INSERT INTO `LoginLog` (`id`, `user_id`, `username`, `login_type`, `ip_address`, `location`, `browser`, `os`, `user_agent`, `status`, `message`, `session_id`, `create_time`) VALUES (13, 2, 'Admin', 'password', '127.0.0.1', '本地访问', 'Google Chrome', 'macOS', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/150.0.0.0 Safari/537.36', '1', '登录成功', '13cdb553-3af7-4275-bca0-6b612ba8cc9d', '2026-08-04 23:35:21');
INSERT INTO `LoginLog` (`id`, `user_id`, `username`, `login_type`, `ip_address`, `location`, `browser`, `os`, `user_agent`, `status`, `message`, `session_id`, `create_time`) VALUES (14, 2, 'Admin', 'password', '127.0.0.1', '本地访问', 'Google Chrome', 'macOS', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/150.0.0.0 Safari/537.36', '1', '登录成功', '06e34f0a-0205-4285-95fc-4b5cba273056', '2026-08-04 23:36:30');
INSERT INTO `LoginLog` (`id`, `user_id`, `username`, `login_type`, `ip_address`, `location`, `browser`, `os`, `user_agent`, `status`, `message`, `session_id`, `create_time`) VALUES (15, 2, 'admin', 'password', '127.0.0.1', '本地访问', 'Google Chrome', 'macOS', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36', '1', '登录成功', '2b37515d-9adb-4d51-a76c-88c961e514c8', '2026-08-04 23:39:18');
INSERT INTO `LoginLog` (`id`, `user_id`, `username`, `login_type`, `ip_address`, `location`, `browser`, `os`, `user_agent`, `status`, `message`, `session_id`, `create_time`) VALUES (16, 2, 'admin', 'password', '127.0.0.1', '本地访问', 'Google Chrome', 'macOS', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36', '1', '登录成功', '71d7bcbf-d730-4226-a6a4-5a93a41e7f02', '2026-08-05 00:16:58');
COMMIT;

-- ============================================================
--  迁移记录表 migrations（保持原有结构）
-- ============================================================
DROP TABLE IF EXISTS `migrations`;
CREATE TABLE `migrations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `batch` int NOT NULL,
  `executedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------
-- Records of migrations
-- ----------------------------
BEGIN;
COMMIT;

-- ============================================================
--  操作日�� OperationLog（保持原有结构）
--  旧记录中的 route_id 字段是 JSON 文本快照，不构成 FK 关系，可继续保留
-- ============================================================
DROP TABLE IF EXISTS `OperationLog`;
CREATE TABLE `OperationLog` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL COMMENT '操作用户ID',
  `username` varchar(50) DEFAULT NULL COMMENT '操作用户名',
  `action` varchar(100) DEFAULT NULL COMMENT '操作类型',
  `module` varchar(50) DEFAULT NULL COMMENT '系统模块',
  `method` varchar(10) DEFAULT NULL COMMENT '请求方法 GET/POST/PUT/DELETE',
  `request_url` varchar(255) DEFAULT NULL COMMENT '请求URL',
  `request_params` text COMMENT '请求参数(JSON)',
  `response_status` varchar(10) DEFAULT NULL COMMENT '响应状态码',
  `response_msg` varchar(255) DEFAULT NULL COMMENT '响应消息',
  `response_body` text COMMENT '响应体(JSON)',
  `ip_address` varchar(45) DEFAULT NULL COMMENT 'IP地址',
  `user_agent` varchar(500) DEFAULT NULL COMMENT '浏览器标识',
  `execute_time` int DEFAULT NULL COMMENT '执行时间(毫秒)',
  `status` char(1) NOT NULL DEFAULT '1' COMMENT '操作状态：1=成功 0=失败',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '操作时间',
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_username` (`username`),
  KEY `idx_action` (`action`),
  KEY `idx_module` (`module`),
  KEY `idx_create_time` (`create_time`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB AUTO_INCREMENT=39 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='操作日志表';

-- ----------------------------
-- Records of OperationLog
-- ----------------------------
BEGIN;
INSERT INTO `OperationLog` (`id`, `user_id`, `username`, `action`, `module`, `method`, `request_url`, `request_params`, `response_status`, `response_msg`, `response_body`, `ip_address`, `user_agent`, `execute_time`, `status`, `create_time`) VALUES (1, 2, 'admin', '编辑', '用户管理', 'POST', '', '{\"id\":1,\"status\":\"1\"}', '', '更新用户状态成功', '{\"code\":200,\"msg\":\"更新用户状态成功\"}', '', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36', 0, '1', '2026-08-03 23:49:43');
INSERT INTO `OperationLog` (`id`, `user_id`, `username`, `action`, `module`, `method`, `request_url`, `request_params`, `response_status`, `response_msg`, `response_body`, `ip_address`, `user_agent`, `execute_time`, `status`, `create_time`) VALUES (2, 2, 'admin', '编辑', '菜单管理', 'POST', '', '{\"id\":4,\"parentId\":3,\"menuType\":2,\"menuName\":\"子菜单一\",\"routeName\":\"function_hide-child_one\",\"routePath\":\"/function/hide-child/one\",\"component\":\"view.function_hide-child_one\",\"redirect\":\"\",\"orderNum\":0,\"icon\":\"material-symbols:filter-list-off\",\"iconType\":1,\"hideInMenu\":false,\"activeMenu\":\"function_hide-child\",\"multiTab\":false,\"keepAlive\":false,\"status\":\"1\"}', '', '更新菜单成功', '{\"code\":200,\"msg\":\"更新菜单成功\"}', '', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36', 0, '1', '2026-08-04 00:13:12');
INSERT INTO `OperationLog` (`id`, `user_id`, `username`, `action`, `module`, `method`, `request_url`, `request_params`, `response_status`, `response_msg`, `response_body`, `ip_address`, `user_agent`, `execute_time`, `status`, `create_time`) VALUES (3, 2, 'admin', '编辑', '菜单管理', 'POST', '', '{\"id\":5,\"parentId\":3,\"menuType\":2,\"menuName\":\"子菜单三\",\"routeName\":\"function_hide-child_three\",\"routePath\":\"/function/hide-child/three\",\"component\":\"view.function_hide-child_three\",\"redirect\":\"\",\"orderNum\":0,\"icon\":\"\",\"iconType\":1,\"hideInMenu\":false,\"activeMenu\":\"function_hide-child\",\"multiTab\":false,\"keepAlive\":false,\"status\":\"1\"}', '', '更新菜单成功', '{\"code\":200,\"msg\":\"更新菜单成功\"}', '', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36', 0, '1', '2026-08-04 00:13:16');
INSERT INTO `OperationLog` (`id`, `user_id`, `username`, `action`, `module`, `method`, `request_url`, `request_params`, `response_status`, `response_msg`, `response_body`, `ip_address`, `user_agent`, `execute_time`, `status`, `create_time`) VALUES (4, 2, 'admin', '编辑', '菜单管理', 'POST', '', '{\"id\":6,\"parentId\":3,\"menuType\":2,\"menuName\":\"子菜单二\",\"routeName\":\"function_hide-child_two\",\"routePath\":\"/function/hide-child/two\",\"component\":\"view.function_hide-child_two\",\"redirect\":\"\",\"orderNum\":0,\"icon\":\"\",\"iconType\":1,\"hideInMenu\":false,\"activeMenu\":\"function_hide-child\",\"multiTab\":false,\"keepAlive\":false,\"status\":\"1\"}', '', '更新菜单成功', '{\"code\":200,\"msg\":\"更新菜单成功\"}', '', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36', 0, '1', '2026-08-04 00:13:20');
INSERT INTO `OperationLog` (`id`, `user_id`, `username`, `action`, `module`, `method`, `request_url`, `request_params`, `response_status`, `response_msg`, `response_body`, `ip_address`, `user_agent`, `execute_time`, `status`, `create_time`) VALUES (5, 2, 'admin', '编辑', '用户管理', 'POST', '', '{\"id\":2,\"gender\":\"1\",\"email\":\"bob@example.com\",\"phone\":\"15374536782\",\"nickName\":\"Bob\",\"status\":\"1\",\"roleIds\":[1,2,3]}', '', '更新用户成功', '{\"code\":200,\"msg\":\"更新用户成功\"}', '', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36', 0, '1', '2026-08-04 21:39:59');
INSERT INTO `OperationLog` (`id`, `user_id`, `username`, `action`, `module`, `method`, `request_url`, `request_params`, `response_status`, `response_msg`, `response_body`, `ip_address`, `user_agent`, `execute_time`, `status`, `create_time`) VALUES (6, 2, 'admin', '新增', '菜单管理', 'POST', '', '{\"parentId\":13,\"menuType\":2,\"menuName\":\"字典管理\",\"routeName\":\"manage_dict\",\"routePath\":\"/manage/dict\",\"component\":\"view.manage_dict\",\"orderNum\":4,\"icon\":\"icon-park-o11utline:all-application\",\"iconType\":1,\"hideInMenu\":false,\"activeMenu\":null,\"multiTab\":false,\"keepAlive\":false,\"status\":\"1\"}', '', '创建菜单成功', '{\"code\":200,\"msg\":\"创建菜单成功\",\"data\":{\"id\":40}}', '', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36', 0, '1', '2026-08-04 21:46:00');
INSERT INTO `OperationLog` (`id`, `user_id`, `username`, `action`, `module`, `method`, `request_url`, `request_params`, `response_status`, `response_msg`, `response_body`, `ip_address`, `user_agent`, `execute_time`, `status`, `create_time`) VALUES (7, 2, 'admin', '编辑', '角色管理', 'POST', '', '{\"roleId\":3,\"routeIds\":[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27]}', '', '更新角色菜单成功', '{\"code\":200,\"msg\":\"更新角色菜单成功\"}', '', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36', 0, '1', '2026-08-04 21:46:19');
INSERT INTO `OperationLog` (`id`, `user_id`, `username`, `action`, `module`, `method`, `request_url`, `request_params`, `response_status`, `response_msg`, `response_body`, `ip_address`, `user_agent`, `execute_time`, `status`, `create_time`) VALUES (12, 2, 'admin', '删除', '菜单管理', 'POST', '', '{\"id\":40}', '', '删除菜单成功', '{\"code\":200,\"msg\":\"删除菜单成功\"}', '', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36', 0, '1', '2026-08-04 22:09:45');
INSERT INTO `OperationLog` (`id`, `user_id`, `username`, `action`, `module`, `method`, `request_url`, `request_params`, `response_status`, `response_msg`, `response_body`, `ip_address`, `user_agent`, `execute_time`, `status`, `create_time`) VALUES (13, 2, 'admin', '新增', '菜单管理', 'POST', '', '{\"parentId\":13,\"menuType\":2,\"menuName\":\"字典管理\",\"routeName\":\"manage_dict\",\"routePath\":\"/manage/dict\",\"component\":\"view.manage_dict\",\"orderNum\":4,\"icon\":\"ic:baseline-block\",\"iconType\":1,\"hideInMenu\":false,\"activeMenu\":null,\"multiTab\":false,\"keepAlive\":false,\"status\":\"1\"}', '', '创建菜单成功', '{\"code\":200,\"msg\":\"创建菜单成功\",\"data\":{\"id\":41}}', '', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36', 0, '1', '2026-08-04 22:11:30');
INSERT INTO `OperationLog` (`id`, `user_id`, `username`, `action`, `module`, `method`, `request_url`, `request_params`, `response_status`, `response_msg`, `response_body`, `ip_address`, `user_agent`, `execute_time`, `status`, `create_time`) VALUES (15, 2, 'admin', '编辑', '菜单管理', 'POST', '', '{\"id\":17,\"parentId\":13,\"menuType\":2,\"menuName\":\"用户详情\",\"routeName\":\"manage_user-detail\",\"routePath\":\"/manage/user-detail/:id\",\"component\":\"view.manage_user-detail\",\"redirect\":\"\",\"orderNum\":0,\"icon\":\"\",\"iconType\":1,\"hideInMenu\":false,\"activeMenu\":\"manage_user\",\"multiTab\":false,\"keepAlive\":false,\"status\":\"1\"}', '', '更新菜单成功', '{\"code\":200,\"msg\":\"更新菜单成功\"}', '', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36', 0, '1', '2026-08-04 22:12:18');
INSERT INTO `OperationLog` (`id`, `user_id`, `username`, `action`, `module`, `method`, `request_url`, `request_params`, `response_status`, `response_msg`, `response_body`, `ip_address`, `user_agent`, `execute_time`, `status`, `create_time`) VALUES (16, 2, 'admin', '新增', '系统管理', 'POST', '', '{\"dictName\":\"111\",\"dictCode\":\"11\",\"status\":\"1\",\"remark\":\"\"}', '', '创建字典成功', '{\"code\":200,\"msg\":\"创建字典成功\",\"data\":{\"id\":1}}', '', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36', 0, '1', '2026-08-04 22:20:22');
INSERT INTO `OperationLog` (`id`, `user_id`, `username`, `action`, `module`, `method`, `request_url`, `request_params`, `response_status`, `response_msg`, `response_body`, `ip_address`, `user_agent`, `execute_time`, `status`, `create_time`) VALUES (17, 2, 'admin', '编辑', '系统管理', 'POST', '', '{\"id\":1,\"dictId\":1,\"dictName\":\"111\",\"dictCode\":\"11\",\"status\":\"1\",\"remark\":\"1111111\"}', '', '更新字典成功', '{\"code\":200,\"msg\":\"更新字典成功\"}', '', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36', 0, '1', '2026-08-04 22:27:09');
INSERT INTO `OperationLog` (`id`, `user_id`, `username`, `action`, `module`, `method`, `request_url`, `request_params`, `response_status`, `response_msg`, `response_body`, `ip_address`, `user_agent`, `execute_time`, `status`, `create_time`) VALUES (18, 2, 'admin', '新增', '系统管理', 'POST', '', '{\"dictName\":\"去玩儿去玩儿\",\"dictCode\":\"code\",\"status\":\"1\",\"remark\":\"111\"}', '', '创建字典成功', '{\"code\":200,\"msg\":\"创建字典成功\",\"data\":{\"id\":2}}', '', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36', 0, '1', '2026-08-04 22:28:43');
INSERT INTO `OperationLog` (`id`, `user_id`, `username`, `action`, `module`, `method`, `request_url`, `request_params`, `response_status`, `response_msg`, `response_body`, `ip_address`, `user_agent`, `execute_time`, `status`, `create_time`) VALUES (19, 2, 'admin', '新增', '菜单管理', 'POST', '', '{\"parentId\":41,\"menuType\":3,\"menuName\":\"新增\",\"routeName\":\"add\",\"routePath\":\"\",\"orderNum\":1,\"iconType\":1,\"hideInMenu\":false,\"multiTab\":false,\"keepAlive\":false,\"status\":\"1\"}', '', '创建菜单成功', '{\"code\":200,\"msg\":\"创建菜单成功\",\"data\":{\"id\":42}}', '', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36', 0, '1', '2026-08-04 22:29:48');
INSERT INTO `OperationLog` (`id`, `user_id`, `username`, `action`, `module`, `method`, `request_url`, `request_params`, `response_status`, `response_msg`, `response_body`, `ip_address`, `user_agent`, `execute_time`, `status`, `create_time`) VALUES (20, 2, 'admin', '新增', '菜单管理', 'POST', '', '{\"parentId\":41,\"menuType\":3,\"menuName\":\"编辑\",\"routeName\":\"edit\",\"routePath\":\"\",\"orderNum\":2,\"iconType\":1,\"hideInMenu\":false,\"multiTab\":false,\"keepAlive\":false,\"status\":\"1\"}', '', '创建菜单成功', '{\"code\":200,\"msg\":\"创建菜单成功\",\"data\":{\"id\":43}}', '', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36', 0, '1', '2026-08-04 22:30:00');
INSERT INTO `OperationLog` (`id`, `user_id`, `username`, `action`, `module`, `method`, `request_url`, `request_params`, `response_status`, `response_msg`, `response_body`, `ip_address`, `user_agent`, `execute_time`, `status`, `create_time`) VALUES (21, 2, 'admin', '新增', '菜单管理', 'POST', '', '{\"parentId\":41,\"menuType\":3,\"menuName\":\"删除\",\"routeName\":\"delete\",\"routePath\":\"\",\"orderNum\":2,\"iconType\":1,\"hideInMenu\":false,\"multiTab\":false,\"keepAlive\":false,\"status\":\"1\"}', '', '创建菜单成功', '{\"code\":200,\"msg\":\"创建菜单成功\",\"data\":{\"id\":44}}', '', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36', 0, '1', '2026-08-04 22:30:09');
INSERT INTO `OperationLog` (`id`, `user_id`, `username`, `action`, `module`, `method`, `request_url`, `request_params`, `response_status`, `response_msg`, `response_body`, `ip_address`, `user_agent`, `execute_time`, `status`, `create_time`) VALUES (32, 2, 'admin', '新增', '用户管理', 'POST', '', '{\"username\":\"111\",\"password\":\"***\",\"gender\":\"1\",\"email\":\"1738248428@qq.com\",\"phone\":\"15651376329\",\"status\":\"1\",\"roleIds\":[1,2]}', '', '邮箱已存在', '{\"code\":40013,\"msg\":\"邮箱已存在\"}', '', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36', 0, '0', '2026-08-04 23:20:42');
INSERT INTO `OperationLog` (`id`, `user_id`, `username`, `action`, `module`, `method`, `request_url`, `request_params`, `response_status`, `response_msg`, `response_body`, `ip_address`, `user_agent`, `execute_time`, `status`, `create_time`) VALUES (33, 2, 'admin', '新增', '用户管理', 'POST', '', '{\"username\":\"111\",\"password\":\"***\",\"gender\":\"1\",\"email\":\"1738248421@qq.com\",\"phone\":\"15651376329\",\"status\":\"1\",\"roleIds\":[1,2]}', '', '创建用户成功', '{\"code\":200,\"msg\":\"创建用户成功\",\"data\":{\"id\":9}}', '', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36', 0, '1', '2026-08-04 23:20:46');
INSERT INTO `OperationLog` (`id`, `user_id`, `username`, `action`, `module`, `method`, `request_url`, `request_params`, `response_status`, `response_msg`, `response_body`, `ip_address`, `user_agent`, `execute_time`, `status`, `create_time`) VALUES (34, 2, 'admin', '重置', '用户管理', 'POST', '', '{\"id\":9}', '', '密码重置成功，默认密码: 123456', '{\"code\":200,\"msg\":\"密码重置成功，默认密码: 123456\"}', '', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36', 0, '1', '2026-08-05 00:17:10');
INSERT INTO `OperationLog` (`id`, `user_id`, `username`, `action`, `module`, `method`, `request_url`, `request_params`, `response_status`, `response_msg`, `response_body`, `ip_address`, `user_agent`, `execute_time`, `status`, `create_time`) VALUES (35, 2, 'admin', '重置', '用户管理', 'POST', '', '{\"id\":8}', '', '密码重置成功，默认密码: 123456', '{\"code\":200,\"msg\":\"密码重置成功，默认密码: 123456\"}', '', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36', 0, '1', '2026-08-05 00:17:13');
INSERT INTO `OperationLog` (`id`, `user_id`, `username`, `action`, `module`, `method`, `request_url`, `request_params`, `response_status`, `response_msg`, `response_body`, `ip_address`, `user_agent`, `execute_time`, `status`, `create_time`) VALUES (36, 2, 'admin', '删除', '用户管理', 'POST', '', '{\"id\":7}', '', '删除用户成功', '{\"code\":200,\"msg\":\"删除用户成功\"}', '', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36', 0, '1', '2026-08-05 00:17:15');
INSERT INTO `OperationLog` (`id`, `user_id`, `username`, `action`, `module`, `method`, `request_url`, `request_params`, `response_status`, `response_msg`, `response_body`, `ip_address`, `user_agent`, `execute_time`, `status`, `create_time`) VALUES (37, 2, 'admin', '删除', '用户管理', 'POST', '', '{\"id\":8}', '', '删除用户成功', '{\"code\":200,\"msg\":\"删除用户成功\"}', '', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36', 0, '1', '2026-08-05 00:17:17');
INSERT INTO `OperationLog` (`id`, `user_id`, `username`, `action`, `module`, `method`, `request_url`, `request_params`, `response_status`, `response_msg`, `response_body`, `ip_address`, `user_agent`, `execute_time`, `status`, `create_time`) VALUES (38, 2, 'admin', '删除', '用户管理', 'POST', '', '{\"id\":9}', '', '删除用户成功', '{\"code\":200,\"msg\":\"删除用户成功\"}', '', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36', 0, '1', '2026-08-05 00:17:19');
COMMIT;

-- ============================================================
--  标签 Tag（保持原有结构）
-- ============================================================
DROP TABLE IF EXISTS `Tag`;
CREATE TABLE `Tag` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `create_time` datetime DEFAULT NULL,
  `update_time` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------
-- Records of Tag
-- ----------------------------
BEGIN;
INSERT INTO `Tag` (`id`, `name`, `create_time`, `update_time`) VALUES ('tag1', '编程',     '2024-06-27 18:26:44', '2024-06-27 18:26:44');
INSERT INTO `Tag` (`id`, `name`, `create_time`, `update_time`) VALUES ('tag2', '人工智能', '2024-06-27 18:26:44', '2024-06-27 18:26:44');
INSERT INTO `Tag` (`id`, `name`, `create_time`, `update_time`) VALUES ('tag3', '健身',     '2024-06-27 18:26:44', '2024-06-27 18:26:44');
INSERT INTO `Tag` (`id`, `name`, `create_time`, `update_time`) VALUES ('tag4', '营养',     '2024-06-27 18:26:44', '2024-06-27 18:26:44');
INSERT INTO `Tag` (`id`, `name`, `create_time`, `update_time`) VALUES ('tag5', '旅行',     '2024-06-27 18:26:44', '2024-06-27 18:26:44');
INSERT INTO `Tag` (`id`, `name`, `create_time`, `update_time`) VALUES ('tag6', '爱好',     '2024-06-27 18:26:44', '2024-06-27 18:26:44');
COMMIT;

SET FOREIGN_KEY_CHECKS = 1;