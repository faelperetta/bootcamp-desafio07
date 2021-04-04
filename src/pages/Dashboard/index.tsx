import React, { useState, useEffect } from 'react';

import income from '../../assets/income.svg';
import outcome from '../../assets/outcome.svg';
import total from '../../assets/total.svg';

import api from '../../services/api';

import Header from '../../components/Header';

import formatValue from '../../utils/formatValue';

import {
    Container,
    CardContainer,
    Card,
    TableContainer,
    MonthContainer,
} from './styles';
import formatDate from '../../utils/formatDate';

interface Transaction {
    id: string;
    description: string;
    value: number;
    formattedValue: string;
    formattedDate: string;
    type: 'INCOME' | 'EXPENSE';
    category: { name: string };
    createdAt: Date;
}

interface Balance {
    totalIncome: number;
    totalExpense: number;
    total: number;
    formattedIncome: string;
    formattedOutcome: string;
    formattedTotal: string;
}

interface Response {
    transactions: Transaction[];
    balance: Balance;
}

const Dashboard: React.FC = () => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [balance, setBalance] = useState<Balance>({} as Balance);
    const [selectedMonthYear, setSelectedMonthYear] = useState<Date>(
        new Date(),
    );

    useEffect(() => {
        async function loadTransactions(): Promise<void> {
            const response = await api.get<Response>('transactions/search', {
                params: {
                    month: selectedMonthYear.getMonth() + 1,
                    year: selectedMonthYear.getFullYear(),
                },
            });
            const {
                balance: loadedBalance,
                transactions: transactionsLoaded,
            } = response.data;

            setTransactions(
                transactionsLoaded.map(transaction => {
                    return {
                        ...transaction,
                        description: transaction.description
                            ? transaction.description
                            : '-',
                        formattedValue:
                            (transaction.type === 'EXPENSE' ? '- ' : '') +
                            formatValue(transaction.value),
                        formattedDate: formatDate(
                            new Date(transaction.createdAt),
                        ),
                    };
                }),
            );

            setBalance({
                ...loadedBalance,
                formattedIncome: formatValue(loadedBalance.totalIncome),
                formattedOutcome: formatValue(loadedBalance.totalExpense),
                formattedTotal: formatValue(loadedBalance.total),
            });
        }

        loadTransactions();
    }, [selectedMonthYear]);

    function nextMonth(): void {
        const newDate: Date = new Date(
            selectedMonthYear.getFullYear(),
            selectedMonthYear.getMonth() + 1,
        );
        setSelectedMonthYear(newDate);
    }

    function previousMonth(): void {
        const newDate: Date = new Date(
            selectedMonthYear.getFullYear(),
            selectedMonthYear.getMonth() - 1,
        );
        setSelectedMonthYear(newDate);
    }

    return (
        <>
            <Header />
            <Container>
                <MonthContainer>
                    <button type="button" onClick={previousMonth}>
                        Previous
                    </button>
                    <h1>
                        {`${selectedMonthYear.toLocaleDateString('pt-BR', {
                            month: 'long',
                        })} - ${selectedMonthYear.getFullYear()}`}
                    </h1>
                    <button type="button" onClick={nextMonth}>
                        Next
                    </button>
                </MonthContainer>
                <CardContainer>
                    <Card>
                        <header>
                            <p>Entradas</p>
                            <img src={income} alt="Income" />
                        </header>
                        <h1 data-testid="balance-income">
                            {balance.formattedIncome}
                        </h1>
                    </Card>
                    <Card>
                        <header>
                            <p>Saídas</p>
                            <img src={outcome} alt="Outcome" />
                        </header>
                        <h1 data-testid="balance-outcome">
                            {balance.formattedOutcome}
                        </h1>
                    </Card>
                    <Card total>
                        <header>
                            <p>Total</p>
                            <img src={total} alt="Total" />
                        </header>
                        <h1 data-testid="balance-total">
                            {balance.formattedTotal}
                        </h1>
                    </Card>
                </CardContainer>

                <TableContainer>
                    <table>
                        <thead>
                            <tr>
                                <th>Título</th>
                                <th>Preço</th>
                                <th>Categoria</th>
                                <th>Data</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.map(transaction => (
                                <tr key={transaction.id}>
                                    <td className="title">
                                        {transaction.description}
                                    </td>
                                    <td className={transaction.type}>
                                        {transaction.formattedValue}
                                    </td>
                                    <td>{transaction.category.name}</td>
                                    <td>{transaction.formattedDate}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </TableContainer>
            </Container>
        </>
    );
};

export default Dashboard;
