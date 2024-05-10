import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { Forbidden, Unauthorized } from "../utils/Errors.js";

dotenv.config();

class TokenService {
  static async generateAccessToken(payload) {
    return await jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET,{
      expiresIn: "30m",
    }); // создание jwt на основе payload
  }

  static async generateRefreshToken(payload) {
    return await jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET,{
      expiresIn: "7d",
    });
  }

  static async checkAccess(req, _, next) {
    const  authHeader = req.headers.authorization;

    const token = authHeader?.split(" ")?.[1];

    if (!token){
      return next(new Unauthorized());
    }

    try {
      req.user = await TokenService.verifyAccessToken(token);
      console.log("Hello");
      console.log(req.user);
      console.log("Hi");
    } catch (error) {
      console.log(error);
      return next(new Forbidden(error));
    }

    next();
  }

  static async verifyAccessToken(accessToken) {
    console.log("verifyAccessToken-done");
    return await jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
  }

  static async verifyRefreshToken(refreshToken) {
    console.log("refreshAccessToken-done");
    return await jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
  }
}

export default TokenService;
