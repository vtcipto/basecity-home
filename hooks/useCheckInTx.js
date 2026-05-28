import { useState } from 'react';
import sdk from '@farcaster/frame-sdk';

export function useCheckInTx() {
  const [txLoading, setTxLoading] = useState(false);

  const executeCheckIn = async (countryName) => {
    setTxLoading(true);
    try {
      const provider = sdk.wallet?.ethProvider;
      if (!provider) {
        throw new Error("Warpcast wallet provider not found.");
      }

      // Base Ağı USDC ve Test Amaçlı Mock Kontrat Bilgileri
      const usdcAddress = "0x833589fCD6eDb6E08f4c7C32D4f71b54bda02913"; 
      const contractAddress = "0x0000000000000000000000000000000000000000"; // İleride gerçek kontrat gelecek

      // Kullanıcının bağlı cüzdan adresini al
      const accounts = await provider.request({ method: 'eth_accounts' });
      const userAddress = accounts[0] || accounts;

      // 0.01 USDC (10000 birim) harcama onayı (approve) verisi
      const approveData = "0x095ea7b3" + 
        contractAddress.substring(2).padStart(64, '0') + 
        "0000000000000000000000000000000000000000000000000000000000002710";

      // Cüzdana ilk işlem onayını gönder (USDC Approve)
      await provider.request({
        method: "eth_sendTransaction",
        params: [{
          from: userAddress,
          to: usdcAddress,
          data: approveData
        }]
      });

      alert("USDC Approved! Checking in now...");
      
      // Şimdilik test için sahte bir tx hash döndürüyoruz
      const mockTxHash = "0xmocktxhash_" + Date.now(); 

      setTxLoading(false);
      return mockTxHash;

    } catch (error) {
      setTxLoading(false);
      throw error;
    }
  };

  return { executeCheckIn, txLoading };
}
