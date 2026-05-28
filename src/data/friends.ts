// 友情链接数据配置
// 用于管理友情链接页面的数据

export interface FriendItem {
	id: number;
	title: string;
	desc: string;
	siteurl: string;
	tags: string[];
}

// 友情链接数据
export const friendsData: FriendItem[] = [
    {
        id: 1,
        title: "Navnav",
        desc: "精选前端酷炫组件与动效收集站",
        siteurl: "https://thuvien.org/navnav/",
        tags: ["技术探索"],
    },
    {
        id: 2,
        title: "Reactbits",
        desc: "开箱即用的 React 动画与创意组件库",
        siteurl: "https://www.reactbits.dev/",
        tags: ["技术探索"],
    },
    {
        id: 3,
        title: "Loading.io",
        desc: "网页 Ajax/SVG 加载动画定制与生成工具",
        siteurl: "https://loading.io/",
        tags: ["技术探索"],
    },
    {
        id: 4,
        title: "Chokcoco (iCSS)",
        desc: "CSS 魔法使！各种让人惊叹的 CSS 奇技淫巧与特效汇总",
        siteurl: "https://github.com/chokcoco/iCSS",
        tags: ["技术探索"],
    },
    {
        id: 5,
        title: "Drawdb",
        desc: "超好用的免费开源在线数据库关系图（ER图）可视化设计工具",
        siteurl: "https://www.drawdb.app/editor",
        tags: ["宝藏工具"],
    },
    {
        id: 6,
        title: "Meituan技术团队",
        desc: "美团官方技术博客，干货满满的大厂架构与工程实践经验",
        siteurl: "https://tech.meituan.com/",
        tags: ["技术探索"],
    },
    {
        id: 7,
        title: "ASCII Generator",
        desc: "把纯文本一键转换成酷炫 ASCII 艺术字体的老牌生成器",
        siteurl: "http://www.network-science.de/ascii/",
        tags: ["宝藏工具"],
    },
    {
        id: 8,
        title: "Kakuyomu (カクヨム)",
        desc: "角川旗下的优质日语小说平台，轻小说御宅族的天堂（强推！）",
        siteurl: "https://kakuyomu.jp/",
        tags: ["ACG/小说"],
    },
    {
        id: 9,
        title: "小説家になろう",
        desc: "日本超级著名的网络小说看板，无数经典异世界转生作品的发源地",
        siteurl: "https://syosetu.com/",
        tags: ["ACG/小说"],
    },
    {
        id: 10,
        title: "アルファポリス",
        desc: "集小说、漫画于一体的综合性日本轻小说风向标网站",
        siteurl: "https://www.alphapolis.co.jp/",
        tags: ["ACG/小说"],
    },
    {
        id: 11,
        title: "Tabika",
        desc: "极简舒适的日语 N1-N5 全级别语法条理化汇总指南",
        siteurl: "https://itabika.com/?lang=zh&utm_source=chatgpt.com#mindset",
        tags: ["宝藏工具"],
    },
    {
        id: 12,
        title: "Shiken Lab",
        desc: "备考党必备！全方位的 JLPT 日语能力考模拟测试与刷题平台",
        siteurl: "https://shikenlab.com/zh-TW/dashboard",
        tags: ["宝藏工具"],
    },
    {
        id: 13,
        title: "Photoroom",
        desc: "极为强大的 AI 在线图片处理、抠图与背景更换神器",
        siteurl: "https://app.photoroom.com",
        tags: ["宝藏工具"]
    }
];

// 获取所有友情链接数据
export function getFriendsList(): FriendItem[] {
	return friendsData;
}

// 获取随机排序的友情链接数据
export function getShuffledFriendsList(): FriendItem[] {
	const shuffled = [...friendsData];
	for (let i = shuffled.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
	}
	return shuffled;
}
