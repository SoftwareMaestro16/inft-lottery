import { THEME, TonConnectUIProvider } from "@tonconnect/ui-react";
import { Header } from "./Header";
import { SendTx } from "./SendTx";
import { useEffect, useState } from "react";
import WebAppSDK from '@twa-dev/sdk';
import './App.css';
import { getJettonBalance } from './tonapi';

declare global {
    interface Window {
        Telegram?: any;
    }
}

function App() {
    const [isTg, setIsTg] = useState<boolean>(false);
    const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
    const [balance, setBalance] = useState<number | null>(null);
    const [address, setAddress] = useState<string | null>(null);
    const jettonAddress = 'EQAEfUNvB01k3khyyMJeQu6Y609TOPtm_-Mn0-12NJb4SXwR';

    useEffect(() => {
        const starsContainer = document.createElement('div');
        starsContainer.className = 'stars';
        document.body.appendChild(starsContainer);

        for (let i = 0; i < 200; i++) {
            const star = document.createElement('div');
            star.className = 'star';

            const size = Math.random() * 3 + 1;
            star.style.width = `${size}px`;
            star.style.height = `${size}px`;

            const delay = Math.random() * 5;
            const duration = Math.random() * 5 + 5;

            star.style.left = `${Math.random() * 180}vw`;
            star.style.top = `-${Math.random() * 10}vh`;

            star.style.animationDuration = `${duration}s`;
            star.style.animationDelay = `${delay}s`;

            starsContainer.appendChild(star);
        }

        return () => {
            document.body.removeChild(starsContainer);
        };
    }, []);

    useEffect(() => {
        const isTgCheck = Boolean(window.Telegram?.WebApp?.initData);

        if (isTgCheck) {
            WebAppSDK.ready();
            WebAppSDK.enableClosingConfirmation();
            WebAppSDK.expand();
            WebAppSDK.headerColor = "#210f24";
            setIsTg(true);
        }
    }, []);

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseFloat(e.target.value);
        if (value >= 2000 && value <= 15000) {
            setSelectedAmount(value);
        }
    };

    const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseFloat(e.target.value);
        setSelectedAmount(value);
    };

    const handleUpdateBalance = async () => {
        if (address) {
            console.log('Fetching balance...');
            try {
                const newBalance = await getJettonBalance(address, jettonAddress);
                console.log('Fetched balance:', newBalance);
                setBalance(newBalance);
            } catch (error) {
                console.error('Error fetching balance:', error);
            }
        } else {
            console.warn('No address available to fetch balance');
        }
    };

    return (
        <>
            {!isTg ? (
                <div className="denied-container">
                    Access denied. Please open in Telegram.
                </div>
            ) : (
                <div className="tg-container">
                    <TonConnectUIProvider
                        manifestUrl="https://ton-connect.github.io/demo-dapp-with-react-ui/tonconnect-manifest.json"
                        uiPreferences={{
                            borderRadius: "m",
                            colorsSet: {
                                [THEME.DARK]: {
                                    connectButton: {
                                        background: "#592c61",
                                    },
                                    accent: "#7c4585",
                                    telegramButton: "#592c61",
                                    background: {
                                        qr: "#ffffff",
                                        tint: "#55325c",
                                        primary: "#2f1b33",
                                        secondary: "#ffffff",
                                        segment: "#81318f",
                                    },
                                    text: {
                                        primary: "#ffffff",
                                        secondary: "#ffffff",
                                    },
                                },
                            },
                        }}
                        actionsConfiguration={{
                            modals: "all",
                            notifications: ["error"],
                            twaReturnUrl: "https://t.me/InfinityLotteryBot/Bet",
                        }}
                    >
                        <Header setBalance={setBalance} setAddress={setAddress} />
                        <SendTx selectedAmount={selectedAmount} />
                    </TonConnectUIProvider>

                    <div className="texts-main">
                        <h1 className="first-t">$INFT Jetton</h1>
                        <h2 className="second-t">Lottery</h2>
                        <input type="number" className="styled-input" value={selectedAmount ?? ''} onChange={handleAmountChange} />
                        <div className="slider-container">
                            <input
                                type="range"
                                className="slider"
                                min="2000"
                                max="15000"
                                step="100"
                                value={selectedAmount ?? 2000}
                                onChange={handleSliderChange}
                            />
                        </div>
                        <div className="styled-input2-container">
                            <input
                                type="text"
                                className="styled-input2"
                                value={`$INFT: ${balance !== null ? balance : '~'}`}
                                readOnly
                            />
                            <button className="update-btn" onClick={handleUpdateBalance}>
                                <img
                                    src="https://static-00.iconduck.com/assets.00/reload-icon-2048x2048-opr7i41w.png"
                                    alt="reload"
                                    style={{ width: '25px', height: '25px' }}
                                />
                            </button>
                        </div>

                        <div className="big-buttons">
                            <button className="button-1" onClick={() => window.open('https://tonviewer.com', '_blank')}>
                                Open Tonviewer
                            </button>
                            <button className="button-2" onClick={() => window.open('https://dedust.io/swap/TON/INFT?amount=1000000000', '_blank')}>
                                Buy $INFT on DeDust
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default App;
