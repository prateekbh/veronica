# Veronica JS
Veronica ❤ [Riot](http://riotjs.com/)

Veronica JS is a framework to Riot JS library.
Based on Facebook's flux architecture this framework is focused but is not restricted to Mobile web, with its slim size and entirity in nature we tend to make mobile web a delightful experience again.

In footsteps of [flux](https://facebook.github.io/flux/docs/overview.html) framework, veronica boots itself with a singleton dispatcher and ability to create singleton stores and actions(can have multiple instances).



### Veronica Flux namespace
This namespace is the store Actions and Stores classes.

Actions and Stores have functions createActions/createStores and getAction/getStore which help you create/get instances of both.

### Veronica Actions
Actions in veronica/flux are meant to perform jobs, api calls, perform async functions etc. and send the processed data to the '[./lib/dispatcher.js](Dispatcher)'

Creating an Action
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
			this.http.get(url+"?id="+itemid).success(function(res){
				this.Dispatcher.trigger("item:detail",{data:res});
			})
		}
	}
```

P.S. Only Actions can/should perform Ajax in veronica

### Veronica Stores
Stores in veronica/flux are the data stores that expose data getters and have the capability to listen to events on '[./lib/dispatcher.js](Dispatcher)'.

Creating a Store
```
function ItemStores(){
	var _shoppingList=[];

	this.Dispatcher.register("item:action",addItemToList);

	this.getItems=function(){
		return _shoppingList;
	}

	this.addItemToList=function(data){
		_shoppingList.push(data.item);
	}

	this.removeAddItemListener=function(data){
		this.Dispatcher.unregister("item:action",addItemToList);	//removing a listener
	}
}

 veronica.flux.Stores.createStore(ItemStores);	//creating an store

 //accessing inside a view
 var itemStoreObj=veronica.flux.Stores.getStore("ItemStores");	//this will be a sigle
this.items=itemStoreObj.getItems();
```

### Veronica Dispatcher
Actions and Stores in veronica have access to different access to specific APIs of Dispatcher so as to maintain the unidirectional flow of data.

Dispatcher has following 4 APIs
```
//only present in Stores
this.Dispatcher.register("eventname",callback)
this.Dispatcher.unregister("eventname",callback)
this.Dispatcher.registerce("eventname",callback)

//only present in Actions
this.Dispatcher.trigger("eventname",{data})
```

### Veronica Router
Veronica comes with a push state router, allowing you to handle your urls without the hashbang problem

API

```
	//creating a route object
	var routeObj=veronica.createRoute(stateName, urlRegex, componentToMount);

	//adding a route
	veronica.addRoute(routeObj);

	//navigating to urls
	veronica.loc("url to go to");

	//acessing current location data
	veronica.loc();

	//get current page url
	vernocia.getCurrentPath()

	//get previous page url
	vernocia.getPrevPageUrl()
```
### Veronica Promises
The promises object gives u a way to create $q promises the new new constructer.
You resolve/reject these promises and call backs  are registered with .success or .error

### Veronica Storage
This feature is only available for stores
Veronica under its two namespaces DS/Session wraps localStorage and sessionStorage respectivly, this not only allows session storage to be working even where it is not present but we plan to expose library which can be used to push data to either localstorage/indexedDB without changing the API structure.

### Roadmap to 1.0
Our roadmap to a 1.0 version currently includes introding the following stuff in the framework
- A good amount of test coverage
- Regex free routers