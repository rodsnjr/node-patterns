import { inject } from "inversify";
import { interfaces, controller, httpGet, httpPost, response } from "inversify-express-utils";
import { TYPES } from "./Types";
import { UserService } from "./UserService";
import { Response, Request } from "express";

@controller('/user')
export class UserController implements interfaces.Controller { 
    
    constructor(@inject(TYPES.Service) private userService: UserService) {}

    @httpGet('/')
    private async findAll(req: Request, res: Response) {
        console.log('find All Users');
        const response = await this.userService.findUsers();
        return res.status(response.status).send(response.body);
    }

    @httpGet('/:id')
    private async find(req: Request, res: Response) {
        console.log('find One User');
        const response = await this.userService.findUser(req.params.id);
        return res.status(response.status).send(response.body);
    }

    @httpPost('/')
    private async create(req: Request, res: Response) {
        console.log('Create One User');
        const response = await this.userService.createUser(req.body);
        return res.status(response.status).send(response.body);
    }
}