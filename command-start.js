const meta = require("./package");
const debug = require("debug")(meta.name + ":command-start");
const { fork } = require("child_process");
const path = require("path");
const inquirer = require("inquirer");
const server = require("./server");

exports.command = "start [options]";

exports.describe = "Start the proxy.pac proxy";

exports.builder = {
    url: {
        demandOption: true
    },
    address: {},
    port: {},
    authenticate: {},
    username: {},
    password: {},
    foreground: {}
};

exports.handler = async argv => {
    try {
        if (argv.authenticate && !argv.username) {
            argv.username = (await inquirer.prompt([
                {
                    type: "string",
                    name: "value",
                    message: "Username:"
                }
            ])).value;
        }

        if (argv.username && !argv.password) {
            argv.password = (await inquirer.prompt([
                {
                    type: "password",
                    name: "value",
                    message: `Password for ${argv.username}:`
                }
            ])).value;
        }

        if (argv.foreground) {
            const daemon = await server(argv);

            daemon.on("error", err => {
                console.error("Cannot start proxy.");
                console.error(err);
                process.exit(1);
            });

            daemon.on("listening", () => {
                console.log("Proxy succesfully started.");
                console.log(
                    "You may configure your " +
                        "shell by running the `" +
                        argv["$0"] +
                        " env` command."
                );
            });
        } else {
            const daemon = fork(__dirname + path.sep + "daemon", {
                detached: true,
                stdio: "ignore"
            });

            daemon.send(argv);
            daemon.on("message", err => {
                if (err) {
                    console.error("Cannot start proxy.");
                    console.error(err);
                    process.exit(1);
                } else {
                    console.log("Proxy succesfully started.");
                    console.log(
                        "You may configure your " +
                            "shell by running the `" +
                            argv["$0"] +
                            " env` command."
                    );
                    process.exit(0);
                }
            });
        }
    } catch (err) {
        console.error("Cannot start proxy.");
        console.error(err);
    }
};
