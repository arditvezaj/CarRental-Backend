import * as bcrypt from 'bcrypt';

const saltOrRounds = 10;

export const hashPassword = (password: string): string => {
    return bcrypt.hashSync(password, saltOrRounds);
};

export const checkPassword = (password: string, hash: string): boolean => {
    return bcrypt.compareSync(password, hash);
};

export const fallbackJwtSecret =
    '5183f8cee20681503d2c407ef3d42fb3cfcaa54364031aa5345aea2b875601fc';
