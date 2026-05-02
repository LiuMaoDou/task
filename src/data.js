export const COLOR_SCHEMES = {
  default: {
    name: '默认',
    accent: '#2bab8e', accentLight: '#e2f5f1', accentText: '#0d9276',
    light: { bg_app:'#f0f0f0', bg_sidebar:'#f7f7f7', bg_panel:'#ffffff', bg_hover:'#f5f5f5', bg_active:'#f0f0f0', bg_input:'#fafafa', border:'#e8e8e8', border_mid:'#f0f0f0', text_main:'#1a1a1a', text_sub:'#555555', text_muted:'#999999', text_faint:'#cccccc', text_nav:'#333333', scrollbar:'#dddddd' },
    dark:  { bg_app:'#141414', bg_sidebar:'#1c1c1e', bg_panel:'#242426', bg_hover:'#2a2a2c', bg_active:'#2e2e30', bg_input:'#1e1e20', border:'#333336', border_mid:'#2c2c2e', text_main:'#f0f0f0', text_sub:'#c0c0c0', text_muted:'#777777', text_faint:'#444444', text_nav:'#d0d0d0', scrollbar:'#444444' },
  },
  stone: {
    name: 'Stone & Sage',
    accent: '#5a8a72', accentLight: '#e6f0eb', accentText: '#3d6b58',
    selectionBg: 'color-mix(in srgb, var(--bg-active) 72%, transparent)',
    light: { bg_app:'#f2f0eb', bg_sidebar:'#ede9e2', bg_panel:'#faf8f5', bg_hover:'#e8e4dd', bg_active:'#e0dcd5', bg_input:'#f5f2ee', border:'#ddd8d0', border_mid:'#ede9e2', text_main:'#1c1a17', text_sub:'#4a4640', text_muted:'#8a8278', text_faint:'#bfb9b0', text_nav:'#3a3630', scrollbar:'#ccc8c0' },
    dark:  { bg_app:'#181714', bg_sidebar:'#201e1b', bg_panel:'#272420', bg_hover:'#2e2b27', bg_active:'#34312c', bg_input:'#22201c', border:'#38342f', border_mid:'#2e2b27', text_main:'#f0ece6', text_sub:'#b8b0a6', text_muted:'#6e6760', text_faint:'#3e3a36', text_nav:'#d0c8be', scrollbar:'#4a4640' },
  },
  arctic: {
    name: 'Arctic Blue',
    accent: '#3b82f6', accentLight: '#dbeafe', accentText: '#1d4ed8',
    light: { bg_app:'#eef2f8', bg_sidebar:'#e6edf7', bg_panel:'#ffffff', bg_hover:'#dde6f5', bg_active:'#d4dff0', bg_input:'#f5f8ff', border:'#c8d8ee', border_mid:'#e6edf7', text_main:'#0f1929', text_sub:'#344666', text_muted:'#7a90b0', text_faint:'#b8c8de', text_nav:'#1e3050', scrollbar:'#b0c4dc' },
    dark:  { bg_app:'#0d1117', bg_sidebar:'#131923', bg_panel:'#1a2230', bg_hover:'#1f2a3a', bg_active:'#243040', bg_input:'#16202e', border:'#2a3850', border_mid:'#1f2a3a', text_main:'#e8eef8', text_sub:'#9ab0cc', text_muted:'#4a6080', text_faint:'#28384e', text_nav:'#c0d4ec', scrollbar:'#2e4060' },
  },
  rose: {
    name: 'Rose Dust',
    accent: '#c2526a', accentLight: '#fce7ec', accentText: '#9e3050',
    light: { bg_app:'#f7f2f3', bg_sidebar:'#f2eaec', bg_panel:'#fdf9fa', bg_hover:'#ece0e3', bg_active:'#e4d4d8', bg_input:'#f8f4f5', border:'#e0d0d4', border_mid:'#f0e6e9', text_main:'#1e1317', text_sub:'#52333c', text_muted:'#9e7882', text_faint:'#d4b8c0', text_nav:'#3a2028', scrollbar:'#c8aab2' },
    dark:  { bg_app:'#180f11', bg_sidebar:'#201318', bg_panel:'#28181e', bg_hover:'#301e24', bg_active:'#38242c', bg_input:'#221318', border:'#40262e', border_mid:'#301e24', text_main:'#f5e8ec', text_sub:'#c8a0aa', text_muted:'#7a4e58', text_faint:'#402830', text_nav:'#e0b8c4', scrollbar:'#503038' },
  },
  obsidian: {
    name: 'Obsidian',
    accent: '#a78bfa', accentLight: '#ede9fe', accentText: '#7c3aed',
    light: { bg_app:'#f0f0f2', bg_sidebar:'#e8e8ec', bg_panel:'#ffffff', bg_hover:'#e0e0e8', bg_active:'#d8d8e4', bg_input:'#f5f5f8', border:'#d0d0da', border_mid:'#e8e8f0', text_main:'#111118', text_sub:'#36364a', text_muted:'#8080a0', text_faint:'#c0c0d4', text_nav:'#28283c', scrollbar:'#b8b8cc' },
    dark:  { bg_app:'#090909', bg_sidebar:'#111111', bg_panel:'#1a1a1a', bg_hover:'#222222', bg_active:'#282828', bg_input:'#141414', border:'#2e2e2e', border_mid:'#222222', text_main:'#f0f0f0', text_sub:'#b0b0b8', text_muted:'#606068', text_faint:'#333338', text_nav:'#d0d0dc', scrollbar:'#383838' },
  },
};

export const NOW = new Date(2026, 4, 2); // May 2, 2026

export const fmt = (d) => {
  const h = d.getHours().toString().padStart(2, '0');
  const m = d.getMinutes().toString().padStart(2, '0');
  return `${h}:${m}`;
};

export const fmtDate = (d) => `${d.getMonth() + 1}月${d.getDate()}日`;

export const fmtDateLabel = (d) => {
  const dDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const nDay = new Date(NOW.getFullYear(), NOW.getMonth(), NOW.getDate());
  const days = Math.round((dDay - nDay) / 86400000);
  if (days === 0) return '今天';
  if (days === 1) return '明天';
  if (days === 2) return '后天';
  if (days < 0) return '已过期';
  return `${d.getMonth() + 1}月${d.getDate()}日`;
};

const mkDate = (offsetDays, h, m = 0) => {
  const d = new Date(NOW);
  d.setDate(d.getDate() + offsetDays);
  d.setHours(h, m, 0, 0);
  return d;
};

export const uid = () => Math.random().toString(36).slice(2, 10);

export const isToday = (d) => {
  const n = new Date(NOW);
  return d.getDate() === n.getDate() && d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear();
};
export const isThisWeek  = (d) => { const diff = (d - NOW) / 86400000; return diff >= 0 && diff < 7; };
export const isThisMonth = (d) => { const diff = (d - NOW) / 86400000; return diff >= 0 && diff < 30; };
export const isThisYear  = (d) => { const diff = (d - NOW) / 86400000; return diff >= 0 && diff < 365; };

export const PRIORITY       = { 0: null,      1: '#f97316', 2: '#dc2626' };
export const PRIORITY_BG    = { 0: null,      1: 'rgba(249,115,22,0.18)', 2: 'rgba(220,38,38,0.18)' };
export const PRIORITY_LABEL = { 0: '无',      1: '中',      2: '高' };

// Groups — top-level folders in the sidebar
export const INITIAL_GROUPS = [
  { id: 'g_personal', name: '个人' },
  { id: 'g_work',     name: '工作' },
];

// Lists now carry a groupId (null = ungrouped, appears above grouped section)
export const INITIAL_LISTS = [
  { id: 'inbox',  name: '收集箱', icon: 'Inbox',     color: '#4a90e2', groupId: 'g_personal' },
  { id: 'life',   name: '生活',   icon: 'Home',      color: '#2bab8e', groupId: 'g_personal' },
  { id: 'health', name: '健身',   icon: 'Dumbbell',  color: '#7c5cbf', groupId: 'g_personal' },
  { id: 'work',   name: '工作',   icon: 'Briefcase', color: '#e06b2d', groupId: 'g_work'     },
  { id: 'learn',  name: '学习',   icon: 'BookOpen',  color: '#c2526a', groupId: 'g_work'     },
];

export const INITIAL_TASKS = [
  // inbox
  { id: 't1',  listId: 'inbox',  title: '整理桌面文件',        note: '',                  due: mkDate(0, 9),   priority: 1, done: false, subtasks: [] },
  { id: 't2',  listId: 'inbox',  title: '回复重要邮件',        note: '记得抄送给团队',     due: mkDate(0, 12),  priority: 2, done: false, subtasks: [
    { id: 's1', text: '整理附件',   done: false, due: mkDate(0, 10), note: '' },
    { id: 's2', text: '确认收件人', done: false, due: null, note: '需要确认抄送' },
  ]},
  { id: 't3',  listId: 'inbox',  title: '预约医生',            note: '',                  due: mkDate(0, 14),  priority: 0, done: false, subtasks: [] },
  { id: 't4',  listId: 'inbox',  title: '买咖啡豆',            note: '',                  due: mkDate(1, 10),  priority: 0, done: false, subtasks: [] },
  { id: 't5',  listId: 'inbox',  title: '准备周报',            note: '需要附上数据截图',   due: mkDate(1, 18),  priority: 2, done: false, subtasks: [
    { id: 's3', text: '汇总本周数据', done: false, due: null, note: '' },
    { id: 's4', text: '撰写总结',     done: false, due: null, note: '' },
    { id: 's5', text: '发送给上级',   done: false, due: null, note: '' },
  ]},
  { id: 't6',  listId: 'inbox',  title: '更新简历',            note: '',                  due: mkDate(2, 15),  priority: 1, done: false, subtasks: [] },
  { id: 't7',  listId: 'inbox',  title: '整理照片',            note: '',                  due: mkDate(3, 20),  priority: 0, done: false, subtasks: [] },
  // work
  { id: 't8',  listId: 'work',   title: '主持项目会议',        note: '需要准备议程',       due: mkDate(0, 14),  priority: 2, done: false, subtasks: [
    { id: 's6', text: '发会议邀请', done: true,  due: mkDate(0, 13), note: '' },
    { id: 's7', text: '准备PPT',   done: false, due: mkDate(0, 16), note: '需要准备数据图表' },
  ]},
  { id: 't9',  listId: 'work',   title: '完成方案文档',        note: '',                  due: mkDate(1, 17),  priority: 1, done: false, subtasks: [] },
  { id: 't10', listId: 'work',   title: '代码评审',            note: '',                  due: mkDate(2, 11),  priority: 0, done: false, subtasks: [] },
  // life
  { id: 't11', listId: 'life',   title: '去超市购物',          note: '记得带购物袋',       due: mkDate(0, 18),  priority: 0, done: false, subtasks: [
    { id: 's8',  text: '鸡蛋', done: false, due: null, note: '' },
    { id: 's9',  text: '牛奶', done: true,  due: null, note: '' },
    { id: 's10', text: '面包', done: false, due: null, note: '' },
    { id: 's11', text: '蔬菜', done: false, due: null, note: '' },
  ]},
  { id: 't12', listId: 'life',   title: '缴纳水电费',          note: '',                  due: mkDate(1, 9),   priority: 1, done: false, subtasks: [] },
  // health
  { id: 't13', listId: 'health', title: '晨跑 5km',            note: '',                  due: mkDate(0, 7),   priority: 0, done: false, subtasks: [] },
  { id: 't14', listId: 'health', title: '冥想 10 分钟',        note: '',                  due: mkDate(0, 21),  priority: 0, done: false, subtasks: [] },
  { id: 't15', listId: 'health', title: '力量训练',            note: '',                  due: mkDate(1, 18),  priority: 1, done: false, subtasks: [] },
  // learn
  { id: 't16', listId: 'learn',  title: '读《深度工作》第三章', note: '',                  due: mkDate(0, 20),  priority: 0, done: false, subtasks: [] },
  { id: 't17', listId: 'learn',  title: '完成 React 教程',     note: '',                  due: mkDate(2, 16),  priority: 1, done: false, subtasks: [] },
];

export const LUCIDE_ICON_LIST = [
  'Inbox','Briefcase','Home','Dumbbell','BookOpen','Target','Lightbulb','ShoppingCart',
  'Music','Leaf','Heart','Bookmark','Puzzle','Rocket','Palette','Star','Coffee','Camera',
  'Globe','Zap','Pen','Gift','Plane','Flag','Bell','Layers','Code','Film','Flower','Trophy',
];
