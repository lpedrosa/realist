# realist

In the effort of providing a maintainable listing widget to display results that get pulled from a back-end app, I started developing **realist**.
It should allow you to configure a list model which you can feed data into or specify a remote source. It should have these main features:

* simple list management functionality (addItems, clearItems, itemCount, etc.) so you can use it with you great _knockout.js_ template
* built in sort features or plug your own
* built in pagination features or plug your own
* built in filtering features or... wait for it... that's right, plug your own!

> But why would one use knockout.js?

Apart from personal preference, it's easy to set-up. No MVC logic needed, it uses MVVM. Since most of the times you're probably already using some
MVC backend, I think it is cumbersome to write extra controller, and view logic.

> But I like those handlebar-like bindings (e.g. {{ fruits }})

Hmmm, sometimes I like those too, but your designer might think otherwise (debatable).


Stay tuned for updates!
