/**
 * 多维度搜索 API 适配器
 * 适配 Pagefind 静态搜索索引，将其结果转换为多维度分组格式
 */

import type {
	SearchApiResponse,
	GroupedResults,
	SearchResultItem,
	SearchSummary,
	PagefindSearchResult,
	SearchDimension,
} from "@/types/search";

/**
 * 从 Pagefind filters 或 URL 路径中推断内容维度
 * data-pagefind-filter="type:post" / "type:project" / "type:moment"
 */
function inferDimensionFromFilters(
	filters: Record<string, unknown> | undefined,
): SearchDimension | null {
	if (!filters) return null;
	const type = filters["type"];
	if (type === "post") return "posts";
	if (type === "project") return "projects";
	if (type === "moment") return "moments";
	return null;
}

/**
 * 从 Pagefind 结果中推断内容维度（后备方案）
 * 根据 URL 路径模式判断属于文章、项目还是动态
 */
function inferDimensionFromUrl(url: string): SearchDimension {
	if (url.startsWith("/posts/") || url.startsWith("/post/")) {
		return "posts";
	}
	if (url.startsWith("/projects/") || url.startsWith("/project/")) {
		return "projects";
	}
	if (
		url.startsWith("/moments/") ||
		url.startsWith("/timeline") ||
		url.startsWith("/diary/")
	) {
		return "moments";
	}
	return "posts";
}

/**
 * 将单个 Pagefind 结果转换为标准 SearchResultItem
 * 优先使用 Pagefind filters 推断维度，其次使用 URL 路径
 */
function pagefindResultToSearchItem(
	item: PagefindSearchResult,
): SearchResultItem {
	// 优先从 Pagefind filters 推断维度
	const filterDimension = inferDimensionFromFilters(item.filters);
	const dimension = filterDimension ?? inferDimensionFromUrl(item.url);
	return {
		id: item.url,
		title: item.meta.title,
		url: item.url,
		excerpt: item.excerpt || "",
		publishDate: "",
		score: item.weighted_locations?.[0]?.balanced_score ?? 0,
		dimension,
	};
}

/**
 * 将 Pagefind 原生结果分组为 posts / projects / moments
 */
function groupPagefindResults(
	results: PagefindSearchResult[],
): GroupedResults {
	const grouped: GroupedResults = {
		posts: [],
		projects: [],
		moments: [],
	};

	for (const item of results) {
		const searchItem = pagefindResultToSearchItem(item);
		grouped[searchItem.dimension].push(searchItem);
	}

	// 各维度内按 score 降序排列
	for (const dim of ["posts", "projects", "moments"] as const) {
		grouped[dim].sort((a, b) => b.score - a.score);
	}

	return grouped;
}

/**
 * 计算搜索摘要统计
 */
function computeSummary(keyword: string, grouped: GroupedResults): SearchSummary {
	const postsCount = grouped.posts.length;
	const projectsCount = grouped.projects.length;
	const momentsCount = grouped.moments.length;
	return {
		total: postsCount + projectsCount + momentsCount,
		postsCount,
		projectsCount,
		momentsCount,
	};
}

/**
 * 通过 Pagefind 执行多维度搜索
 * @param keyword 搜索关键字
 * @param signal AbortController 信号用于取消请求
 * @returns 标准化的 SearchApiResponse
 */
export async function fetchSearchResults(
	keyword: string,
	signal?: AbortSignal,
): Promise<SearchApiResponse> {
	const trimmed = keyword.trim();
	if (!trimmed) {
		return {
			code: 200,
			message: "success",
			data: {
				keyword: "",
				summary: { total: 0, postsCount: 0, projectsCount: 0, momentsCount: 0 },
				results: { posts: [], projects: [], moments: [] },
			},
		};
	}

	try {
		// 尝试使用 Pagefind
		if (
			typeof window !== "undefined" &&
			window.pagefind &&
			typeof window.pagefind.search === "function"
		) {
			// 使用 loose 模式支持片段匹配（如单字母搜索）
			// Pagefind 默认不区分大小写，不需要额外配置
			const response = await window.pagefind.search(trimmed);

			// 检查 abort 状态
			if (signal?.aborted) {
				throw new DOMException("Aborted", "AbortError");
			}

			const rawResults: PagefindSearchResult[] = await Promise.all(
				response.results.map((item) => item.data()),
			);

			const results = groupPagefindResults(rawResults);
			const summary = computeSummary(trimmed, results);

			return {
				code: 200,
				message: "success",
				data: {
					keyword: trimmed,
					summary,
					results,
				},
			};
		}

		// 开发环境返回空数据
		return {
			code: 200,
			message: "dev_mode_no_pagefind",
			data: {
				keyword: trimmed,
				summary: { total: 0, postsCount: 0, projectsCount: 0, momentsCount: 0 },
				results: { posts: [], projects: [], moments: [] },
			},
		};
	} catch (error) {
		if ((error as DOMException)?.name === "AbortError") {
			throw error; // 重新抛出 AbortError 让调用方处理
		}
		console.error("Multi-dimension search error:", error);
		return {
			code: 500,
			message: "search_error",
			data: {
				keyword: trimmed,
				summary: { total: 0, postsCount: 0, projectsCount: 0, momentsCount: 0 },
				results: { posts: [], projects: [], moments: [] },
			},
		};
	}
}

/**
 * 按筛选 Tab 和排序方式过滤结果
 */
export function filterAndSortResults(
	keyword: string,
	allResults: GroupedResults,
	activeTab: "all" | SearchDimension,
	sortOrder: "relevance" | "dateDesc" | "dateAsc",
): SearchResultItem[] {
	let merged: SearchResultItem[];

	if (activeTab === "all") {
		merged = [
			...allResults.posts,
			...allResults.projects,
			...allResults.moments,
		];
	} else {
		merged = [...allResults[activeTab]];
	}

	// 排序
	switch (sortOrder) {
		case "dateDesc":
			merged.sort(
				(a, b) =>
					new Date(b.publishDate).getTime() -
					new Date(a.publishDate).getTime(),
			);
			break;
		case "dateAsc":
			merged.sort(
				(a, b) =>
					new Date(a.publishDate).getTime() -
					new Date(b.publishDate).getTime(),
			);
			break;
		case "relevance":
		default:
			merged.sort((a, b) => b.score - a.score);
			break;
	}

	return merged;
}

/**
 * 构建搜索结果页 URL
 */
export function buildSearchUrl(keyword: string): string {
	// trailingSlash: "always" 在 astro.config.mjs 中配置，路由必须带尾部斜杠
	return `/search/?q=${encodeURIComponent(keyword.trim())}`;
}

/**
 * 从 URL 查询参数中提取搜索关键字
 */
export function extractKeywordFromUrl(): string {
	if (typeof window === "undefined") return "";
	const params = new URLSearchParams(window.location.search);
	return params.get("q")?.trim() ?? "";
}
