import { injectable, inject } from "inversify";
import { TYPES } from "./Core";
import { User } from "./User";
import { Db } from 'mongodb';

@injectable()
export class UserRepository {

    @inject(TYPES.MongoDB)
    private db: Db;

    public findOne(id): User {
        return this.db.users.find({ _id: id });
    }

    public createOne(user: User) {
        return this.db.users.insert(user);
    }
}