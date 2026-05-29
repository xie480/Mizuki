
<script lang="ts">
	import type { FilterTab, SortOrder, SearchSummary } from "@/types/search";

	interface Props {
		activeTab: FilterTab;
		sortOrder: SortOrder;
		keyword: string;
		summary: SearchSummary;
		onTabChange: (tab: FilterTab) => void;
		onSortChange: (order: SortOrder) => void;
	}

	const {
		activeTab,
		sortOrder,
		keyword,
		summary,
		onTabChange,
		onSortChange,
	}: Props = $props();

	const tabs: { id: FilterTab; label: string; countKey: keyof SearchSummary }[] = [
		{ id: "all", label: "全部", countKey: "total" },
		{ id: "posts", label: "文章", countKey: "postsCount" },
		{ id: "projects", label: "项目", countKey: "projectsCount" },
		{ id: "moments", label: "动态", countKey: "momentsCount" },
	];

	const getCount = (tab: FilterTab): number => {
		switch (tab) {
			case "all": return summary.total;
			case "posts": return summary.postsCount;
			case "projects": return summary.projectsCount;
			case "moments": return summary.momentsCount;
		}
	};
</script>

<div class="filter-bar">
	<div class="filter-bar-inner">
		<!-- 关键词显示 -->
		<div class="keyword-display">
			<span class="keyword-label">搜索</span>
			<span class="keyword-value">"{keyword}"</span>
			<span class="keyword-result-count">
				共 {summary.total} 条结果
			</span>
		</div>

		<!-- 筛选与排序 -->
		<div class="controls-row">
			<!-- Tab 分类切换 -->
			<div class="tab-group" role="tablist" aria-label="搜索结果分类">
				{#each tabs as tab}
					<button
						role="tab"
						aria-selected={activeTab === tab.id}
						class="tab-btn {activeTab === tab.id ? 'tab-active' : ''}"
						onclick={() => onTabChange(tab.id)}
					>
						{tab.label}
						<span class="tab-count">{getCount(tab.id)}</span>
					</button>
				{/each}
			</div>

			<!-- 排序方式 -->
			<div class="sort-group">
				<label for="search-sort" class="sort-label">排序:</label>
				<select
					id="search-sort"
					value={sortOrder}
					onchange={(e) => {
						const target = e.target as HTMLSelectElement;
						onSortChange(target.value as SortOrder);
					}}
					class="sort-select"
				>
					<option value="relevance">相关度最高</option>
					<option value="dateDesc">最新发布</option>
					<option value="dateAsc">最早发布</option>
				</select>
			</div>
		</div>
	</div>
</div>

<style>
	.filter-bar {
		background: var(--card-bg);
		border-radius: 1rem;
		padding: 1rem 1.25rem;
		margin-bottom: 1.5rem;
		border: 1px solid var(--border-color, rgba(0, 0, 0, 0.06));
	}
	.filter-bar-inner {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}
	.keyword-display {
		display: flex;
		align-items: baseline;
		gap: 0.5rem;
		flex-wrap: wrap;
	}
	.keyword-label {
		font-size: 1rem;
		color: var(--text-50);
	}
	.keyword-value {
		font-size: 1.125rem;
		font-weight: 700;
		color: var(--primary);
	}
	.keyword-result-count {
		font-size: 0.8125rem;
		color: var(--text-40);
		margin-left: auto;
	}
	.controls-row {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 0.75rem;
	}
	.tab-group {
		display: flex;
		gap: 0.25rem;
		background: var(--btn-plain-bg-hover, rgba(0, 0, 0, 0.04));
		padding: 0.25rem;
		border-radius: 0.75rem;
	}
	:global(.dark) .tab-group {
		background: rgba(255, 255, 255, 0.06);
	}
	.tab-btn {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		padding: 0.375rem 0.75rem;
		border: none;
		border-radius: 0.5rem;
		font-size: 0.8125rem;
		font-weight: 500;
		color: var(--text-50);
		background: transparent;
		cursor: pointer;
		transition: all 0.15s ease;
		white-space: nowrap;
	}
	.tab-btn:hover {
		color: var(--tw-prose-headings);
	}
	.tab-active {
		background: var(--card-bg, #ffffff);
		color: var(--primary) !important;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
	}
	:global(.dark) .tab-active {
		background: rgba(255, 255, 255, 0.08);
	}
	.tab-count {
		font-size: 0.6875rem;
		opacity: 0.7;
		background: var(--btn-plain-bg-hover);
		padding: 0.0625rem 0.375rem;
		border-radius: 9999px;
	}
	.sort-group {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}
	.sort-label {
		font-size: 0.8125rem;
		color: var(--text-50);
		white-space: nowrap;
	}
	.sort-select {
		font-size: 0.8125rem;
		font-weight: 500;
		color: var(--primary);
		background: transparent;
		border: none;
		outline: none;
		cursor: pointer;
		padding: 0.25rem 1.5rem 0.25rem 0.5rem;
		appearance: none;
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
		background-repeat: no-repeat;
		background-position: right 0.25rem center;
	}
</style>
