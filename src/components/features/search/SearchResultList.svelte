
<script lang="ts">
	import Icon from "@iconify/svelte";
	import type { SearchResultItem, SearchDimension } from "@/types/search";
	import { navigateToPage } from "@/utils/navigation-utils";

	interface Props {
		results: SearchResultItem[];
		isLoading: boolean;
		keyword: string;
	}

	const { results, isLoading, keyword }: Props = $props();

	const dimensionLabels: Record<SearchDimension, string> = {
		posts: "文章",
		projects: "项目",
		moments: "动态",
	};

	const dimensionIcons: Record<SearchDimension, string> = {
		posts: "material-symbols:article-outline",
		projects: "material-symbols:rocket-launch-outline",
		moments: "material-symbols:chat-outline",
	};

	const handleResultClick = (e: MouseEvent, url: string) => {
		e.preventDefault();
		navigateToPage(url);
	};

	// 骨架屏占位
	const skeletonCount = [1, 2, 3];
</script>

{#if isLoading}
	<!-- 加载骨架屏 -->
	<div class="result-list">
		{#each skeletonCount as i}
			<div class="result-card skeleton">
				<div class="skeleton-dim"></div>
				<div class="skeleton-title"></div>
				<div class="skeleton-excerpt"></div>
				<div class="skeleton-meta"></div>
			</div>
		{/each}
	</div>
{:else if results.length === 0}
	<!-- 空状态 -->
	<div class="empty-state">
		<Icon icon="material-symbols:search-off" class="empty-icon" />
		<h3 class="empty-title">未找到相关结果</h3>
		<p class="empty-desc">
			未搜索到与 "<span class="empty-keyword">{keyword}</span>" 匹配的内容
		</p>
		<p class="empty-hint">
			建议尝试：检查关键词是否拼写正确、使用更通用的关键词、或尝试其他分类筛选
		</p>
	</div>
{:else}
	<!-- 结果列表 -->
	<div class="result-list">
		{#each results as item (item.id)}
			<a
				href={item.url}
				onclick={(e) => handleResultClick(e, item.url)}
				class="result-card group"
			>
				<div class="result-dimension">
					<Icon icon={dimensionIcons[item.dimension]} class="dim-icon" />
					<span class="dim-label">{dimensionLabels[item.dimension]}</span>
					{#if item.score > 0}
						<span class="dim-score">{Math.round(item.score * 100)}% 匹配</span>
					{/if}
				</div>
				<h3 class="result-title">
					{@html item.title}
				</h3>
				{#if item.excerpt}
					<div class="result-excerpt">{@html item.excerpt}</div>
				{/if}
				<div class="result-meta">
					{#if item.publishDate}
						<span class="result-date">{item.publishDate}</span>
					{/if}
					<span class="result-url">{item.url}</span>
				</div>
			</a>
		{/each}
	</div>
{/if}

<style>
	.result-list {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	/* 结果卡片 */
	.result-card {
		display: block;
		padding: 1rem 1.25rem;
		background: var(--card-bg);
		border-radius: 1rem;
		border: 1px solid var(--border-color, rgba(0, 0, 0, 0.06));
		text-decoration: none;
		color: inherit;
		transition: all 0.15s ease;
		cursor: pointer;
	}
	.result-card:hover {
		border-color: var(--primary);
		box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
		transform: translateY(-1px);
	}
	:global(.dark) .result-card:hover {
		border-color: var(--primary);
		box-shadow: 0 2px 16px rgba(0, 0, 0, 0.2);
	}
	.result-dimension {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		margin-bottom: 0.5rem;
		font-size: 0.75rem;
	}
	.dim-icon {
		font-size: 0.875rem;
		color: var(--primary);
		opacity: 0.7;
	}
	.dim-label {
		font-weight: 600;
		color: var(--primary);
	}
	.dim-score {
		margin-left: auto;
		font-size: 0.6875rem;
		color: var(--text-40);
		background: var(--btn-plain-bg-hover);
		padding: 0.0625rem 0.5rem;
		border-radius: 9999px;
	}
	.result-title {
		font-size: 1rem;
		font-weight: 600;
		color: var(--tw-prose-headings);
		margin: 0 0 0.25rem;
		line-height: 1.5;
		transition: color 0.15s;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
	.result-card:hover .result-title {
		color: var(--primary);
	}
	.result-title :global(mark),
	.result-excerpt :global(mark) {
		background: var(--primary);
		color: white;
		padding: 0.0625rem 0.25rem;
		border-radius: 0.1875rem;
	}
	.result-excerpt {
		font-size: 0.8125rem;
		color: var(--text-50);
		line-height: 1.6;
		margin-bottom: 0.5rem;
		display: -webkit-box;
		-webkit-line-clamp: 3;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
	.result-meta {
		display: flex;
		align-items: center;
		gap: 1rem;
		font-size: 0.75rem;
		color: var(--text-40);
	}
	.result-date {
		white-space: nowrap;
	}
	.result-url {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	/* 骨架屏 */
	.result-card.skeleton {
		pointer-events: none;
	}
	.skeleton-dim,
	.skeleton-title,
	.skeleton-excerpt,
	.skeleton-meta {
		background: linear-gradient(
			90deg,
			var(--btn-plain-bg-hover) 25%,
			var(--btn-plain-bg-active) 50%,
			var(--btn-plain-bg-hover) 75%
		);
		background-size: 200% 100%;
		animation: shimmer 1.5s infinite;
		border-radius: 0.25rem;
		margin-bottom: 0.5rem;
	}
	.skeleton-dim {
		width: 5rem;
		height: 0.75rem;
	}
	.skeleton-title {
		width: 80%;
		height: 1rem;
	}
	.skeleton-excerpt {
		width: 100%;
		height: 0.75rem;
		margin-bottom: 0.75rem;
	}
	.skeleton-meta {
		width: 40%;
		height: 0.625rem;
		margin-bottom: 0;
	}
	@keyframes shimmer {
		0% { background-position: 200% 0; }
		100% { background-position: -200% 0; }
	}

	/* 空状态 */
	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 4rem 1.5rem;
		text-align: center;
	}
	.empty-icon {
		font-size: 4rem;
		color: var(--text-40);
		opacity: 0.3;
		margin-bottom: 1.5rem;
	}
	.empty-title {
		font-size: 1.125rem;
		font-weight: 600;
		color: var(--tw-prose-headings);
		margin-bottom: 0.5rem;
	}
	.empty-desc {
		font-size: 0.875rem;
		color: var(--text-50);
		margin-bottom: 0.75rem;
	}
	.empty-keyword {
		font-weight: 600;
		color: var(--primary);
	}
	.empty-hint {
		font-size: 0.8125rem;
		color: var(--text-40);
		max-width: 24rem;
		line-height: 1.5;
	}
</style>
