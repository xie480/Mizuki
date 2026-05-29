
<script lang="ts">
	import Icon from "@iconify/svelte";
	import type { GroupedResults, SearchSummary } from "@/types/search";
	import { SEARCH_CONSTANTS } from "@/types/search";
	import SearchGroup from "./SearchGroup.svelte";

	interface Props {
		keyword: string;
		isSearching: boolean;
		isOpen: boolean;
		results: GroupedResults;
		summary: SearchSummary;
		onItemClick: (url: string) => void;
		onViewAll: () => void;
		onClose: () => void;
	}

	const {
		keyword,
		isSearching,
		isOpen,
		results,
		summary,
		onItemClick,
		onViewAll,
		onClose,
	}: Props = $props();

	// 每个维度最多显示3条
	const dropdownPosts = $derived(
		results.posts.slice(0, SEARCH_CONSTANTS.MAX_DROPDOWN_ITEMS_PER_DIMENSION),
	);
	const dropdownProjects = $derived(
		results.projects.slice(0, SEARCH_CONSTANTS.MAX_DROPDOWN_ITEMS_PER_DIMENSION),
	);
	const dropdownMoments = $derived(
		results.moments.slice(0, SEARCH_CONSTANTS.MAX_DROPDOWN_ITEMS_PER_DIMENSION),
	);

	const hasAnyResults = $derived(
		results.posts.length > 0 ||
			results.projects.length > 0 ||
			results.moments.length > 0,
	);

	const totalVisible = $derived(
		dropdownPosts.length + dropdownProjects.length + dropdownMoments.length,
	);

	const totalAll = $derived(summary.total);
</script>

{#if isOpen}
	<div class="search-dropdown">
		{#if isSearching}
			<!-- 骨架屏 Loading -->
			<div class="dropdown-section">
				<div class="skeleton-header"></div>
				<div class="skeleton-item"></div>
				<div class="skeleton-item"></div>
				<div class="skeleton-item-short"></div>
			</div>
			<div class="dropdown-section">
				<div class="skeleton-header"></div>
				<div class="skeleton-item"></div>
				<div class="skeleton-item-short"></div>
			</div>
		{:else if !hasAnyResults}
			<!-- 空状态 -->
			<div class="empty-state">
				<Icon icon="material-symbols:search-off" class="empty-icon" />
				<div class="empty-text">
					<p class="empty-title">未找到相关结果</p>
					<p class="empty-hint">
						未搜索到与 "<span class="empty-keyword">{keyword}</span>" 匹配的内容
					</p>
					<p class="empty-suggestion">试试其他关键词</p>
				</div>
			</div>
		{:else}
			<!-- 分组展示结果 -->
			<div class="dropdown-results">
				<SearchGroup
					title="文章"
					icon="material-symbols:article-outline"
					items={dropdownPosts}
					{onItemClick}
				/>
				<SearchGroup
					title="项目"
					icon="material-symbols:rocket-launch-outline"
					items={dropdownProjects}
					{onItemClick}
				/>
				<SearchGroup
					title="动态"
					icon="material-symbols:chat-outline"
					items={dropdownMoments}
					{onItemClick}
				/>
			</div>

			<!-- 查看全部结果入口 -->
			{#if totalAll > totalVisible}
				<button
					onclick={onViewAll}
					class="view-all-btn"
				>
					查看全部 {totalAll} 条结果
					<Icon icon="material-symbols:arrow-forward" class="view-all-arrow" />
				</button>
			{/if}
		{/if}
	</div>
{/if}

<style>
	.search-dropdown {
		background: var(--card-bg, #ffffff);
		border-radius: 1rem;
		box-shadow:
			0 10px 40px rgba(0, 0, 0, 0.12),
			0 2px 8px rgba(0, 0, 0, 0.06);
		overflow: hidden;
		border: 1px solid var(--border-color, rgba(0, 0, 0, 0.06));
		max-height: calc(var(--vh, 1vh) * 100 - 6rem);
		overflow-y: auto;
		animation: dropdown-in 0.15s ease-out;
	}
	@keyframes dropdown-in {
		from {
			opacity: 0;
			transform: translateY(-0.5rem);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	/* 暗色模式 */
	:global(.dark) .search-dropdown {
		background: var(--card-bg, #1e1e2e);
		border-color: var(--border-color, rgba(255, 255, 255, 0.06));
	}

	/* 骨架屏 */
	.dropdown-section {
		padding: 0.75rem;
		border-bottom: 1px solid var(--border-color, rgba(0, 0, 0, 0.04));
	}
	.dropdown-section:last-child {
		border-bottom: none;
	}
	.skeleton-header {
		height: 0.75rem;
		width: 30%;
		background: linear-gradient(
			90deg,
			var(--btn-plain-bg-hover) 25%,
			var(--btn-plain-bg-active) 50%,
			var(--btn-plain-bg-hover) 75%
		);
		background-size: 200% 100%;
		animation: shimmer 1.5s infinite;
		border-radius: 0.25rem;
		margin-bottom: 0.625rem;
	}
	.skeleton-item {
		height: 2.75rem;
		background: var(--btn-plain-bg-hover);
		border-radius: 0.5rem;
		margin-bottom: 0.375rem;
		animation: shimmer 1.5s infinite;
		background: linear-gradient(
			90deg,
			var(--btn-plain-bg-hover) 25%,
			var(--btn-plain-bg-active) 50%,
			var(--btn-plain-bg-hover) 75%
		);
		background-size: 200% 100%;
	}
	.skeleton-item-short {
		height: 2.75rem;
		width: 70%;
		background: linear-gradient(
			90deg,
			var(--btn-plain-bg-hover) 25%,
			var(--btn-plain-bg-active) 50%,
			var(--btn-plain-bg-hover) 75%
		);
		background-size: 200% 100%;
		animation: shimmer 1.5s infinite;
		border-radius: 0.5rem;
	}
	@keyframes shimmer {
		0% {
			background-position: 200% 0;
		}
		100% {
			background-position: -200% 0;
		}
	}

	/* 空状态 */
	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 2.5rem 1.5rem;
		text-align: center;
	}
	.empty-icon {
		font-size: 2.5rem;
		opacity: 0.3;
		margin-bottom: 0.75rem;
		color: var(--text-50);
	}
	.empty-text {
		max-width: 16rem;
	}
	.empty-title {
		font-size: 0.9375rem;
		font-weight: 600;
		color: var(--tw-prose-headings);
		margin-bottom: 0.25rem;
	}
	.empty-hint {
		font-size: 0.8125rem;
		color: var(--text-50);
		line-height: 1.5;
	}
	.empty-keyword {
		font-weight: 500;
		color: var(--primary);
	}
	.empty-suggestion {
		font-size: 0.75rem;
		color: var(--text-40);
		margin-top: 0.5rem;
	}

	/* 结果容器 */
	.dropdown-results {
		padding: 0.25rem 0;
	}

	/* 查看全部按钮 */
	.view-all-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.375rem;
		width: 100%;
		padding: 0.75rem;
		border: none;
		border-top: 1px solid var(--border-color, rgba(0, 0, 0, 0.06));
		background: transparent;
		color: var(--primary);
		font-size: 0.8125rem;
		font-weight: 500;
		cursor: pointer;
		transition: background-color 0.15s;
	}
	.view-all-btn:hover {
		background: var(--btn-plain-bg-hover);
	}
	.view-all-arrow {
		font-size: 1rem;
		transition: transform 0.15s;
	}
	.view-all-btn:hover .view-all-arrow {
		transform: translateX(0.25rem);
	}
</style>
