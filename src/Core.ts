import { Container, interfaces } from "inversify";
import * as bodyParser from 'body-parser';
import { UserModule } from './UserModule';
import { Validator } from "validator.ts/Validator";
import { MongoClient, Db } from 'mongodb';
import { InversifyExpressServer } from "inversify-express-utils";

export const TYPES = {
    Service: Symbol.for('Service'),
    Repository: Symbol.for('Repository'),
    Controller: Symbol.for('Controller'),
    MongoDB: Symbol.for('MongoDB'),
    Validator: Symbol.for('Validator'),
}

export interface Response<T> {
    status: number,
    body?: T
}

export class UserApplication {
    
    private container: Container;
    private server: InversifyExpressServer;
    private serverApp: any;
    private dbUrl: string;

    constructor() {
        this.container = new Container();
        this.dbUrl = 'mongodb://localhost:27017/';
    }

    public build() {
        this.container.load(UserModule);

        this.container.bind(TYPES.Validator)
            .toConstantValue((context: interfaces.Context) => {
                return new Validator();
        });

    }

    public buildDatabase() {
        this.container.bind(TYPES.MongoDB)
            .toConstantValue((context: interfaces.Context) => {
                MongoClient.connect(this.dbUrl, function(err, db) {
                });
        });
    }

    public buildServer() {
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
        this.serverApp.listen(3000);
    }
}