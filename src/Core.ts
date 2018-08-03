import "reflect-metadata"
import { Container, interfaces } from "inversify";
import * as bodyParser from 'body-parser';
import { UserModule } from './UserModule';
import { Validator } from "validator.ts/Validator";
import { InversifyExpressServer } from "inversify-express-utils";
import { TYPES } from "./Types";
import "./UserController";
import { Db, MongoClient } from 'mongodb';
import { resolve } from "url";

export class UserApplication {
    
    private container: Container;
    private server: InversifyExpressServer;
    private serverApp: any;
    private dbUrl: string;

    constructor() {
        this.container = new Container();
        this.dbUrl = 'mongodb://localhost:27017/';
    }

    public async build() {
        this.container.load(UserModule);

        this.container.bind(TYPES.Validator)
            .toConstantValue(new Validator());
        const db = await this.buildDatabase();
        this.container.bind(TYPES.MongoDB).toConstantValue(db);
        this.buildServer();
    }

    private async buildDatabase() {
        return new Promise((resolve, reject) => {
            MongoClient.connect(this.dbUrl, function(err, db) {
                if (err) {
                    return reject(err);
                }
                const dbConnect = db.db('usersTutorial');
                return resolve(dbConnect);
            });
        })
    }

    private buildServer() {
        this.server = new InversifyExpressServer(this.container);
        this.server.setConfig((app) => {
            // add body parser
            app.use(bodyParser.urlencoded({
                extended: true
            }));
            app.use(bodyParser.json());
        });
        
        this.serverApp = this.server.build();
    }

    public start() {
        console.log('Server Start at 3000');
        this.serverApp.listen(3000);
    }
}
