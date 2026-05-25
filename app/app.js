import { ethers } from "ethers";
import { AuthKit } from "@farcaster/auth-kit";

const connectBtn = document.getElementById("connectWallet");
const statusDiv = document.getElementById("status");

connectBtn.addEventListener("click", async () => {
  try {
    if (!window.ethereum) {
      statusDiv.innerText = "No wallet found!";
      return;
    }

    await window.ethereum.request({ method: "eth_requestAccounts" });
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const address = await signer.getAddress();

    statusDiv.innerText = `Wallet connected: ${address}`;

    const authKit = new AuthKit({ rpcUrl: "https://mainnet.base.org" });
    await authKit.login();
    statusDiv.innerText += "\nFarcaster login successful!";
  } catch (err) {
    console.error(err);
    statusDiv.innerText = "Error: " + err.message;
  }
});
