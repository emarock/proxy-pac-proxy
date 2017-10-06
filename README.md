# proxy-pac-proxy

<img src="https://user-images.githubusercontent.com/13051155/31047761-b81f3b34-a610-11e7-849d-6ca9924c93a6.png" height="140" align="right">

> Forwarding proxy with support for upstream *proxy.pac* resolution
> and BASIC authentication

Software development in network environments where Internet access is
forced through dynamically configured HTTP proxies is a pain. The
simple use of common package managers such as
[npm](https://www.npmjs.com/),
[pip](https://pypi.python.org/pypi/pip), [gem](https://rubygems.org/)
or [docker](https://www.docker.com/) -- perhaps in combination with
services and repositories on the local network -- requires reverse
engineering of a *proxy.pac* file and the configuration of arbitrarily
complicated combinations of the usual *\*_PROXY* environment
variables. Worse, if the proxy requires authentication, passwords will
quickly spread across environment variables, *\*_history* files and
whatnot.

*Proxy-pac-proxy* tries to alleviate at least some of that pain.

 * [Installation](#installation)
 * [Quick Start](#quick-start)
 * [Retrieving the proxy.pac URL](#retrieving-the-proxypac-url)
 * [Usage](#usage)
   * [proxy-pac-proxy start](#proxy-pac-proxy-start)
   * [proxy-pac-proxy stop](#proxy-pac-proxy-stop)
   * [proxy-pac-proxy env](#proxy-pac-proxy-env)
 * [Limitations](#limitations)

## Installation

> Note: *proxy-pac-proxy* requires at least Node v7.6.0

> Note2: installation requires access to the public npmjs.com
> repository. That is straightforward when connected to a public
> network, but may be tricky in those network environments where
> *proxy-pac-proxy* is needed. In the latter case, `npm` can be
> instructed to access the Internet through a previously discovered
> HTTP proxy by using the `--https-proxy` option. This is needed only
> at installation time; afterwards proxy-pac-proxy can take care of
> the problem

To install *proxy-pac-proxy* on your system run:

```
$ npm install -g proxy-pac-proxy
```


## Quick Start

Export the *proxy.pac* URL (optional, but if the environment variable
is not set, the URL will need to be provided on the command line with
the `-u` option):

```
$ export PROXYPACPROXY_URL=http://intranet.mycompany.com/proxy.pac
```

Start the forwarding proxy server with authentication:

```
$ proxy-pac-proxy start -A
Username: joedoe
Password for joedoe: [hidden]
Proxy succesfully started.
You may configure your shell by running the `proxy-pac-proxy env` command.
```

From this point on, in any shell it will be possible to automatically
configure all the appropriate *\*_PROXY* environment variables for
steering traffic through the new forwarding proxy:

```
$ eval $(proxy-pac-proxy env)
```

Test:

```
$ curl -v http://example.com
* Rebuilt URL to: http://example.com/
*   Trying 127.0.0.1...
* TCP_NODELAY set
* Connected to (nil) (127.0.0.1) port 8079 (#0)
> GET http://example.com/ HTTP/1.1
> Host: example.com
> User-Agent: curl/7.52.1
> Accept: */*
> Proxy-Connection: Keep-Alive
> 
< HTTP/1.1 200 OK
< date: Sat, 30 Sep 2017 09:16:36 GMT
< etag: "359670651+ident"
< vary: Accept-Encoding
< server: ECS (dca/24D1)
< expires: Sat, 07 Oct 2017 09:16:36 GMT
< x-cache: HIT, HIT from 10.29.176.45
< content-type: text/html
< cache-control: max-age=604800
< last-modified: Fri, 09 Aug 2013 23:54:35 GMT
< content-length: 1270
< proxy-connection: Keep-Alive
< Connection: keep-alive
< ...
```


## Retrieving the *proxy.pac* URL

The *proxy.pac* URL is often configured automatically, in ways that
depend on the operating system and the IT/network administration
policies (e.g. autodiscovery, remote admin...). One simple
cross-platform way to retrieve the URL is on the
*chrome://net-internals* tab in Chrome:

![Chrome net-internals screenshot](https://user-images.githubusercontent.com/13051155/31044770-b59dc0aa-a5d5-11e7-931c-0f0b0ceb3f8c.png)


## Usage

### proxy-pac-proxy start

Start a local instance of a forwarding proxy that can be controlled
through the *stop* and *env* commands.

```
$ proxy-pac-proxy start --help
proxy-pac-proxy start [options]

Options:
  --url, -u               The proxy.pac URL                 [string] [required]
  --address, -a           The local address the proxy will bind to
                                                [string] [default: "127.0.0.1"]
  --port, -p              The local port the proxy will bind to
                                                       [number] [default: 8079]
  --authenticate, -A      Prompt for username and password for proxy
                          authentication             [boolean] [default: false]
  --username, --user, -U  The username for proxy authentication        [string]
  --password, --pass, -P  The password for proxy authentication        [string]
  --foreground, -f        Run in foreground          [boolean] [default: false]
  -h, --help              Show help                                   [boolean]
  -v, --version           Show version number                         [boolean]
```

### proxy-pac-proxy stop

Stop the local forwarding proxy instance.

```
$ proxy-pac-proxy stop --help
proxy-pac-proxy stop [options]

Options:

  --address, -a           The local address the proxy is bound to
                                                [string] [default: "127.0.0.1"]
  --port, -p              The local port the proxy is bound to
                                                       [number] [default: 8079]
  -h, --help              Show help                                   [boolean]
  -v, --version           Show version number                         [boolean]
```


### proxy-pac-proxy env

Display the commands to configure the shell environment.

```
$ proxy-pac-proxy env --help
proxy-pac-proxy env [options]

Options:
  --address, -a           The local address the proxy is bound to
                                                [string] [default: "127.0.0.1"]
  --port, -p              The local port the proxy is bound to
                                                       [number] [default: 8079]
  --reset, -r             Display commands to reset the environment
                                                     [boolean] [default: false]
  -h, --help              Show help                                   [boolean]
  -v, --version           Show version number                         [boolean]
```

## Limitations

 * Only supports BASIC Authentication

 * Only slightly more secure than storing credentials in environment
   variables. With BASIC authentication Base64-encoded passwords are
   transmitted in clear

     * Do not use authentication unless you totally trust the local
       network administrator; if that's not the case, then leave
       authentication unset (i.e. don't use `-A` or `-U` options) and
       rely on application-based authentication

 * The `env` command only displays commands for bash. Commands for
   other shells can be easily derived, but at this point it must be
   done manually
