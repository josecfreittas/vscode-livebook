# WIP VS Code Livebook

An extension to run a Livebook instance inside your VS Code

![image](https://user-images.githubusercontent.com/10376340/152652568-c6aea380-f633-4c88-b48e-ea7e5937e47a.png)


## Planned features

- ❎ Run without the need of local installations of Erlang and Elixir
- ✅ Run and access Livebook directly on VS Code
- ❎ Open `.livemd` files with Livebook directly on VS Code

## Known Issues

* A custom Livebook build is needed because of two reasons:  
    1. The default behavior of Livebook is to open the default system browser when the server is started.  
    This cannot happen here because the expected behavior is to use Livebook inside VS Code.

    2. It is necessary to use and `iframe` to render a webpage (Livebook) inside VS Code, and by default, Livebook is configured to not allow it.
