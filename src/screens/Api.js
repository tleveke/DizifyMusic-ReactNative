
import ky from 'ky'


export const apipaiafufd = (token) => {
    return ky.extend({
        hooks: {
            beforeRequest: [
                request => {
                    request.headers.set('Authorization', 'Bearer ' + token);
                    request.headers.set('Content-Type', 'application/json');
                }
            ]
        }
    });
}