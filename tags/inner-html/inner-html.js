riot.tag('inner-html', '', function(opts) {
	var p = this.parent.root
	while (p.firstChild) this.root.appendChild(p.firstChild)

});