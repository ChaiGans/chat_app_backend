import jwt from "jsonwebtoken";

const generateAccessToken = (userId, res) => {
    const token = jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: '15d'
    })

    res.cookie('jwt', token, {
        maxAge : 15 * 24 * 60 * 60 * 1000, //MS
        httpOnly : true, //to prevent XSS
        sameSite: "Strict",
        secure : process.env.NODE_ENV !== "development"
    })
}

export default generateAccessToken