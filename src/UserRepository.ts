import { injectable, inject } from "inversify";
import { TYPES } from "./Types";
import { User } from "./User";
import { Db } from 'mongodb';
import { resolve } from "dns";

@injectable()
export class UserRepository {

    constructor(@inject(TYPES.MongoDB) private db: Db){}

    public async findAll(): Promise<User[]> {
        return new Promise<User[]>((resolve, reject) => {
            this.db.collection('users').find({})
            .toArray((err, result) => {
                if (err) { 
                    return reject(err);
                }
                return resolve(<User[]>result);
            });
        });        
        
    }

    public async findOne(id): Promise<User> {
        return new Promise<User>((resolve, reject) => {
            this.db.collection('users').find({ _id: id })
                .toArray((err, result) => {
                    if (err) {
                        return reject(err);
                    }
                    return resolve(result[0]);
                });
        });
    }

    public createOne(user: User): Promise<User> {
        return new Promise<User>((resolve, reject) => {
            this.db.collection('users').insertOne(user, (err, res) => {
                if (err) {
                    return reject(err);
                }
                return resolve(<User>res.ops[0]);
            });
        });
    }
}