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

  // YENİ SAYAÇ FONKSİYONU: Blokzincirden ücretsiz okuma yapar
  const getTotalCheckIns = async () => {
    try {
      const provider = sdk.wallet?.ethProvider;
      if (!provider) return 0;

      // totalCheckIns() fonksiyonunun seçici kodu (Method ID)
      const totalCheckInsSelector = "0x899bc5a4";

      const result = await provider.request({
        method: "eth_call",
        params: [
          {
            to: contractAddress,
            data: totalCheckInsSelector
          },
          "latest"
        ]
      });

      if (result && result !== "0x") {
        return parseInt(result, 16);
      }
      return 0;
    } catch (error) {
      console.error("Failed to fetch global counter:", error);
      return 0;
    }
  };

  const executeCheckIn = async (countryName) => {
    setTxLoading(true);
    try {
      const provider = sdk.wallet?.ethProvider;
      if (!provider) throw new Error("Warpcast wallet provider not found.");

      const accounts = await provider.request({ method: 'eth_accounts' });
      const userAddress = accounts || accounts;

      const transactionData = encodeCheckInData(countryName);
      const ethAmountInHex = "0x9184e72a000"; // 0.00001 ETH

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
      throw error;
    }
  };

  return { executeCheckIn, getTotalCheckIns, txLoading };
}
