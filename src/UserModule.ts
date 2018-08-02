import { ContainerModule, interfaces } from 'inversify';
import { TYPES } from './Core';
import { UserController } from './UserController';
import { UserService } from './UserService';
import { UserRepository } from './UserRepository';

export const UserModule = new ContainerModule((bind: interfaces.Bind, unbind: interfaces.Unbind) => {
    bind<UserRepository>(TYPES.Repository).to(UserRepository);
    bind<UserService>(TYPES.Service).to(UserService);
    bind<UserController>(TYPES.Controller).to(UserController);
});
