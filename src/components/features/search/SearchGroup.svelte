
<script lang="ts">
	import Icon from "@iconify/svelte";
	import type { SearchResultItem } from "@/types/search";

	interface Props {
		title: string;
		icon: string;
		items: SearchResultItem[];
		onItemClick: (url: string) => void;
	}

	const { title, icon, items, onItemClick }: Props = $props();
</script>

{#if items.length > 0}
	<div class="search-group">
		<div class="search-group-header">
			<Icon icon={icon} class="group-icon" />
			<span class="group-title">{title}</span>
			<span class="group-count">{items.length}</span>
		</div>
		<div class="search-group-items">
			{#each items as item (item.id)}
				<a
					href={item.url}
					onclick={(e) => {
						e.preventDefault();
						onItemClick(item.url);
					}}
					class="search-result-item group"
				>
					<div class="result-title">
						{item.title}
						<Icon icon="fa7-solid:chevron-right" class="result-arrow" />
					</div>
					{#if item.excerpt}
						<div class="result-excerpt">{@html item.excerpt}</div>
					{/if}
				</a>
			{/each}
		</div>
	</div>
{/if}

<style>
	.search-group {
		margin-bottom: 0.25rem;
	}
	.search-group:last-child {
		margin-bottom: 0;
	}
	.search-group-header {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		padding: 0.5rem 0.75rem 0.25rem;
		font-size: 0.75rem;
		font-weight: 600;
		color: var(--text-50);
		text-transform: uppercase;
		letter-spacing: 0.025em;
	}
	.group-icon {
		font-size: 0.875rem;
		opacity: 0.6;
	}
	.group-title {
		flex: 1;
	}
	.group-count {
		background: var(--btn-plain-bg-hover);
		border-radius: 9999px;
		padding: 0.0625rem 0.5rem;
		font-size: 0.6875rem;
		font-weight: 500;
	}
	.search-group-items {
		display: flex;
		flex-direction: column;
	}
	.search-result-item {
		display: block;
		padding: 0.5rem 0.75rem;
		border-radius: 0.75rem;
		transition: background-color 0.15s ease;
		cursor: pointer;
		text-decoration: none;
		color: inherit;
	}
	.search-result-item:hover {
		background: var(--btn-plain-bg-hover);
	}
	.search-result-item:active {
		background: var(--btn-plain-bg-active);
	}
	.result-title {
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--tw-prose-headings);
		display: inline-flex;
		align-items: center;
		gap: 0.25rem;
		transition: color 0.15s;
	}
	.search-result-item:hover .result-title {
		color: var(--primary);
	}
	.result-arrow {
		font-size: 0.625rem;
		color: var(--primary);
		opacity: 0;
		transform: translateX(-0.25rem);
		transition: opacity 0.15s, transform 0.15s;
	}
	.search-result-item:hover .result-arrow {
		opacity: 1;
		transform: translateX(0);
	}
	.result-excerpt {
		font-size: 0.75rem;
		color: var(--text-50);
		margin-top: 0.125rem;
		line-height: 1.4;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
	.result-excerpt :global(mark) {
		background: var(--primary);
		color: white;
		padding: 0 0.125rem;
		border-radius: 0.125rem;
	}
</style>
