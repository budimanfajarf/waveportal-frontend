import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import "./App.css";
import abi from "./utils/WavePortal.json";

const App = () => {
  const [currentAccount, setCurrentAccount] = useState("");
  const [isWaving, setIsWaving] = useState(false);  

  /**
   * Create a variable here that holds the contract address after you deploy!
   */
  const contractAddress = "0x71AfAc8969b8b6cA76Da79Dbaa7D4180c1ebA359"; 

  /**
   * Create a variable here that references the abi content!
   */
  const contractABI = abi.abi;  

  /*
   * All state property to store all waves
   */
  const [allWaves, setAllWaves] = useState([]);  

  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log("Make sure you have metamask!");
        return;
      } else {
        console.log("We have the ethereum object", ethereum);
      }

      const accounts = await ethereum.request({ method: "eth_accounts" });

      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Found an authorized account:", account);
        setCurrentAccount(account);
        
        console.log("Get all waves of account:", currentAccount);
        await getAllWaves();           
      } else {
        console.log("No authorized account found")
      }
    } catch (error) {
      console.log(error);
    }
  }

  /**
  * Implement your connectWallet method here
  */
  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      const accounts = await ethereum.request({ method: "eth_requestAccounts" });

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error)
    }
  }

  /**
  * Wave function
  */  
  const wave = async () => {
      if (!currentAccount) {
        alert('Connect your wallet first before wave');
        return;
      }
    
      try {
        setIsWaving(true);
        const { ethereum } = window;
  
        if (ethereum) {
          const provider = new ethers.providers.Web3Provider(ethereum);
          const signer = provider.getSigner();
          /**
          * Use contractAddress & contractABI
          */
          const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);
  
          let count = await wavePortalContract.getTotalWaves();
          console.log("Retrieved total wave count...", count.toNumber());

          /*
          * Execute the actual wave from your smart contract
          */
          const waveTxn = await wavePortalContract.wave("???? Hello!")
          console.log("Mining...", waveTxn.hash);
  
          await waveTxn.wait();
          console.log("Mined -- ", waveTxn.hash);
  
          count = await wavePortalContract.getTotalWaves();
          console.log("Retrieved total wave count...", count.toNumber());    
          
          console.log("Get all waves of account:", currentAccount);
          await getAllWaves();          
        } else {
          console.log("Ethereum object doesn't exist!");
        }
      } catch (error) {
        console.log(error);
      } finally {
        setIsWaving(false);        
      }
  }  

  /*
   * Create a method that gets all waves from your contract
   */
  const getAllWaves = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        /*
         * Call the getAllWaves method from your Smart Contract
         */
        const waves = await wavePortalContract.getAllWaves();

        /*
         * We only need address, timestamp, and message in our UI so let's
         * pick those out
         */
        let wavesCleaned = [];
        waves.forEach(wave => {
          wavesCleaned.push({
            address: wave.waver,
            timestamp: new Date(wave.timestamp * 1000),
            message: wave.message
          });
        });

        /*
         * Store our data in React State
         */
        setAllWaves(wavesCleaned);

        console.log("allWaves:", allWaves);         
      } else {
        console.log("Ethereum object doesn't exist!")
      }
    } catch (error) {
      console.log(error);
    }
  }  

  useEffect(() => {
    checkIfWalletIsConnected();
  }, [])

  return (
    <div className="mainContainer">
      <div className="dataContainer">
        <div className="header">
        ???? Hey there!
        </div>

        <div className="bio">
          I am Budi. Connect your Ethereum wallet and wave at me! You have chance to get 0.0001 ETH gift :)
        </div>

        {/*
        * If there is no currentAccount render this button
        */}
        {!currentAccount 
          ? (
              <button className="waveButton" onClick={connectWallet}>
                Connect Wallet
              </button>              
            )
          : (
              <button className="waveButton" disabled>Wallet Connected: {currentAccount}</button>
            )
        }

        <button 
          className="waveButton" 
          onClick={wave}
          disabled={isWaving}
        >
          { 
            isWaving ? 
              'Waving...' : 
              'Wave at Me'
          }
        </button>        

        {allWaves.map((wave, index) => {
          return (
            <div key={index} style={{ backgroundColor: "OldLace", marginTop: "16px", padding: "8px" }}>
              <div>Address: {wave.address}</div>
              <div>Time: {wave.timestamp.toString()}</div>
              <div>Message: {wave.message}</div>
            </div>)
        })}        
      </div>
    </div>
  );
}

export default App