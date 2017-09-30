# proxy-pac-proxy

<img src="https://user-images.githubusercontent.com/13051155/31047716-0abd2b22-a610-11e7-9e77-9a95d56f812c.png" height="200" align="right">

> Forwarding proxy with BASIC authentication and upstream proxy.pac
> resolution support

Software development in network environments where Internet access is
forced through dynamically configured HTTP proxies is a pain. The
simple use of common package managers such as
[npm](https://www.npmjs.com/),
[pip](https://pypi.python.org/pypi/pip), [gem](https://rubygems.org/)
or [docker](https://www.docker.com/) -- perhaps in combination with
services and repositories on the local network -- requires reverse
engineering of a *proxy.pac* file and the configuration of arbitrarily
complicated combinations of the usual *_PROXY environment
variables. Worse, if the proxy requires authentication, passwords will
quickly spread across environment variables and *.bash_history* files.

*Proxy-pac-proxy* tries to alleviate at least some of that pain.


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
You may configure your shell by running the `proxy-pac-proxy.js env` command.
```

From this point on, on any shell it will be possible to automatically
configure all the appropriate *_PROXY environment variables for
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


## Retrieving the proxy.pac URL

The *proxy.pac* URL can be configured in many ways, depending on the
operating system and the configuration approach (autodiscovery, remote
admin...). One way to retrieve the URL is on the
*chrome://net-internals* tab in Chrome:

![Chrome net-internals screenshot](https://user-images.githubusercontent.com/13051155/31044770-b59dc0aa-a5d5-11e7-931c-0f0b0ceb3f8c.png)


## Limitations

 * Only supports Basic Authentication

 * Only slightly more secure than storing credentials in environment
   variables. With basic authentication Base64-encode passwords are
   transmitted in cleartext

     * Do not use authentication unless you totally trust the local
       network administrator; in that's not the case, then leave
       authentication unset (i.e. don't use `-A` or `-U` options) and
       rely on application-based authentication

