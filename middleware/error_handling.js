export function validateBodyFields(requiredFields) {
    return function(req, res, next) {
        const missingFields = requiredFields.filter(field => !req.body.hasOwnProperty(field));
        if (missingFields.length > 0) {
            return res.status(400).send(`Missing required fields: ${missingFields.join(', ')}`);
        }
        next();
    };
}