const meta = require("../../package");
const debug = require("debug")(meta.name + ":resolver");
const _ = require("lodash");
const Promise = require("bluebird");
const url = require("url");
const request = require("request");
const pac = require("pac-resolver");
const local = require("./local-address");
const fs = require("fs");

const defaults = {
    url: undefined,
    auth: undefined
};

const fileProtocol = "file://";

function retrievePacFile(url) {
    return new Promise((resolve, reject) => {
        debug("retrieving proxy.pac at %j", url);

        if (!url.startsWith(fileProtocol)) {
            request(
                {
                    url: url,
                    proxy: false
                },
                (err, res, body) => {
                    if (err) {
                        return reject(err);
                    } else if (Math.floor(res.statusCode / 100) !== 2) {
                        return reject(new Error(res.statusMessage));
                    }

                    debug("proxy.pac retrieved");
                    return resolve(body);
                }
            );
        } else {
            fs.readFile(url.substr(fileProtocol.length), (err, contents) => {
                if (err) {
                    return reject(err);
                } else {
                    return resolve(contents);
                }
            });
        }
    });
}

module.exports = async options => {
    options = _.defaults(options, defaults);

    if (typeof options.url === "undefined") {
        throw new Error("missing url parameter");
    }

    const body = await retrievePacFile(options.url);

    try {
        const resolver = pac(body, {
            sandbox: {
                myIpAddress: local.get
            }
        });

        debug("returning resolver for proxy.pac at %j", options.url);
        return async uri => {
            debug("resolving proxy for %j", uri);
            try {
                if (await local.check(url.parse(uri).hostname)) {
                    throw new Error("trying to resolve local address");
                }
                const dest = await resolver(uri);
                let [verb, proxy] = dest.split(/[\s;]+/);
                debug("proxy for %j resolved to %j", uri, proxy);
                if (proxy) {
                    uri = url.parse(`http://${proxy}`);
                } else {
                    uri = url.parse(uri);
                }
                return {
                    connection: verb,
                    host: uri.hostname,
                    port: uri.port
                        ? uri.port
                        : uri.protocol === "https:"
                            ? 443
                            : 80,
                    auth: proxy ? options.auth : undefined
                };
            } catch (err) {
                debug("error resolving %j: %O", uri, err);
                throw err;
            }
        };
    } catch (err) {
        debug("error creating resolver for proxy.pac at %j", options.url);
        throw err;
    }
};
