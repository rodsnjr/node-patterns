import { inject } from "inversify";
import { controller, httpGet, httpPost } from "inversify-express-utils";
import { TYPES } from "./Core";
import { UserService } from "./UserService";
import { Response, Request } from "express";

@controller('/')
export class UserController { 
    
    constructor(@inject(TYPES.Service) private userService: UserService) {}

    @httpGet('/:id')
    private find(req: Request, res: Response) {
        const response = this.userService.createUser(req.body);
        return res.status(response.status).send(response.body);
    }

    @httpPost('/')
    private create(req: Request, res: Response) {
        const response = this.userService.findUser(req.params.id);
        return res.status(response.status).send(response.body);
    }
}