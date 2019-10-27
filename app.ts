import { writeFile } from "fs";
import chalk from "chalk";
import config from "./config";
import firebase from "firebase";
import { createInterface } from "readline";

const app = firebase.initializeApp(config);
console.log(chalk.blue("[Firebase] Initialized app."));
const database = firebase.database(app);

const readline = createInterface({
    input: process.stdin,
    output: process.stdout
});

readline.question("Watch for changes instead of downloading all? [y/N]: ", (mode) => {
    readline.close();
    if (mode === "" || mode.toLowerCase() === "n") {

        database.ref(`/`).once("value").then(response => {
            if (!response.val()) return console.log(chalk.red(`[Firebase] Your database is empty!`))
            const data: Object = response.val();
            const dataString = JSON.stringify(data);

            const filename = `${Date.now()}-${config.projectId}.json`;

            writeFile(filename, dataString, () => {
                console.log(chalk.green(`[Firebase] Saved to ${filename}`));
                process.exit(0);
            });
        })

    } else if (mode.toLowerCase() === "y") {
        console.log(chalk.blue("[Firebase] Listening... (press ^C to stop)"));
        let i = 1;
        const filename = `${Date.now()}-${config.projectId}.json`;
        const dataListener = database.ref(`/`);

        dataListener.on("value", (snapshot) => {
            const data: Object = snapshot.val();
            const dataString = JSON.stringify(data);

            writeFile(filename, dataString, () => {
                console.log(chalk.green(`[Firebase] Updated ${filename} ${i} time.`));
                i++
            })
        })
    } else {
        console.log(chalk.red("Invalid option. [y/N]"));
        process.exit(1);
    }
});