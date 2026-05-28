import { useState } from 'react';
import sdk from '@farcaster/frame-sdk';

export function useCheckInTx() {
  const [txLoading, setTxLoading] = useState(false);

  const encodeCheckInData = (countryName) => {
    const functionSelector = "acbc4b3a";
    const utf8Hex = Array.from(new TextEncoder().encode(countryName))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    const offset = "0000000000000000000000000000000000000000000000000000000000000020";
    const length = (countryName.length).toString(16).padStart(64, '0');
    const paddedData = utf8Hex.padEnd(64, '0');
    return "0x" + functionSelector + offset + length + paddedData;
  };

  const contractAddress = "0xdA9089321C252dA5B0ed2F51d175703dc45E042f";

  const executeCheckIn = async (countryName) => {
    // --- GÜVENLİK KİLİDİ: Eğer zaten bir işlem onay bekliyorsa yenisini başlatma ---
    if (txLoading) return null;
    
    setTxLoading(true);
    try {
      const provider = sdk.wallet?.ethProvider;
      if (!provider) {
        throw new Error("Warpcast wallet provider not found.");
      }

      const accounts = await provider.request({ method: 'eth_accounts' });
      const userAddress = accounts || accounts;

      const transactionData = encodeCheckInData(countryName);
      const ethAmountInHex = "0x9184e72a000"; // 0.00001 ETH

      // Cüzdan isteğini gönder
      const txHash = await provider.request({
        method: "0x" + "eth_sendTransaction".replace("0x", ""), // EIP-1193 temiz çağırma metodu
        params: [{
          from: userAddress,
          to: contractAddress,
          value: ethAmountInHex,
          data: transactionData
        }]
      });

      setTxLoading(false);
      return txHash;

    } catch (error) {
      setTxLoading(false); // Kullanıcı reddederse kilidi kaldır
      throw error;
    }
  };

  return { executeCheckIn, txLoading };
}
