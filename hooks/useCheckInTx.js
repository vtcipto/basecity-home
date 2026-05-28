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
    setTxLoading(true);
    try {
      const provider = sdk.wallet?.ethProvider;
      if (!provider) {
        throw new Error("Warpcast wallet provider not found.");
      }

      // Bağlı hesabı güvenli bir şekilde al
      const accounts = await provider.request({ method: 'eth_accounts' });
      const userAddress = accounts[0] || accounts;

      const transactionData = encodeCheckInData(countryName);
      const ethAmountInHex = "0x9184e72a000"; // 0.00001 ETH

      // İstek gönderilirken cüzdan standartlarını pürüzsüz tetikle
      const txHash = await provider.request({
        method: "eth_sendTransaction",
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
      setTxLoading(false);
      // Eğer kullanıcı cüzdandan manuel çarpıya basıp iptal ettiyse sessizce bitir
      console.warn("User or wallet closed the transaction:", error);
      throw error;
    }
  };

  return { executeCheckIn, txLoading };
}
