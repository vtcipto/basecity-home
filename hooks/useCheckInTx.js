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

      // YENİ ALDIĞINIZ KONTRAT ADRESİNİ BURAYA YAZIN
      const contractAddress = "0xBURAYA_YENI_KONTRAT_ADRESINIZI_YAZIN"; 

      const accounts = await provider.request({ method: 'eth_accounts' });
      const userAddress = accounts[0] || accounts;

      const checkInFunctionSelector = "0xacbc4b3a"; 
      
      // 0.00001 ETH değerinin Hex karşılığı (10000000000000 wei)
      const ethAmountInHex = "0x9184e72a000"; 

      // Doğrudan cüzdana 0.00001 ETH ödemeli işlemi gönderiyoruz
      const txHash = await provider.request({
        method: "eth_sendTransaction",
        params: [{
          from: userAddress,
          to: contractAddress,
          value: ethAmountInHex, // Güncellenen miktar
          data: checkInFunctionSelector 
        }]
      });

      setTxLoading(false);
      return txHash;

    } catch (error) {
      setTxLoading(false);
      throw error;
    }
  };

  return { executeCheckIn, txLoading };
}
