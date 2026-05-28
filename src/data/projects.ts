// Project data configuration file
// Used to manage data for the project display page

export interface Project {
	id: string;
	title: string;
	description: string;
	image: string;
	category: "web" | "mobile" | "desktop" | "other";
	techStack: string[];
	status: "completed" | "in-progress" | "planned";
	liveDemo?: string;
	sourceCode?: string;
	visitUrl?: string;
	startDate: string;
	endDate?: string;
	featured?: boolean;
	tags?: string[];
	showImage?: boolean;
}

export const projectsData: Project[] = [
	{
		id: "1",
		title: "Nyami",
		description:
			"一款专为 Bilibili 用户打造的第三方纯音频播放应用。它通过解析 B 站视频音频流，结合本地数据库同步机制与自定义底层音频 DSP 引擎，为用户提供无缝的在线/离线音乐聆听体验。",
		image: "/assets/projects/nyami.jpg",
		category: "mobile",
		techStack: ["TypeScript","C++", "Kotlin", "React", "Zustand", "WatermelonDB", "ExoPlayer"],
		status: "completed",
		sourceCode: "https://github.com/xie480/Nyami",
		startDate: "2026-05-01",
		endDate: "2026-05-15",
		featured: true
	},
	{
		id: "2",
		title: "Luna",
		description:
			"一款本地化的 AI 桌面助理，面向 陪伴式人格 + 长期记忆 + 主动行为 的全栈 AI Agent 平台。它集成了多模型驱动、RAG 知识库、MCP（模型上下文协议）工具调用、OpenClaw 任务编排以及 CodeOps 工程闭环，能够在本地桌面环境中实现 自然语言对话、知识检索、主动规划、代码自动化 等完整 AI 工作流。",
		image: "/assets/projects/luna.jpg",
		category: "desktop",
		techStack: ["Golang", "Python", "JavaScript", "LangGraph", "Qdrant", "Redis", "PostgreSQL"],
		status: "in-progress",
		sourceCode: "https://github.com/xie480/Luna-AI",
		startDate: "2026-05-15",
		featured: true,
	},
	{
		id: "3",
		title: "Werewolf",
		description:
			"基于 LangGraph + FastAPI + Vue 3 的实时多智能体狼人杀博弈平台。",
		image: "/assets/projects/worewolf.jpg",
		category: "web",
		techStack: ["Python", "TypeScript", "LangGraph"],
		status: "in-progress",
		sourceCode: "https://github.com/xie480/Werewolf",
		startDate: "2026-05-15"
	},
	{
		id: "4",
		title: "仿B站",
		description:
			"一个1:1还原了哔哩哔哩使用体验的视频社区系统，包含用户端与管理端两套界面，以及搜索、弹幕、评论、私信、动态、审核、统计分析等功能。",
		image: "/assets/projects/bili.png",
		category: "web",
		techStack: ["Java", "Spring Boot", "MySQL", "Redis", "Vue.js", "Element-UI"],
		status: "completed",
		sourceCode: "https://github.com/xie480/Yilena-video-web",
		startDate: "2025-03-01",
		endDate: "2025-05-15",
	},
	{
		id: "5",
		title: "庆快校园",
		description:
			"一个面向广州大学师生的日常工具类微信小程序，日PV稳定在8000+",
		image: "/assets/projects/qk.jpg",
		category: "other",
		techStack: ["Java", "Spring Boot", "Elasticsearch", "RocketMQ", "XXL-JOB"],
		status: "in-progress",
		startDate: "2025-06-01",
	},
	{
		id: "55",
		title: "俄罗斯方块",
		description:
			"一款基于EasyX渲染的俄罗斯方块小游戏，供学习参考使用",
		image: "/assets/projects/wls.png",
		category: "desktop",
		techStack: ["C++", "EasyX"],
		status: "completed",
		sourceCode: "https://github.com/xie480/Yilena-cpp-Tetris",
		startDate: "2025-03-01",
		endDate: "2025-03-15",
	},
	{
		id: "6",
		title: "MyOneCoupon",
		description:
			"一个微服务架构优惠券平台系统，提供优惠券的创建、分发、搜索、核销和结算等完整功能。该系统采用现代化的技术栈，支持高并发场景下的优惠券业务处理。",
		image: "/assets/projects/bili.png",
		category: "web",
		techStack: ["Java", "Spring Cloud", "RocketMQ", "Redis", "MySQL"],
		status: "completed",
		sourceCode: "https://github.com/xie480/MyOneCoupon",
		startDate: "2025-08-01",
		endDate: "2025-08-15",
		showImage: false
	},
	{
		id: "7",
		title: "MyShortLink",
		description:
			"一个分布式短链接平台，提供短链生成、跳转、统计、分组管理以及回收站等功能。",
		image: "/assets/projects/bili.png",
		category: "web",
		techStack: ["Java", "Spring Cloud", "Nacos", "Sentinel", "OpenFeign"],
		status: "completed",
		sourceCode: "https://github.com/xie480/MyShortLink",
		startDate: "2025-08-15",
		endDate: "2025-08-31",
		showImage: false
	},
];

// Get project statistics
export const getProjectStats = () => {
	const total = projectsData.length;
	const completed = projectsData.filter(
		(p) => p.status === "completed",
	).length;
	const inProgress = projectsData.filter(
		(p) => p.status === "in-progress",
	).length;
	const planned = projectsData.filter((p) => p.status === "planned").length;

	return {
		total,
		byStatus: {
			completed,
			inProgress,
			planned,
		},
	};
};

// Get projects by category
export const getProjectsByCategory = (category?: string) => {
	if (!category || category === "all") {
		return projectsData;
	}
	return projectsData.filter((p) => p.category === category);
};

// Get featured projects
export const getFeaturedProjects = () => {
	return projectsData.filter((p) => p.featured);
};

// Get all tech stacks
export const getAllTechStack = () => {
	const techSet = new Set<string>();
	projectsData.forEach((project) => {
		project.techStack.forEach((tech) => {
			techSet.add(tech);
		});
	});
	return Array.from(techSet).sort();
};
