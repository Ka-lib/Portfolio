// Make nav bar (actually any item with .collapsible class) be collapsible/expandable.
const collapsibles = document.querySelectorAll(".collapsible");
collapsibles.forEach((item) =>
	item.addEventListener("click", function () {
		this.classList.toggle("collapsible--expanded");
	}),
);
