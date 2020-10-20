import expressJwt from 'express-jwt';
import config from './config';

const jwt = () => {
    return expressJwt({secret: config.jwtSecret}).unless({
        path: [
            // public routes that don't require authentication
            '/api/auth/login',
            '/api/auth/register',
            '/api/auth/forgot-password',
            '/api/test/district/insert',
            '/api/test/ping',
            '/api/test/zipcode/insert',
            '/api/sendSMS'
        ]
    });
};

export default jwt;
