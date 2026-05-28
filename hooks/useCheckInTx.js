import { useState } from 'react';
import sdk from '@farcaster/frame-sdk';
import { Attribution } from 'ox/erc8021'; // Base Builder Code kütüphanesi

export function useCheckInTx() {
  const [txLoading, setTxLoading] = useState(false);

  // base.dev panelindeki "Builder Codes" sekmesinden aldığınız kendi kodunuzu buraya yapıştırın:
  const MY_BUILDER_CODE = "bc_7p67cf9r"

  const encodeCheckInData = (countryName) => {
    const functionSelector = "acbc4b3a";
    const utf8Hex = Array.from(new TextEncoder().encode(countryName))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    const offset = "0000000000000000000000000000000000000000000000000000000000000020";
    const length = (countryName.length).toString(16).padStart(64, '0');
    const paddedData = utf8Hex.padEnd(64, '0');
    
    // Standart akıllı sözleşme verisi oluşturulur
    const baseCalldata = "0x" + functionSelector + offset + length + paddedData;

    // Base ağının tanıması için Builder Kodu (ERC-8021 Suffix) verinin sonuna eklenir
    const dataSuffix = Attribution.toDataSuffix({ codes: [MY_BUILDER_CODE] });
    
    // İki veri birleştirilerek nihai on-chain transaction verisi elde edilir
    return `${baseCalldata}${dataSuffix.slice(2)}`;
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

      // Builder kodu eklenmiş akıllı sözleşme verisi çağrılır
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
