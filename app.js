require("dotenv").config()

const firebase = require("firebase")
const chalk = require("chalk")
const fs = require("fs")

const config = {
    apiKey: process.env.API,
    authDomain: process.env.ID + ".firebaseapp.com",
    databaseURL: `https://${process.env.ID}.firebaseio.com`,
    projectId: process.env.ID,
    storageBucket: process.env.ID + ".appspot.com",
    messagingSenderId: process.env.SENDER
};

firebase.initializeApp(config)
console.log(chalk.blue("[firebase] Initialized app"))

const {
    database
} = require("firebase")

const readLine = require("readline").createInterface({
    input: process.stdin,
    output: process.stdout
})

readLine.question("===MENU===\n1.Download all data form firebase\n2.Automatically detect new data, then save\n", mode => {
    readLine.close()

    if (mode == "1") {
        database().ref(`/`).once("value").then(d => {
            if (!d.val()) return console.log(chalk.red(`[firebase] Your database is empty!`))
            const data = d.val()

            const dataString = JSON.stringify(data)

            fs.writeFile("data.json", dataString, function (err, res) {
                if (err) return console.log(chalk.red(`[error] ${err}`))
                else return console.log(chalk.green(`[firebase] Downloaded your data`))
            })
        })
    } else if (mode == "2") {
        let i = 0;

        console.log(chalk.blue("[firebase] Listening..."))

        const dataListener = database().ref(`/`)

        dataListener.on("value", function (d) {
            const data = d.val()

            const dataString = JSON.stringify(data)

            fs.writeFile("data.json", dataString, function (err, res) {
                if (err) return console.log(chalk.red(`[error] ${err}`))
                else {
                    process.stdout.clearLine()
                    process.stdout.cursorTo(0);
                    process.stdout.write(chalk.green(`[firebase] Saved new data [${i}]`))
                    i++
                }
            })
        })
    }
})