import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import Fingerprint from "express-fingerprint";
import AuthRootRouter from "./routers/Auth.js";
import TokenService from "./services/Token.js";
import cookieParser from "cookie-parser";
import UserRepository from "./repositories/User.js"; // Импортируем UserRepository
import { getSavedUserData } from "./saveUser.js";
import transferProc from "./services/NameAndTranfer.js";

dotenv.config();

const PORT = process.env.PORT || 5001;

const app = express();

app.use(cookieParser());
app.use(express.json());
app.use(cors({ credentials: true, origin: process.env.CLIENT_URL }));

app.use(
  Fingerprint({
    parameters: [Fingerprint.useragent, Fingerprint.acceptHeaders],
  })
);

app.use("/auth", AuthRootRouter);

app.get("/resource/protected", TokenService.checkAccess, (_, res) => {
    return res.status(200).json("Welcome!" + Date.now());
});

app.get("/resource/balance", TokenService.checkAccess, async (_, res) => {
    try {
        const balance = await UserRepository.getUserBalance(); // Получаем баланс пользователя
        const userData = getSavedUserData();
        const responseData = {
            id: userData.id,
            balance: balance
        };
        return res.status(200).json(responseData); // Возвращаем объект JSON с информацией о пользователе и его балансе
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

app.get("/resource/transfer", TokenService.checkAccess, async (_, res) => {
    await transferProc(1000, 1);
    try {
        //const balance = await UserRepository.setUserBalance(5000);
        const balance = await UserRepository.getUserBalance(); // Получаем баланс пользователя
        const userData = getSavedUserData();
        const responseData = {
            id: userData.id,
            balance: balance
        };
        return res.status(200).json(responseData); // Возвращаем объект JSON с информацией о пользователе и его балансе
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

app.post("/resource/transferNew", TokenService.checkAccess, async (req, res) => {
    const { id, amount } = req.body;

    // Вызов функции transferProc с переданными id и amount
    await transferProc(amount, id);

    try {
        // Получаем баланс пользователя
        const balance = await UserRepository.getUserBalance();

        // Получаем данные пользователя
        const userData = getSavedUserData();

        // Формируем объект с информацией о пользователе и его балансе
        const responseData = {
            id: userData.id,
            balance: balance
        };

        // Возвращаем объект JSON с информацией о пользователе и его балансе
        return res.status(200).json(responseData);
    } catch (error) {
        // В случае ошибки возвращаем статус 500 и сообщение об ошибке
        return res.status(500).json({ error: error.message });
    }
});



app.listen(PORT, () => {
  console.log("Сервер успешно запущен");
});
