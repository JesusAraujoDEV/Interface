class AppHeader extends HTMLElement {
	connectedCallback() {
		// Evita re-render si el navegador re-conecta el nodo.
		if (this.__rendered) return;
		this.__rendered = true;

		this.innerHTML = `
			<header class="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
				<div class="flex items-center justify-between gap-4">
					<div class="flex items-center gap-3 shrink-0">
						<div class="w-4 h-4 bg-black rotate-45"></div>
						<span class="font-semibold">Charlotte</span>
					</div>
				</div>
			</header>
		`;
	}
}

customElements.define('app-header', AppHeader);
