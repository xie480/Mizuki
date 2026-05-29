/**
 * 多维度搜索类型定义
 * Multi-Dimensional Search Type Definitions
 */

/** 搜索维度分类 */
export type SearchDimension = "posts" | "projects" | "moments";

/** 排序方式 */
export type SortOrder = "relevance" | "dateDesc" | "dateAsc";

/** 筛选分类（包含"全部"） */
export type FilterTab = "all" | SearchDimension;

/** 单个搜索结果项 */
export interface SearchResultItem {
	id: string;
	title: string;
	url: string;
	excerpt: string;
	publishDate: string;
	score: number;
	/** 维度来源 */
	dimension: SearchDimension;
	/** 可选的附加元数据 */
	meta?: Record<string, unknown>;
}

/** 按维度分组的结果 */
export interface GroupedResults {
	posts: SearchResultItem[];
	projects: SearchResultItem[];
	moments: SearchResultItem[];
}

/** 搜索结果摘要统计 */
export interface SearchSummary {
	total: number;
	postsCount: number;
	projectsCount: number;
	momentsCount: number;
}

/** API 响应体 */
export interface SearchApiResponse {
	code: number;
	message: string;
	data: {
		keyword: string;
		summary: SearchSummary;
		results: GroupedResults;
	};
}

/** 前端搜索下拉面板展示用的衍生数据 */
export interface DropdownViewData {
	posts: SearchResultItem[];
	projects: SearchResultItem[];
	moments: SearchResultItem[];
	/** 三个维度的总数（未 slice 前的原始计数） */
	rawCounts: {
		posts: number;
		projects: number;
		moments: number;
	};
}

/** 搜索结果页的状态 */
export interface SearchPageState {
	keyword: string;
	activeTab: FilterTab;
	sortOrder: SortOrder;
	results: SearchResultItem[];
	summary: SearchSummary;
	isLoading: boolean;
	error: string | null;
}

/** Pagefind 搜索结果的适配器中间格式 */
export interface PagefindSearchResult {
	url: string;
	meta: {
		title: string;
	};
	excerpt: string;
	content?: string;
	word_count?: number;
	filters?: Record<string, unknown>;
	anchors?: {
		element: string;
		id: string;
		text: string;
		location: number;
	}[];
	weighted_locations?: {
		weight: number;
		balanced_score: number;
		location: number;
	}[];
	locations?: number[];
	raw_content?: string;
	raw_url?: string;
	sub_results?: PagefindSearchResult[];
}

/** 搜索配置常量 */
export const SEARCH_CONSTANTS = {
	/** 防抖延迟 (ms) */
	DEBOUNCE_DELAY: 300,
	/** 每个维度在下拉面板中最多显示数量 */
	MAX_DROPDOWN_ITEMS_PER_DIMENSION: 3,
	/** 下拉面板最大高度 (vh 相关) */
	DROPDOWN_MAX_HEIGHT_VH: 60,
	/** Blur 延迟用于允许点击结果 */
	BLUR_DELAY: 200,
	/** 焦点恢复窗口 */
	FOCUS_RECOVERY_WINDOW: 500,
} as const;

/** Pagefind 过滤器的维度键名 */
export const PAGEFIND_FILTER_KEYS: Record<SearchDimension, string> = {
	posts: "type:post",
	projects: "type:project",
	moments: "type:moment",
};
