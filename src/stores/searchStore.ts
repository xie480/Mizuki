/**
 * 搜索状态管理 Store
 * 管理多维度搜索的全局状态，支持下拉面板和搜索结果页
 */
import type {
	SearchApiResponse,
	GroupedResults,
	SearchDimension,
	SortOrder,
	FilterTab,
	SearchSummary,
} from "@/types/search";

/** 搜索状态接口 */
export interface SearchState {
	/** 当前搜索关键词 */
	keyword: string;
	/** 是否正在加载 */
	isSearching: boolean;
	/** 下拉面板是否打开 */
	isDropdownOpen: boolean;
	/** 桌面端搜索框是否展开 */
	isDesktopExpanded: boolean;
	/** 原始全量分组结果 */
	rawResults: GroupedResults;
	/** 搜索结果摘要 */
	summary: SearchSummary;
	/** 是否已初始化 Pagefind */
	initialized: boolean;
	/** Pagefind 是否已加载完成 */
	pagefindLoaded: boolean;
	/** 搜索结果页使用 - 当前筛选标签 */
	activeTab: FilterTab;
	/** 搜索结果页使用 - 排序方式 */
	sortOrder: SortOrder;
	/** 搜索结果页使用 - 是否加载中 */
	pageLoading: boolean;
	/** 搜索结果页使用 - 错误信息 */
	error: string | null;
}

const DEFAULT_GROUPED: GroupedResults = {
	posts: [],
	projects: [],
	moments: [],
};

const DEFAULT_SUMMARY: SearchSummary = {
	total: 0,
	postsCount: 0,
	projectsCount: 0,
	momentsCount: 0,
};

function createInitialState(): SearchState {
	return {
		keyword: "",
		isSearching: false,
		isDropdownOpen: false,
		isDesktopExpanded: false,
		rawResults: { ...DEFAULT_GROUPED },
		summary: { ...DEFAULT_SUMMARY },
		initialized: false,
		pagefindLoaded: false,
		activeTab: "all",
		sortOrder: "relevance",
		pageLoading: false,
		error: null,
	};
}

class SearchStore {
	private state: SearchState;
	private listeners = new Set<(state: SearchState) => void>();

	constructor() {
		this.state = createInitialState();
	}

	private createSnapshot(): SearchState {
		return {
			...this.state,
			rawResults: {
				posts: [...this.state.rawResults.posts],
				projects: [...this.state.rawResults.projects],
				moments: [...this.state.rawResults.moments],
			},
			summary: { ...this.state.summary },
		};
	}

	getState(): SearchState {
		return this.createSnapshot();
	}

	subscribe(listener: (state: SearchState) => void): () => void {
		this.listeners.add(listener);
		listener(this.createSnapshot());
		return () => {
			this.listeners.delete(listener);
		};
	}

	private broadcastState(): void {
		const snapshot = this.createSnapshot();
		for (const listener of this.listeners) {
			listener(snapshot);
		}
	}

	/** 设置搜索关键词 */
	setKeyword(keyword: string): void {
		this.state.keyword = keyword;
		this.broadcastState();
	}

	/** 设置搜索中状态 */
	setSearching(isSearching: boolean): void {
		this.state.isSearching = isSearching;
		this.broadcastState();
	}

	/** 设置下拉面板显隐 */
	setDropdownOpen(open: boolean): void {
		this.state.isDropdownOpen = open;
		this.broadcastState();
	}

	/** 设置桌面端搜索框展开 */
	setDesktopExpanded(expanded: boolean): void {
		this.state.isDesktopExpanded = expanded;
		this.broadcastState();
	}

	/** 更新搜索结果 */
	setResults(response: SearchApiResponse): void {
		this.state.rawResults = response.data.results;
		this.state.summary = response.data.summary;
		this.state.isSearching = false;
		this.broadcastState();
	}

	/** 初始化完成 */
	setInitialized(initialized: boolean, pagefindLoaded: boolean): void {
		this.state.initialized = initialized;
		this.state.pagefindLoaded = pagefindLoaded;
		this.broadcastState();
	}

	/** 重置搜索（清空关键词和结果） */
	resetSearch(): void {
		this.state.keyword = "";
		this.state.rawResults = { ...DEFAULT_GROUPED };
		this.state.summary = { ...DEFAULT_SUMMARY };
		this.state.isSearching = false;
		this.state.isDropdownOpen = false;
		this.broadcastState();
	}

	// ---------- 搜索结果页专用 ----------

	/** 设置搜索结果页筛选标签 */
	setActiveTab(tab: FilterTab): void {
		this.state.activeTab = tab;
		this.broadcastState();
	}

	/** 设置排序方式 */
	setSortOrder(order: SortOrder): void {
		this.state.sortOrder = order;
		this.broadcastState();
	}

	/** 设置搜索结果页加载状态 */
	setPageLoading(loading: boolean): void {
		this.state.pageLoading = loading;
		this.broadcastState();
	}

	/** 设置错误信息 */
	setError(error: string | null): void {
		this.state.error = error;
		this.broadcastState();
	}

	/** 重置搜索结果页状态 */
	resetPageState(): void {
		this.state.activeTab = "all";
		this.state.sortOrder = "relevance";
		this.state.pageLoading = false;
		this.state.error = null;
		this.broadcastState();
	}

	destroy(): void {
		this.listeners.clear();
	}
}

export const searchStore = new SearchStore();
