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

      // Sizin yeni oluşturduğunuz akıllı sözleşme adresiniz
      const contractAddress = "0xE4D8F2347d0B1d6A925B3CF3B8b0BFb0678E51d8"; 

      // Kullanıcının bağlı cüzdan adresini al
      const accounts = await provider.request({ method: 'eth_accounts' });
      const userAddress = accounts[0] || accounts;

      // checkIn(string) fonksiyonu için akıllı sözleşme veri kodu (Data hex)
      // Bu kod kontratınızdaki checkIn fonksiyonunu tetikler
      const checkInFunctionSelector = "0xacbc4b3a"; 
      
      // 0.01 ETH değerinin Hex (onaltılık) karşılığı (0.01 ETH = 10000000000000000 wei)
      const ethAmountInHex = "0x2386f26fc10000"; 

      // Doğrudan cüzdana ETH ödemeli tek bir işlem gönderiyoruz (Approve gerek yok!)
      const txHash = await provider.request({
        method: "eth_sendTransaction",
        params: [{
          from: userAddress,
          to: contractAddress,
          value: ethAmountInHex, // 0.01 ETH kesinti
          data: checkInFunctionSelector // Kontrat fonksiyon çağrısı
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
