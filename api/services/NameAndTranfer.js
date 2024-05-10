import TransferRepository from '../repositories/Transfer.js';
import UserRepository from '../repositories/User.js';
import { getSavedUserData } from '../saveUser.js';

async function transferProc(amount, receiverId) {
    try {
        const { id, role } = getSavedUserData();

        if (!id || !role) {
            throw new Error("User ID or role not found in memory");
        }

        if (role === 1) {
            // Admin transfer
            console.log("Admin transfer start");
            await TransferRepository.createTransferAdmin({ senderId: id, amount, receiverId });

            // Update receiver's balance
            const receiverBalance = await UserRepository.getUserBalanceById(receiverId);

            if (!receiverBalance) {
                throw new Error("Receiver not found");
            }
            const newBalance = receiverBalance + amount;
            await UserRepository.setUserBalanceById(receiverId, newBalance);
            console.log("Admin transfer End");
        } else if (role === 2) {
            console.log("User transfer start");
            // Regular user transfer
            await TransferRepository.createTransferUser({ senderId: id, amount, receiverId });

            // Update receiver's balance
            const receiverBalance = await UserRepository.getUserBalanceById(receiverId);

            if (!receiverBalance) {
                throw new Error("Receiver not found");
            }
            const receiverNewBalance = receiverBalance + amount;
            await UserRepository.setUserBalanceById(receiverId, receiverNewBalance);

            // Update sender's balance
            const senderBalance = await UserRepository.getUserBalance();


            console.log("Old sender balance " + senderBalance);
            const senderNewBalance = senderBalance - amount;
            console.log("New sender balance " + senderNewBalance);
            await UserRepository.setUserBalance(senderNewBalance);
            console.log("User transfer end");
        } else {
            throw new Error("Invalid user role");
        }
    } catch (error) {
        console.error("Error occurred during transfer:", error.message);
    }
}

export default transferProc;
