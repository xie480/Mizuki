
<script lang="ts">
	import { onMount } from "svelte";

	import { fetchSearchResults, filterAndSortResults, extractKeywordFromUrl } from "@/utils/search-api";
	import { searchStore } from "@/stores/searchStore";
	import type { GroupedResults, SearchResultItem, SearchSummary, FilterTab, SortOrder } from "@/types/search";
	import FilterControlBar from "./FilterControlBar.svelte";
	import SearchResultList from "./SearchResultList.svelte";

	// ---------- 状态 ----------
	let keyword = $state("");
	let allResults: GroupedResults = $state({ posts: [], projects: [], moments: [] });
	let summary: SearchSummary = $state({ total: 0, postsCount: 0, projectsCount: 0, momentsCount: 0 });
	let isLoading = $state(true);
	let error: string | null = $state(null);

	// 筛选和排序
	let activeTab: FilterTab = $state("all");
	let sortOrder: SortOrder = $state("relevance");

	// 衍生：根据筛选和排序计算展示结果
	let displayResults: SearchResultItem[] = $derived(
		filterAndSortResults(keyword, allResults, activeTab, sortOrder),
	);

	// Pagefind 状态
	let initialized = $state(false);
	let pagefindLoaded = $state(false);

	// ---------- 方法 ----------
	const doSearch = async () => {
		if (!keyword.trim()) {
			isLoading = false;
			return;
		}

		isLoading = true;
		error = null;

		try {
			let response;
			if (
				import.meta.env.PROD &&
				pagefindLoaded &&
				typeof window.pagefind?.search === "function"
			) {
				response = await fetchSearchResults(keyword);
			} else if (import.meta.env.DEV) {
				// 开发环境使用空结果
				await new Promise((r) => setTimeout(r, 500));
				response = {
					code: 200,
					message: "dev_mode",
					data: {
						keyword,
						summary: { total: 0, postsCount: 0, projectsCount: 0, momentsCount: 0 },
						results: { posts: [], projects: [], moments: [] },
					},
				};
			} else {
				response = {
					code: 200,
					message: "pagefind_unavailable",
					data: {
						keyword,
						summary: { total: 0, postsCount: 0, projectsCount: 0, momentsCount: 0 },
						results: { posts: [], projects: [], moments: [] },
					},
				};
			}

			allResults = response.data.results;
			summary = response.data.summary;
		} catch (err) {
			console.error("Search page error:", err);
			error = "搜索时发生错误，请稍后重试";
			allResults = { posts: [], projects: [], moments: [] };
			summary = { total: 0, postsCount: 0, projectsCount: 0, momentsCount: 0 };
		} finally {
			isLoading = false;
		}
	};

	const handleTabChange = (tab: FilterTab) => {
		activeTab = tab;
		searchStore.setActiveTab(tab);
	};

	const handleSortChange = (order: SortOrder) => {
		sortOrder = order;
		searchStore.setSortOrder(order);
	};

	// ---------- 生命周期 ----------
	onMount(() => {
		keyword = extractKeywordFromUrl();

		const initializeSearch = () => {
			initialized = true;
			pagefindLoaded =
				typeof window !== "undefined" &&
				!!window.pagefind &&
				typeof window.pagefind.search === "function";
			searchStore.setInitialized(true, pagefindLoaded);

			if (keyword.trim()) {
				doSearch();
			} else {
				isLoading = false;
			}
		};

		if (import.meta.env.DEV) {
			initializeSearch();
		} else {
			const handleReady = () => initializeSearch();
			const handleError = () => {
				console.warn("Pagefind load error on search page.");
				initializeSearch();
			};

			document.addEventListener("pagefindready", handleReady);
			document.addEventListener("pagefindloaderror", handleError);

			setTimeout(() => {
				if (!initialized) initializeSearch();
			}, 2000);
		}
	});
</script>

<div class="search-page">
	{#if keyword.trim()}
		<FilterControlBar
			{activeTab}
			{sortOrder}
			{keyword}
			{summary}
			onTabChange={handleTabChange}
			onSortChange={handleSortChange}
		/>
	{/if}

	<SearchResultList
		results={displayResults}
		{isLoading}
		{keyword}
	/>
</div>

<style>
	.search-page {
		max-width: 48rem;
		margin: 0 auto;
		padding: 1.5rem 1rem;
	}
</style>
