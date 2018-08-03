import { injectable, inject } from "inversify";
import { TYPES, Response } from "./Types";
import { Validator } from "validator.ts/Validator";
import { UserRepository } from "./UserRepository";
import { User } from "./User";

@injectable()
export class UserService {

    @inject(TYPES.Validator)
    private validator: Validator;

    @inject(TYPES.Repository)
    private userRepository: UserRepository;

    public async findUser(id): Promise<Response<User>> {
        const user = await this.userRepository.findOne(id);
        
        return {
            status: user ? 200 : 404,
            body : user || undefined 
        }
    }

    public async findUsers(): Promise<Response<User[]>> {
        const users = await this.userRepository.findAll();

        return {
            status: users ? 200 : 400,
            body: users || undefined
        }
    }

    public async createUser(userData: any): Promise<Response<User>> {
        const user: User = new User();

        user.name = userData.name;
        user.password = userData.password;
        user.email = userData.email;
        user.createDate = new Date().toDateString();
            
        if (this.validator.isValid(user, { skipMissingProperties: true })) {
            const createdUser = await this.userRepository.createOne(user);
            return { 
                status: 201,
                body: createdUser
            };
        }

        return { 
            status: 400
        };
    }
}
