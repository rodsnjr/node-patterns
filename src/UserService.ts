import { injectable, inject } from "inversify";
import { TYPES, Response } from "./Core";
import { Validator } from "validator.ts/Validator";
import { UserRepository } from "./UserRepository";
import { User } from "./User";

@injectable()
export class UserService {

    @inject(TYPES.Validator)
    private validator: Validator;

    @inject(TYPES.Repository)
    private userRepository: UserRepository;

    public findUser(id): Response<User> {
        const user = this.userRepository.findOne(id);
        
        return {
            status: user ? 200 : 404,
            body : user || undefined 
        }
    }

    public createUser(userData: any): Response<User> {
        const user: User = new User();
        user.name = userData.name;
        user.password = userData.password;
        user.email = userData.email;
        user.createDate = new Date();
        
        if (this.validator.isValid(user)) {
            return { 
                status: 201,
                body: this.userRepository.createOne(user)
            };
        }

        return { 
            status: 400
        };
    }
}
