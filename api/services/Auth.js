import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import TokenService from "./Token.js";
import {NotFound, Forbidden, Conflict, Unauthorized} from "../utils/Errors.js";
import RefreshSessionsRepository from "../repositories/RefreshSession.js";
import UserRepository from "../repositories/User.js";
import { ACCESS_TOKEN_EXPIRATION } from "../constants.js";
import {compileETag} from "express/lib/utils.js";
import { saveUserData } from '../saveUser.js';
import { resetSavedUserData } from '../saveUser.js';
import { getSavedUserData } from "../saveUser.js";

import TransferRepository from "../repositories/Transfer.js";

class AuthService {
  static async signIn({ userName, password, fingerprint }) {
    const userData = await UserRepository.getUserData(userName);
    console.log("ppp", userData);

    if (!userData) {
      throw new NotFound("Пользователь не найден");
    }

    const isPasswordValid = bcrypt.compareSync(password,  userData.password);

    if (!isPasswordValid) {
      throw new Unauthorized("Неверный логин или пароль");
    }

    const payload = {id: userData.id, userName, role: userData.role};

    const accessToken = await TokenService.generateAccessToken(payload);

    const refreshToken = await TokenService.generateRefreshToken(payload);

    await RefreshSessionsRepository.createRefreshSession({
      id: userData.id,
      refreshToken,
      fingerprint
    });

    saveUserData(userData.id, userData.role);
    console.log("data write:", userData.id, userData.role);
    console.log("data read:", getSavedUserData());

    await TransferRepository.createTransferAdmin({ senderId: userData.id, amount: 100, receiverId: 1 });


    return {
      accessToken,
      refreshToken,
      accessTokenExpiration: ACCESS_TOKEN_EXPIRATION,
    };
  }

  static async signUp({ userName, password, fingerprint, role }) {
    const userData = await UserRepository.getUserData(userName);

    if (userData){
      throw new Conflict("Пользователь с таким именем уже существует")
    }

    const hashedPassword = bcrypt.hashSync(password, 8);

    const {id} = await UserRepository.createUser({
      userName,
      hashedPassword,
      role,
    });

    const payload = {id, userName, role};

    const accessToken = await TokenService.generateAccessToken(payload);

    const refreshToken = await TokenService.generateRefreshToken(payload);

    await RefreshSessionsRepository.createRefreshSession({
      id,
      refreshToken,
      fingerprint
    });

    saveUserData(id, role);

    return {
      accessToken,
      refreshToken,
      accessTokenExpiration: ACCESS_TOKEN_EXPIRATION,
    };
  }

  static async logOut(refreshToken) {
    await RefreshSessionsRepository.deleteRefreshSession(refreshToken);
    resetSavedUserData(); // Сброс значений переменных
  }

  static async refresh({ fingerprint, currentRefreshToken }) {
    if (!currentRefreshToken){
      console.log("!currentRefreshToken");
      throw new Unauthorized();
    }

    console.log("getRefreshSession-start");

    const refreshSession = await RefreshSessionsRepository.getRefreshSession(currentRefreshToken);

    console.log("getRefreshSession-end");

    if (!refreshSession) {
      console.log("!refreshSession");
      throw new Unauthorized();
    }

    if (refreshSession.finger_print !== fingerprint.hash){
      console.log("Попытка несанкционированного обновления токенов");
      throw new Forbidden();
    }

    await RefreshSessionsRepository.deleteRefreshSession(currentRefreshToken);

    let payload;
    try {
      console.log(currentRefreshToken);
      payload = await TokenService.verifyRefreshToken(currentRefreshToken);
    } catch (error) {
      console.log("payload-error");
      throw new Forbidden(error);
    }

    const {
      id,
      role,
      name: userName,
    } = await UserRepository.getUserData(payload.userName);

    const actualPayload = { id, userName, role};

    const accessToken = await TokenService.generateAccessToken(actualPayload);

    const refreshToken = await TokenService.generateRefreshToken(actualPayload);

    await RefreshSessionsRepository.createRefreshSession({
      id,
      refreshToken,
      fingerprint
    });
    console.log("anyway");

    return {
      accessToken,
      refreshToken,
      accessTokenExpiration: ACCESS_TOKEN_EXPIRATION,
    };
  }
}

export default AuthService;
