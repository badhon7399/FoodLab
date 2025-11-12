export default function validate(requiredFields = []) {
    return function (req, res, next) {
        for (const field of requiredFields) {
            if (req.body[field] === undefined || req.body[field] === null) {
                return res.status(400).json({ message: `Missing field: ${field}` })
            }
        }
        next()
    }
}
