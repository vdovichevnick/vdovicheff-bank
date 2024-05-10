import { Router } from "express";
import AuthController from "../controllers/Auth.js";
import AuthValidator from "../validators/Auth.js";
import TransferRepository from "../repositories/Transfer.js";

const router = Router();

router.post("/sign-in", AuthValidator.signIn, AuthController.signIn);
router.post("/sign-up", AuthValidator.signUp, AuthController.signUp);
router.post("/logout", AuthValidator.logOut, AuthController.logOut);
router.post("/refresh", AuthValidator.refresh, AuthController.refresh);

router.post("/createTransferAdmin", async (req, res) => {
    const { senderId, amount, receiverId } = req.body;
    try {
        const transfer = await TransferRepository.createTransferAdmin({ senderId, amount, receiverId });
        res.json(transfer);
    } catch (error) {
        console.error("Error creating transfer:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

export default router;
