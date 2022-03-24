import {
    EvmChain,
    AxelarGateway,
    GatewayTx,
    Environment,
  } from "@axelar-network/axelarjs-sdk";
  import { ethers } from "ethers";
  
 console.log("file")
const sendToken = async () => {
    // Initialize the Axelar Gateway
    const provider = new ethers.providers.JsonRpcProvider("https://api.avax-test.network/ext/bc/C/rpc"); // Replace this with your rpc url
  
    const gateway = AxelarGateway.create(
      Environment.DEVNET,
      EvmChain.AVALANCHE,
      provider
    );
  
    // Send a transaction
    const signer = ethers.Wallet.createRandom().connect(provider)
    
    const txOption = {
      maxFeePerGas: "",
      maxPriorityFeePerGas: "",
    }; // Optional, ethers.js will handle transaction fee if not specified.
  
    // Send token to gateway contract
    const unsignedSendTokenTx = await gateway.createSendTokenTx({
      amount: ethers.utils.parseUnits("1", 18).toString(),
      destinationAddress: "0x74Ccd7d9F1F40417C6F7fD1151429a2c44c34e6d",
      destinationChain: EvmChain.MOONBEAM,
      symbol: "UST",
    });
  
    const sendTokenReceipt = await unsignedSendTokenTx.send(signer);
  
    console.log("Send token transaction hash:", sendTokenReceipt.hash);
  
  }

  const invokeSendTokenDirectOnGateway = async () => {
    // Initialize the Axelar Gateway
    const provider = new ethers.providers.JsonRpcProvider("https://api.avax-test.network/ext/bc/C/rpc"); // Replace this with your rpc url
  
    // You can create AxelarGateway's instance by two options:
    // The first option is you know the contract address, so you pass the contract address directly in the constructor function.
    const gateway = AxelarGateway.create(
      Environment.DEVNET,
      EvmChain.AVALANCHE,
      provider
    );
  
    // Send a transaction
    const signer = ethers.Wallet.createRandom().connect(provider)
    const res = await gateway.getContract().connect(signer).sendToken(EvmChain.MOONBEAM, "0x74Ccd7d9F1F40417C6F7fD1151429a2c44c34e6d", "UST", ethers.utils.parseUnits("1", 18).toString())
    console.log("Send token transaction hash:", res);   
  
  }

  sendToken();