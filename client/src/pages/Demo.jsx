import { useContext, useState, useEffect } from "react";
import style from "./style.module.scss";
import { AuthContext } from "../context/AuthContext";
import Button from "../components/Button/Button";

export default function Demo() {
    const { data, handleLogOut, handleFetchProtected, handleTransferNew } = useContext(AuthContext);
    const [transactionId, setTransactionId] = useState("");
    const [transactionAmount, setTransactionAmount] = useState("");
    const [showForm, setShowForm] = useState(false);

    useEffect(() => {
        // Вызываем handleFetchProtected при монтировании компонента
        handleFetchProtected();
    }, []);

    const handleFormSubmit = (e) => {
        e.preventDefault();
        const amount = parseInt(transactionAmount);
        const id = parseInt(transactionId);
        if (isNaN(amount) || isNaN(id) || amount <= 0 || id <= 0) {
            // Проверка на валидность введенных данных
            alert("Введите корректные значения для ID получателя и суммы транзакции.");
            return;
        }

        if (amount > data?.balance) {
            // Проверка на то, что сумма транзакции не превышает текущий баланс
            alert("Сумма транзакции не может превышать текущий баланс.");
            return;
        }
        handleTransferNew(id, amount);
        setShowForm(false);
    };

    return (

        <div className={style.wrapper}>
            <h1 style={{
                fontFamily: "Orbitron, sans-serif",
                textAlign: "center",
                fontSize: "2rem",
                fontWeight: "bold"
            }}>Vdovicheff Bank</h1>


            <Button onClick={handleFetchProtected}>
                Обновить страницу
            </Button>
            <div>
            <p>Your ID is: {data?.id}</p>
                <p>Balance: {data?.balance}</p>
            </div>
            <Button onClick={() => setShowForm(true)}>
                Выполнить транзакцию
            </Button>
            {showForm && (
                <div className={style.modal}>
                    <div className={style.modalContent}>
                        <form onSubmit={handleFormSubmit}>
                            <input
                                type="number"
                                placeholder="ID пользователя"
                                value={transactionId}
                                onChange={(e) => setTransactionId(e.target.value)}
                            />
                            <input
                                type="number"
                                placeholder="Сумма перевода"
                                value={transactionAmount}
                                onChange={(e) => setTransactionAmount(e.target.value)}
                            />
                            <Button type="submit">
                                Перевести средства
                            </Button>
                            <Button onClick={() => setShowForm(false)}>
                                Отменить
                            </Button>
                        </form>
                    </div>
                </div>
            )}
            <Button onClick={handleLogOut}>
                Выйти из аккаунта
            </Button>
        </div>
    );
}
