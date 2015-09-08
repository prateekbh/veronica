# Veronica JS
Veronica ❤ [Riot](http://riotjs.com/)

Veronica JS is a framework to Riot JS library.
Based on Facebook's flux architecture this framework is focused but is not restricted to Mobile web, with its slim size and entirity in nature we tend to make mobile web a delightful experience again.

In footsteps of [flux](https://facebook.github.io/flux/docs/overview.html) framework, veronica boots itself with a singleton dispatcher and ability to create singleton stores and actions(can have multiple instances).



### Veronica Flux namespace
This name pace is the store Actions and Stores.

Actions and Stores have functions createActions/createStores and getAction/getStore which help you create/get instances of both.

### Veronica Actions
Creation of Actions
```
 function ItemActions(){
 	this.addItem(item){
 		this.Dispatcher.trigger("item:action",{data:item});
 	}
 }

 veronica.flux.Actions.createAction(ItemActions);	//creating an action

 //accessing inside a view
 var itemActionObj=veronica.flux.Actions.getAction("ItemActions");
itemActionObj.addItem("my shopping item");

```

Actions in veronica have inbuilt Ajax capabilities.

Ajax Usage in actions
```
	function ItemActions(){
		this.fetchItemDetails(itemid){
			//this.http object exposes get/post/delete/put methods
			this.http.get("url?id="+itemid).success(function(res){
				this.Dispatcher.trigger("item:detail",{data:res});
			})
		}
	}
```

P.S. Only Actions can/should perform Ajax in veronica

### Veronica Sizzle
Veronica gives $ selector at window scope which returns an array of HTMLElements, that can be itterated through to perform operations on these elements

e.g.
```
var h3s=$("h3");
````

### Veronica Event Bus
Veronica event bus is a bus for facilitating pubsub in the framework.
"veronica.eventBus" is the singleton object defined for the same.

Usage: 
```
veronica.eventBus.on("eventname",callback)
veronica.eventBus.off("eventname",callback)
veronica.eventBus.once("eventname",callback)
veronica.eventBus.trigger("eventname",{data})
```

### Veronica Promises
The promises object gives u a way to create $q promises the new new constructer.
You resolve/reject these promises and call backs  are registered with .success or .error

### Veronica Http/Ajax
Veronica under "Http" name space puts the ability make ajax calls via GET/POST/PUT/DELETE.
The returning object are above said promises

### Veronica Storage
Veronica under its two namespaces DS/Session wraps localStorage and sessionStorage respectivly, this not only allows session storage to be working even where it is not present but also allows is an apt place to put your ios/android application cache hooks.

### Veronica Router
Veronica comes with a full URL support router that not only saves your hash links for specific positions in page but also delights your SEO ranks

### Roadmap to 1.0
Our roadmap to a 1.0 version currently includes introding the following stuff in the framework
- Flux architecture
- A good amount of test coverage