
[travis-url]:https://travis-ci.org/prateekbh/veronica
[travis-image]: https://api.travis-ci.org/prateekbh/veronica.svg?branch=master&style=flat-square

[![Build Status][travis-image]][travis-url]

# Veronica JS
Veronica ❤ [Riot](http://riotjs.com/)

Veronica JS is a framework to Riot JS library.
Based on Facebook's flux architecture this framework is focused but is not restricted to Mobile web, with its slim size and entirity in nature we tend to make mobile web a delightful experience again.

In footsteps of [flux](https://facebook.github.io/flux/docs/overview.html) framework, veronica boots itself with a singleton dispatcher and ability to create singleton stores and actions(can have multiple instances).

### How to use
With version 0.9.2, Veronica no longer pre-compiles itself with Riot. This means that you are free to use any version of Riot you wish for with veronica.
Current we are tesing a no. of Riot's versions with Veronica all successfully working version's list will be update soon

```html
<!-- to use veronica in your project include riot and veronica in the following order -->
 <script type="text/javascript" 
    src="https://cdnjs.cloudflare.com/ajax/libs/riot/X.X.XX/riot.js"></script>
<script type="text/javascript" 
    src="path to veronica.js"></script>

```

### Veronica Flux namespace
This namespace is the store Actions and Stores classes.

Actions and Stores have functions createActions/createStores and getAction/getStore which help you create/get instances of both.

### Veronica Actions
Actions in veronica/flux are meant to perform jobs, api calls, perform async functions etc. and send the processed data to the '[./lib/dispatcher.js](Dispatcher)'

Creating an Action
```js
 function ItemActions(){
    this.addItem(item){
        this.Dispatcher.trigger("item:action",{data:item});
    }
 }

//creating an action
 veronica.flux.Actions.createAction("ItemActions",ItemActions); 

 //accessing inside a view
 var itemActionObj=veronica.flux.Actions.getAction("ItemActions");
itemActionObj.addItem("my shopping item");

```

Actions in veronica have inbuilt Ajax capabilities.

Ajax Usage in actions
```js
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
```js
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
        this.Dispatcher.unregister("item:action",addItemToList);    //removing a listener
    }
}

//creating an store
veronica.flux.Stores.createStore("ItemStores",ItemStores);  

 //accessing inside a view
 var itemStoreObj=veronica.flux.Stores.getStore("ItemStores");  //this will be a sigle
this.items=itemStoreObj.getItems();
```

### Veronica Dispatcher
Actions and Stores in veronica have access to different access to specific APIs of Dispatcher so as to maintain the unidirectional flow of data.

Dispatcher has following 4 APIs
```js
//only present in Stores
this.Dispatcher.register("eventname",callback)
this.Dispatcher.unregister("eventname",callback)
this.Dispatcher.registerce("eventname",callback)

//only present in Actions
this.Dispatcher.trigger("eventname",{data})
```

### Veronica Router
Veronica comes with a push state router, allowing you to handle your urls without the hashbang.

API

```js
    //adding a route
    veronica.addRoute(routeObj);

    //navigating to urls
    veronica.loc("url to go to");
    veronica.replaceLoc("url to go to");    //replace state

    //acessing current location data
    veronica.loc();

    //get current page url
    vernocia.getCurrentPath();

    //get current state.
    vernocia.getCurrentState();

    //route params and there value
    vernocia.getCurrentState().data;


    //get previous page url
    vernocia.getPrevPageUrl();

    //enable or disable popstate listener in veronica router
    veronica.settings.listenPopState=true;
    or
    veronica.settings.listenPopState=false;

    //sample routes
    /person/:pid
    /account/:aid/:pid => /account/123/p26 =>   {aid:"123",pid:"p26"}

```
### Veronica Promises
The promises object gives u a way to create $q promises the new new constructer.
You resolve/reject these promises and call backs  are registered with .success or .error

### Veronica Storage
This feature is only available for stores
Veronica under its two namespaces DS/Session wraps localStorage and sessionStorage respectivly, this not only allows session storage to be working even where it is not present but we plan to expose library which can be used to push data to either localstorage/indexedDB without changing the API structure.

### Page Transitions
To enable page transition animations do the following two lines of code
```js
veronica.settings.enablePageTransitions=true;
veronica.settings.maxPageTransitionTime=300;
```

Now upon state change outgoing state is given class "unmount/unmount-pop" and incoming component is given class "mounting"

Please use CSS3 Transitions upon these classes to put exit and entry animations of the various components.

### Changelog
- 0.0.1     Basic APIs + push-state router to work with different components
- 0.5.0     Introduced Flux architecture and segregated API for different components
- 0.6.0     Introduced switch for page transitioning 
- 0.6.1,0.6.2   Minor bug fixes
- 0.6.3     Adding replaceLocation functionality to router
- 0.6.4     Store and action creation name api change
- 0.6.5     Global Ajax and Data setter and getter
- 0.6.6     HTML remove function bug fix
- 0.7.0     Enabling page transitions
- 0.7.1     Switch for Pop State listener to default veronica router
- 0.8.0     Regex free router
- 0.8.1     Push state data bug fix
- 0.8.2     Unmount bug fix
- 0.9.0     Ajax enhancements
- 0.9.1     Strict versioning of node modules
- 0.9.2     Removing Riot as a pre-compiled dependency



### Roadmap to 1.0
Our roadmap to a 1.0 version currently includes introding the following stuff in the framework
- A good amount of test coverage
