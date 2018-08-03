import { ContainerModule, interfaces } from 'inversify';
import { TYPES } from './Types';
import { UserService } from './UserService';
import { UserRepository } from './UserRepository';

export const UserModule = new ContainerModule((bind: interfaces.Bind, unbind: interfaces.Unbind) => {
    bind<UserRepository>(TYPES.Repository).to(UserRepository);
    bind<UserService>(TYPES.Service).to(UserService);
});
