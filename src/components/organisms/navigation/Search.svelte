
<script lang="ts">
	import I18nKey from "@i18n/i18nKey";
	import { i18n } from "@i18n/translation";
	import Icon from "@iconify/svelte";
	import { navigateToPage } from "@utils/navigation-utils";
	import { url } from "@utils/url-utils";
	import { onDestroy, onMount } from "svelte";

	import { fetchSearchResults, buildSearchUrl } from "@/utils/search-api";
	import { searchStore } from "@/stores/searchStore";
	import type { GroupedResults, SearchSummary, FilterTab, SortOrder } from "@/types/search";
	import { SEARCH_CONSTANTS } from "@/types/search";
	import SearchDropdown from "../../features/search/SearchDropdown.svelte";

	// ---------- 状态 ----------
	let keywordDesktop = $state("");
	let keywordMobile = $state("");

	// 搜索结果
	let rawResults: GroupedResults = $state({ posts: [], projects: [], moments: [] });
	let searchSummary: SearchSummary = $state({ total: 0, postsCount: 0, projectsCount: 0, momentsCount: 0 });
	let isSearching = $state(false);
	let isDropdownOpen = $state(false);

	// Pagefind 初始化
	let initialized = $state(false);
	let pagefindLoaded = $state(false);

	// UI 状态
	let isDesktopSearchExpanded = $state(false);
	let windowJustFocused = false;
	let currentKeywordForDropdown = $state("");

	// 防抖和竞态控制
	let debounceTimer: NodeJS.Timeout;
	let abortController: AbortController | null = null;
	let focusTimer: NodeJS.Timeout;
	let blurTimer: NodeJS.Timeout;

	// 开发环境模拟数据
	const fakeResults: GroupedResults = {
		posts: [
			{
				id: "fake-1",
				title: "This Is a Fake Search Result",
				url: url("/"),
				excerpt: "Because the search cannot work in the <mark>dev</mark> environment.",
				publishDate: "",
				score: 0.95,
				dimension: "posts",
			},
			{
				id: "fake-2",
				title: "If You Want to Test the Search",
				url: url("/"),
				excerpt: "Try running <mark>npm build && npm preview</mark> instead.",
				publishDate: "",
				score: 0.85,
				dimension: "posts",
			},
		],
		projects: [],
		moments: [],
	};
	const fakeSummary: SearchSummary = { total: 2, postsCount: 2, projectsCount: 0, momentsCount: 0 };

	// ---------- 方法 ----------

	/** 同步 Store 状态 */
	const syncToStore = () => {
		searchStore.setKeyword(keywordDesktop || keywordMobile);
		searchStore.setSearching(isSearching);
		searchStore.setDropdownOpen(isDropdownOpen);
		searchStore.setDesktopExpanded(isDesktopSearchExpanded);
		searchStore.setResults({
			code: 200,
			message: "success",
			data: { keyword: keywordDesktop || keywordMobile, summary: searchSummary, results: rawResults },
		});
	};

	/** 切换移动端搜索面板 */
	const togglePanel = () => {
		const panel = document.getElementById("search-panel");
		panel?.classList.toggle("float-panel-closed");
		if (!panel?.classList.contains("float-panel-closed") && typeof window.loadPagefind === "function") {
			window.loadPagefind();
		}
	};

	/** 切换桌面端搜索框展开 */
	const toggleDesktopSearch = () => {
		if (windowJustFocused) return;
		isDesktopSearchExpanded = !isDesktopSearchExpanded;
		if (isDesktopSearchExpanded) {
			if (typeof window.loadPagefind === "function") {
				window.loadPagefind();
			}
			setTimeout(() => {
				const input = document.getElementById("search-input-desktop") as HTMLInputElement;
				input?.focus();
			}, 0);
		}
	};

	/** 桌面端移出搜索栏时的处理（不关闭下拉面板，只延迟折叠搜索框） */
	const collapseDesktopSearch = () => {
		if (!keywordDesktop) {
			isDesktopSearchExpanded = false;
			// 不可折叠下拉面板，要等搜索结果返回后才确定
		}
	};

	/** 失焦处理（延迟以允许点击结果），只关闭展开态不下拉面板 */
	const handleBlur = () => {
		blurTimer = setTimeout(() => {
			// 折叠搜索框但保留 isDropdownOpen，让 performSearch 的最终结果决定
			isDesktopSearchExpanded = false;
		}, SEARCH_CONSTANTS.BLUR_DELAY);
	};

	/** 核心搜索逻辑（防抖调用） */
	const performSearch = async (keyword: string) => {
		const trimmed = keyword.trim();
		if (!trimmed) {
			rawResults = { posts: [], projects: [], moments: [] };
			searchSummary = { total: 0, postsCount: 0, projectsCount: 0, momentsCount: 0 };
			isSearching = false;
			isDropdownOpen = false;
			currentKeywordForDropdown = "";
			syncToStore();
			return;
		}

		if (!initialized) {
			isSearching = false;
			syncToStore();
			return;
		}

		// 取消上一次未完成的请求（竞态条件处理）
		if (abortController) {
			abortController.abort();
		}
		abortController = new AbortController();

		isSearching = true;
		isDropdownOpen = true;
		currentKeywordForDropdown = trimmed;
		syncToStore();

		try {
			let response;

			// 1. 尝试使用 Pagefind 真实搜索
			if (pagefindLoaded && window.pagefind) {
				response = await fetchSearchResults(trimmed, abortController.signal);
			} else if (typeof window.loadPagefind === "function") {
				await window.loadPagefind();
				pagefindLoaded =
					!!window.pagefind && typeof window.pagefind.search === "function";
				if (pagefindLoaded) {
					response = await fetchSearchResults(trimmed, abortController.signal);
				} else {
					response = null;
				}
			} else {
				response = null;
			}

			// 2. 如果 Pagefind 不可用（DEV 环境），使用模拟数据便于开发测试
			if (!response) {
				if (import.meta.env.DEV) {
					await new Promise((r) => setTimeout(r, 300));
					response = {
						code: 200,
						message: "success",
						data: { keyword: trimmed, summary: fakeSummary, results: fakeResults },
					};
				} else {
					response = {
						code: 200,
						message: "pagefind_unavailable",
						data: {
							keyword: trimmed,
							summary: { total: 0, postsCount: 0, projectsCount: 0, momentsCount: 0 },
							results: { posts: [], projects: [], moments: [] },
						},
					};
				}
			}

			// 如果 abort 了，丢弃结果
			if (abortController.signal.aborted) return;

			rawResults = response.data.results;
			searchSummary = response.data.summary;
			isSearching = false;
			isDropdownOpen = response.data.summary.total > 0;
			syncToStore();
		} catch (error) {
			if ((error as DOMException)?.name === "AbortError") return;
			console.error("Search error:", error);
			rawResults = { posts: [], projects: [], moments: [] };
			searchSummary = { total: 0, postsCount: 0, projectsCount: 0, momentsCount: 0 };
			isSearching = false;
			isDropdownOpen = true; // 保持打开以显示错误
			syncToStore();
		}
	};

	/** 处理输入变化（防抖） */
	const handleInput = (_e: Event, isDesktop: boolean) => {
		const keyword = isDesktop ? keywordDesktop : keywordMobile;
		clearTimeout(debounceTimer);
		if (!keyword.trim()) {
			rawResults = { posts: [], projects: [], moments: [] };
			searchSummary = { total: 0, postsCount: 0, projectsCount: 0, momentsCount: 0 };
			isSearching = false;
			isDropdownOpen = false;
			currentKeywordForDropdown = "";
			syncToStore();
			return;
		}
		debounceTimer = setTimeout(() => {
			performSearch(keyword);
		}, SEARCH_CONSTANTS.DEBOUNCE_DELAY);
	};

	/** 处理回车键：跳转到搜索结果页 */
	const handleKeyDown = (e: KeyboardEvent) => {
		if (e.key === "Enter") {
			const keyword = keywordDesktop || keywordMobile;
			if (keyword.trim()) {
				e.preventDefault();
				isDropdownOpen = false;
				currentKeywordForDropdown = "";
				const searchUrl = buildSearchUrl(keyword);
				navigateToPage(searchUrl);
			}
		}
		// Escape 键关闭面板
		if (e.key === "Escape") {
			isDropdownOpen = false;
			isDesktopSearchExpanded = false;
		}
	};

	/** 处理结果点击 */
	const handleResultClick = (url: string) => {
		isDropdownOpen = false;
		isDesktopSearchExpanded = false;
		currentKeywordForDropdown = "";
		navigateToPage(url);
	};

	/** 处理"查看全部" */
	const handleViewAll = () => {
		const keyword = keywordDesktop || keywordMobile;
		if (keyword.trim()) {
			isDropdownOpen = false;
			currentKeywordForDropdown = "";
			const searchUrl = buildSearchUrl(keyword);
			navigateToPage(searchUrl);
		}
	};

	/** 关闭搜索面板 */
	const closeSearchPanel = () => {
		isDropdownOpen = false;
		isDesktopSearchExpanded = false;
		keywordDesktop = "";
		keywordMobile = "";
		rawResults = { posts: [], projects: [], moments: [] };
		searchSummary = { total: 0, postsCount: 0, projectsCount: 0, momentsCount: 0 };
		isSearching = false;
		currentKeywordForDropdown = "";
		syncToStore();
		// 关闭浮动面板
		const panel = document.getElementById("search-panel");
		if (panel) {
			panel.classList.add("float-panel-closed");
		}
	};

	// ---------- 生命周期 ----------
	onMount(() => {
		const initializeSearch = () => {
			initialized = true;
			pagefindLoaded =
				typeof window !== "undefined" &&
				!!window.pagefind &&
				typeof window.pagefind.search === "function";
			searchStore.setInitialized(true, pagefindLoaded);
		};

		if (import.meta.env.DEV) {
			initializeSearch();
		} else {
			document.addEventListener("pagefindready", () => {
				initializeSearch();
			});
			document.addEventListener("pagefindloaderror", () => {
				console.warn("Pagefind load error. Search will be limited.");
				initializeSearch();
			});
			setTimeout(() => {
				if (!initialized) initializeSearch();
			}, 2000);
		}

		// 监听窗口焦点
		const handleFocus = () => {
			windowJustFocused = true;
			clearTimeout(focusTimer);
			focusTimer = setTimeout(() => {
				windowJustFocused = false;
			}, SEARCH_CONSTANTS.FOCUS_RECOVERY_WINDOW);
		};
		window.addEventListener("focus", handleFocus);

		// 点击外部关闭下拉面板
		const handleClickOutside = (e: MouseEvent) => {
			const container = document.getElementById("search-container");
			if (container && !container.contains(e.target as Node)) {
				isDropdownOpen = false;
			}
		};
		document.addEventListener("click", handleClickOutside);

		return () => {
			window.removeEventListener("focus", handleFocus);
			document.removeEventListener("click", handleClickOutside);
		};
	});

	$effect(() => {
		// 同步 navbar 状态
		if (typeof document !== "undefined") {
			const navbar = document.getElementById("navbar");
			if (isDesktopSearchExpanded) {
				navbar?.classList.add("is-searching");
			} else {
				navbar?.classList.remove("is-searching");
			}
		}
	});

	onDestroy(() => {
		if (typeof document !== "undefined") {
			const navbar = document.getElementById("navbar");
			navbar?.classList.remove("is-searching");
		}
		clearTimeout(debounceTimer);
		clearTimeout(focusTimer);
		clearTimeout(blurTimer);
		if (abortController) abortController.abort();
	});
</script>

<!-- 桌面端搜索栏（默认折叠） -->
<div class="hidden lg:block relative h-11 shrink-0 {isDesktopSearchExpanded ? 'w-72' : 'w-11'}" id="desktop-search-wrapper">
	<div
		id="search-bar"
		class="flex transition-all items-center h-11 rounded-lg absolute left-0 top-0 shrink-0
            {isDesktopSearchExpanded
			? 'bg-black/[0.04] hover:bg-black/[0.06] focus-within:bg-black/[0.06] dark:bg-white/5 dark:hover:bg-white/10 dark:focus-within:bg-white/10'
			: 'btn-plain active:scale-90'}
            {isDesktopSearchExpanded ? 'w-72' : 'w-11'}"
		role="search"
		tabindex="0"
		aria-label={i18n(I18nKey.search)}
		onmouseenter={() => {
			if (!isDesktopSearchExpanded) toggleDesktopSearch();
		}}
		onmouseleave={collapseDesktopSearch}
		onclick={() => {
			const input = document.getElementById("search-input-desktop") as HTMLInputElement;
			input?.focus();
		}}
	>
		<Icon
			icon="material-symbols:search"
			class="absolute text-[1.25rem] pointer-events-none {isDesktopSearchExpanded
				? 'left-3'
				: 'left-1/2 -translate-x-1/2'} transition top-1/2 -translate-y-1/2 {isDesktopSearchExpanded
				? 'text-black/30 dark:text-white/30'
				: ''}"
		></Icon>
		<input
			id="search-input-desktop"
			type="search"
			placeholder={i18n(I18nKey.search)}
			bind:value={keywordDesktop}
			oninput={(e) => handleInput(e, true)}
			onkeydown={handleKeyDown}
			onfocus={() => {
				clearTimeout(blurTimer);
				if (!isDesktopSearchExpanded) toggleDesktopSearch();
				if (keywordDesktop.trim()) {
					performSearch(keywordDesktop);
				}
			}}
			onblur={handleBlur}
			autocomplete="off"
			class="transition-all pl-10 text-sm bg-transparent outline-0
                h-full {isDesktopSearchExpanded ? 'w-60' : 'w-0'} text-black/50 dark:text-white/50"
		/>
	</div>

	<!-- 桌面端下拉面板：固定宽度与搜索框一致，使用 position absolute 对齐 -->
	{#if isDropdownOpen && isDesktopSearchExpanded}
		<div class="search-dropdown-anchor">
			<SearchDropdown
				keyword={currentKeywordForDropdown}
				isSearching={isSearching}
				isOpen={true}
				results={rawResults}
				summary={searchSummary}
				onItemClick={handleResultClick}
				onViewAll={handleViewAll}
				onClose={() => { isDropdownOpen = false; }}
			/>
		</div>
	{/if}
</div>

<!-- 移动端切换按钮 -->
<button
	onclick={togglePanel}
	aria-label={i18n(I18nKey.search)}
	id="search-switch"
	class="btn-plain scale-animation lg:!hidden rounded-lg w-11 h-11 active:scale-90"
>
	<Icon icon="material-symbols:search" class="text-[1.25rem]"></Icon>
</button>

<!-- 移动端搜索面板（浮动面板） -->
<div
	id="search-panel"
	class="float-panel float-panel-closed absolute md:w-[30rem] top-20 left-4 md:left-[unset] right-4 z-50 search-panel shadow-2xl rounded-2xl p-2"
>
	<!-- 移动端搜索输入框 -->
	<div
		id="search-bar-inside"
		class="flex relative lg:hidden transition-all items-center h-11 rounded-xl
      bg-black/[0.04] hover:bg-black/[0.06] focus-within:bg-black/[0.06]
      dark:bg-white/5 dark:hover:bg-white/10 dark:focus-within:bg-white/10"
	>
		<Icon
			icon="material-symbols:search"
			class="absolute text-[1.25rem] pointer-events-none ml-3 transition my-auto text-black/30 dark:text-white/30"
		></Icon>
		<input
			id="search-input-mobile"
			type="search"
			placeholder={i18n(I18nKey.search)}
			bind:value={keywordMobile}
			oninput={(e) => handleInput(e, false)}
			onkeydown={handleKeyDown}
			autocomplete="off"
			class="pl-10 absolute inset-0 text-sm bg-transparent outline-0
               focus:w-60 text-black/50 dark:text-white/50"
		/>
	</div>

	<!-- 移动端下拉结果 -->
	<SearchDropdown
		keyword={currentKeywordForDropdown}
		isSearching={isSearching}
		isOpen={!!keywordMobile.trim() && isDropdownOpen}
		results={rawResults}
		summary={searchSummary}
		onItemClick={(url) => {
			closeSearchPanel();
			navigateToPage(url);
		}}
		onViewAll={() => {
			closeSearchPanel();
			handleViewAll();
		}}
		onClose={closeSearchPanel}
	/>
</div>

<style>
	input:focus {
		outline: 0;
	}
	input[type="search"]::-webkit-search-decoration,
	input[type="search"]::-webkit-search-cancel-button,
	input[type="search"]::-webkit-search-results-button,
	input[type="search"]::-webkit-search-results-decoration {
		-webkit-appearance: none;
	}
	:global(.search-panel) {
		max-height: calc(100vh - 100px);
		overflow-y: auto;
	}
	/* 下拉面板锚点容器：与搜索容器同宽 */
	.search-dropdown-anchor {
		position: absolute;
		left: 0;
		top: calc(100% + 0.5rem);
		width: 100%;
		min-width: 280px;
		z-index: 100;
	}
</style>
