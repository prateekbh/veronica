<demo-intro>
	<h1>Build List/<a href='/list'>View List</a></h1>
	<input type="text"/><input type="submit" onclick="{addItem}"/>
	<script>
		var itemAction=veronica.flux.Actions.getActions("ItemsActions");
		this.addItem=function(){
			itemAction.addItem("ata");
		}
	</script>
</demo-intro>

<demo-list>
	<h1>Your List</h1>
	<div each={l in list}>
		{l}
	</div>
	<script>
		this.list=[];
		var _self=this;
		this.on("mount",function(){
			_self.update({
				list:veronica.flux.Stores.getStores("ListStore").getItems()
			});
		});
	</script>
</demo-list>