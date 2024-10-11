import { SendTransactionRequest, useIsConnectionRestored, useTonConnectModal, useTonConnectUI, useTonWallet } from "@tonconnect/ui-react";
import { Address, beginCell, Cell, toNano } from "@ton/core";
import { getJettonWalletAddress, waitForTx } from "./tonapi";
import { useEffect, useState } from "react";
import { USDT } from "./constants";
import './App.css';
import { MainButton } from "./MainButton";

interface SendTxProps {
    selectedAmount: number | null;
}

export const SendTx = ({ selectedAmount }: SendTxProps) => {
    const wallet = useTonWallet();
    const isRestored = useIsConnectionRestored();
    useTonConnectModal();
    const [tonConnectUi] = useTonConnectUI();
    const [txInProgress, setTxInProgress] = useState<'none' | 'jetton'>('none');

    useEffect(() => {
        console.log("Selected Amount:", selectedAmount);
    }, [selectedAmount]);
    
    useEffect(() => {
        console.log("Wallet:", wallet);
        console.log("Selected Amount:", selectedAmount);
    }, [wallet, selectedAmount]);

    useEffect(() => {
        if (window.Telegram?.WebApp) {
            const mainButton = window.Telegram.WebApp.MainButton;
    
            mainButton.setParams({
                text: "Send $INFT",
                color: "#4b2352",
                text_color: "#FFFFFF",
            });
    
            const handleClick = () => {
                if (txInProgress === 'none') { 
                    console.log("Main button pressed");
                    handleSendTx(); 
                }
            };
    
            mainButton.onClick(handleClick);
    
            return () => {
                mainButton.offClick(handleClick); 
            };
        }
    }, [wallet, selectedAmount, txInProgress]); 
    
    
    const handleSendTx = async () => {
        if (txInProgress !== 'none') {
            console.warn('Transaction already in progress');
            return; 
        }
    
        if (selectedAmount === null || !wallet) {
            console.error('No amount selected or wallet is not connected');
            return;
        }
        console.log(selectedAmount);
        

        setTxInProgress('jetton');
        try {
            const jwAddress = await getJettonWalletAddress(USDT.toRawString(), wallet.account.address);
            const smcAddress = Address.parse("EQC-aSKR5lmgxGjm3S-_abJVT8KCKFtoRbHBc4ucp37wsYUe");
            const decimals = 9;
    
            const innerPayload = beginCell().storeUint(0xfbf0ec9b, 32).endCell();
            const jwPayload = beginCell()
                .storeUint(0xf8a7ea5, 32)
                .storeUint(0, 64)
                .storeCoins(selectedAmount * 10 ** decimals)
                .storeAddress(smcAddress)
                .storeUint(0, 2)
                .storeUint(0, 1)
                .storeCoins(toNano("0.056"))
                .storeBit(1)
                .storeRef(innerPayload)
                .endCell();
    
            const payload = jwPayload.toBoc().toString('base64');
    
            const tx: SendTransactionRequest = {
                validUntil: Math.round(Date.now() / 1000) + 60 * 5,
                messages: [
                    {
                        address: jwAddress.toString(),
                        amount: "91200000",
                        payload
                    }
                ]
            };
    
            const result = await tonConnectUi.sendTransaction(tx, {
                modals: 'all',
                notifications: ['success', 'error']
            });
    
            if (!result || !result.boc) {
                console.error('No result received from transaction request');
                return;
            }
    
            const imMsgCell = Cell.fromBase64(result.boc);
            const inMsgHash = imMsgCell.hash().toString('hex');
    
            try {
                const tx = await waitForTx(inMsgHash);
                console.log(tx);
            } catch (e) {
                console.error('Error waiting for transaction:', e);
            }
        } catch (e) {
            console.error('Error sending transaction:', e);
        } finally {
            setTxInProgress('none');
        }
    };
    
    
    if (!isRestored) {
        return null;
    }
    
    return (
        <MainButton
            text="Send $INFT"
            onClick={handleSendTx}
            color="#4b2352"
            textColor="#FFFFFF"
            disabled={!wallet || selectedAmount === null || txInProgress !== 'none'}
        />
    );
};
