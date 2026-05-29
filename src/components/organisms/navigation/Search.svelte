
<script lang="ts">
	import I18nKey from "@i18n/i18nKey";
	import { i18n } from "@i18n/translation";
	import Icon from "@iconify/svelte";

	/** 显示正在开发中的提示 */
	const showUnderDevelopment = () => {
		// 创建一个临时的 toast 提示
		const toast = document.createElement("div");
		toast.textContent = "🔍 搜索功能正在开发中";
		toast.className = "search-dev-toast";
		document.body.appendChild(toast);

		// 300ms 后淡入
		requestAnimationFrame(() => {
			toast.classList.add("show");
		});

		// 2秒后移除
		setTimeout(() => {
			toast.classList.remove("show");
			setTimeout(() => {
				toast.remove();
			}, 300);
		}, 2000);
	};
</script>

<!-- 桌面端搜索图标 -->
<button
	id="search-btn-desktop"
	class="hidden lg:flex btn-plain active:scale-90 rounded-lg w-11 h-11 items-center justify-center shrink-0"
	aria-label={i18n(I18nKey.search)}
	onclick={showUnderDevelopment}
>
	<Icon icon="material-symbols:search" class="text-[1.25rem] text-black/50 dark:text-white/50"></Icon>
</button>

<!-- 移动端搜索图标 -->
<button
	id="search-btn-mobile"
	class="lg:!hidden btn-plain scale-animation rounded-lg w-11 h-11 active:scale-90 flex items-center justify-center"
	aria-label={i18n(I18nKey.search)}
	onclick={showUnderDevelopment}
>
	<Icon icon="material-symbols:search" class="text-[1.25rem] text-black/50 dark:text-white/50"></Icon>
</button>

<style>
	:global(.search-dev-toast) {
		position: fixed;
		top: 5rem;
		left: 50%;
		transform: translateX(-50%) translateY(-1rem);
		background: #1e293b;
		color: #f8fafc;
		padding: 1rem 2rem;
		border-radius: 1rem;
		font-size: 1.125rem;
		font-weight: 600;
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
		z-index: 9999;
		opacity: 0;
		transition: opacity 0.3s ease, transform 0.3s ease;
		pointer-events: none;
		white-space: nowrap;
	}
	:global(.search-dev-toast.show) {
		opacity: 1;
		transform: translateX(-50%) translateY(0);
	}
</style>
