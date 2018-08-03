import { UserApplication } from './Core';

const userApp = new UserApplication();

userApp.build().then(() => {
    userApp.start();
});