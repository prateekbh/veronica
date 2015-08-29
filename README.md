# Veronica JS
Veronica ❤ Riot

Veronica JS is a framework to Riot JS library.
Veronica as a framework focuses but is not restricted to Mobile web, with its slim size and entirity in nature we tend to make mobile web a delightful experience again.

Veronica comes with multiple features which help you build, organise and power your Web APP without the bloat.


# Veronica API
Following are the APIs for Veronica

# Veronica Sizzle
Veronica gives $ selector at window scope which returns an array of HTMLElements, that can be itterated through to perform operations on these elements

e.g.
var h3s=$("h3");

# Veronica Event Bus
Veronica event bus is a bus for facilitating pubsub in the framework.
"veronica.eventBus" is the singleton object defined for the same.

Usage: 
veronica.eventBus.on("eventname",callback)
veronica.eventBus.off("eventname",callback)
veronica.eventBus.once("eventname",callback)
veronica.eventBus.trigger("eventname",{data})

# Veronica Promises
The promises object gives u a way to create $q promises the new new constructer.
You resolve/reject these promises and call backs  are registered with .success or .error

# Veronica Http/Ajax
Veronica under "Http" name space puts the ability make ajax calls via GET/POST/PUT/DELETE.
The returning object are above said promises

# Veronica Storage
Veronica under its two namespaces DS/Session wraps localStorage and sessionStorage respectivly, this not only allows session storage to be working even where it is not present but also allows is an apt place to put your ios/android application cache hooks.

# Veronica Router
Veronica comes with a full URL support router that not only saves your hash links for specific positions in page but also delights your SEO ranks

# Roadmap to 1.0
Our roadmap to a 1.0 version currently includes introding the following stuff in the framework
a.) Flux architecture
b.) A good amount of test coverage