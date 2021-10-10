import {
  BigNumber,
  BigNumberish,
  CallOverrides,
  constants,
  Contract,
  ContractFactory,
  Overrides,
  providers,
  // utils,
} from "ethers";

import {
  //create2ContractAddressToGodwokenShortAddress,
  deployer,
  ethEoaAddressToGodwokenShortAddress,
  initGWAccountIfNeeded,
  isGodwoken,
  networkSuffix,
  //sleep,
  unit,
} from "./common";

import { TransactionSubmitter } from "./TransactionSubmitter";

import WhitePaperInterestRateModel from "../artifacts/contracts/WhitePaperInterestRateModel.sol/WhitePaperInterestRateModel.json";
import Dai from "../artifacts/contracts/dai.sol/Dai.json";
import ComptrollerG1 from "../artifacts/contracts/ComptrollerG1.sol/ComptrollerG1.json";
//import CEther from "../artifacts/contracts/CEther.sol/CEther.json";
import CErc20Delegator from "../artifacts/contracts/CErc20Delegator.sol/CErc20Delegator.json";
import CErc20Delegate from "../artifacts/contracts/CErc20Delegate.sol/CErc20Delegate.json";

//import { tokens } from "./config";

type TCallStatic = Contract["callStatic"];
type TransactionResponse = providers.TransactionResponse;

// interface IPancakeFactoryStaticMethods extends TCallStatic {
//   getPair(
//     tokenA: string,
//     tokenB: string,
//     overrides?: CallOverrides,
//   ): Promise<string>;
//   INIT_CODE_PAIR_HASH(overrides?: CallOverrides): Promise<string>;
// }

// interface IPancakeFactory extends Contract, IPancakeFactoryStaticMethods {
//   callStatic: IPancakeFactoryStaticMethods;
//   createPair(
//     tokenA: string,
//     tokenB: string,
//     overrides?: Overrides,
//   ): Promise<TransactionResponse>;
// }

interface IMintableTokenStaticMethods extends TCallStatic {
  balanceOf(account: string, overrides?: CallOverrides): Promise<BigNumber>;
}

interface IMintableToken extends Contract, IMintableTokenStaticMethods {
  callStatic: IMintableTokenStaticMethods;
  setMinter(
    minter: string,
    overrides?: Overrides,
  ): Promise<TransactionResponse>;
  approve(
    spender: string,
    amount: BigNumberish,
    overrides?: Overrides,
  ): Promise<TransactionResponse>;
  transfer(
    to: string,
    value: BigNumberish,
    overrides?: Overrides,
  ): Promise<TransactionResponse>;
}

// interface IFaucet extends Contract {
//   mint(
//     tokens: string[],
//     amount: BigNumberish,
//     overrides?: Overrides,
//   ): Promise<TransactionResponse>;
// }
interface ICerc20StaticMethods extends TCallStatic{
  balanceOf(account: string, overrides?: CallOverrides): Promise<BigNumber>;
  exchangeRateCurrent(overrides?: CallOverrides): Promise<number>;
};

interface ICerc20 extends Contract, ICerc20StaticMethods{
  mint(
    amount: BigNumberish,
    overrides?: Overrides,
  ): Promise<TransactionResponse>;
};

interface IComptrollerG1 extends Contract {
  _supportMarket(
    cToken: string,
    overrides?: Overrides,
  ):Promise<TransactionResponse>;
}
// interface IPancakeRouterStaticMethods extends TCallStatic {}

// interface IPancakeRouter extends Contract, IPancakeRouterStaticMethods {
//   callStatic: IPancakeRouterStaticMethods;
//   addLiquidity(
//     tokenA: string,
//     tokenB: string,
//     amountADesired: BigNumberish,
//     amountBDesired: BigNumberish,
//     amountAMin: BigNumberish,
//     amountBMin: BigNumberish,
//     to: string,
//     deadline: number,
//     overrides?: Overrides,
//   ): Promise<TransactionResponse>;
//   addLiquidityETH(
//     token: string,
//     amountTokenDesired: BigNumberish,
//     amountTokenMin: BigNumberish,
//     amountETHMin: BigNumberish,
//     to: string,
//     deadline: number,
//     overrides?: Overrides,
//   ): Promise<TransactionResponse>;
//   removeLiquidity(
//     tokenA: string,
//     tokenB: string,
//     liquidity: BigNumberish,
//     amountAMin: BigNumberish,
//     amountBMin: BigNumberish,
//     to: string,
//     deadline: number,
//     overrides?: Overrides,
//   ): Promise<TransactionResponse>;
//   removeLiquidityETH(
//     token: string,
//     liquidity: BigNumberish,
//     amountTokenMin: BigNumberish,
//     amountETHMin: BigNumberish,
//     to: string,
//     deadline: number,
//     overrides?: Overrides,
//   ): Promise<TransactionResponse>;
//   swapExactTokensForTokens(
//     amountIn: BigNumberish,
//     amountOutMin: BigNumberish,
//     path: string[],
//     to: string,
//     deadline: number,
//     overrides?: Overrides,
//   ): Promise<TransactionResponse>;
// }

// interface IPancakePairStaticMethods extends TCallStatic {
//   getReserves(
//     overrides?: CallOverrides,
//   ): Promise<[BigNumber, BigNumber, number]>;
//   balanceOf(account: string, overrides?: CallOverrides): Promise<BigNumber>;
// }

// interface IPancakePair extends Contract, IPancakePairStaticMethods {
//   callStatic: IPancakePairStaticMethods;
//   mint(to: string, overrides?: Overrides): Promise<TransactionResponse>;
// }

const deployerAddress = deployer.address;

const txOverrides = {
  gasPrice: isGodwoken ? 0 : undefined,
  gasLimit: isGodwoken ? 1_000_000 : undefined,
};

async function main() {
  console.log("Deployer address", deployerAddress);

  await initGWAccountIfNeeded(deployerAddress);

  let deployerRecipientAddress = deployerAddress;
  if (isGodwoken) {
    deployerRecipientAddress =
      ethEoaAddressToGodwokenShortAddress(deployerAddress);
    console.log("Deployer godwoken address:", deployerRecipientAddress);
  }

  const transactionSubmitter = await TransactionSubmitter.newWithHistory(
    `deploy${networkSuffix ? `-${networkSuffix}` : ""}.json`,
  );

  // const deployPancakeFactoryReceipt = await transactionSubmitter.submitAndWait(
  //   `Deploy PancakeFactory`,
  //   () => {
  //     const implementationFactory = new ContractFactory(
  //       PancakeFactory.abi,
  //       PancakeFactory.bytecode,
  //       deployer,
  //     );
  //     const tx = implementationFactory.getDeployTransaction(
  //       deployerRecipientAddress,
  //     );
  //     tx.gasPrice = txOverrides.gasPrice;
  //     tx.gasLimit = txOverrides.gasLimit;
  //     return deployer.sendTransaction(tx);
  //   },
  // );
  //
  // console.log(`    PancakeFactory address:`, pancakeFactoryAddress);
  //  const pancakeFactory = new Contract(
  //    daiAddress,
  //    PancakeFactory.abi,
  //    deployer,
  //  ) //as IPancakeFactory;

  //const tokenSymbols = Object.keys(tokens);
  // const tokenAddresses: string[] = [];
  //  for (const [symbol, name] of Object.entries(tokens)) {
  //    tokenAddresses.push(await deployToken(name, symbol));
  //  }
  // const tokenContracts = tokenAddresses.map((tokenAddress) => {
  //   return new Contract(
  //     tokenAddress,
  //     MintableToken.abi,
  //     deployer,
  //   ) as IMintableToken;
  // });

  // const deployFaucetReceipt = await transactionSubmitter.submitAndWait(
  //   "Deploy Faucet",
  //   () => {
  //     const implementationFactory = new ContractFactory(
  //       Faucet.abi,
  //       Faucet.bytecode,
  //       deployer,
  //     );
  //     const tx = implementationFactory.getDeployTransaction();
  //     tx.gasPrice = txOverrides.gasPrice;
  //     tx.gasLimit = txOverrides.gasLimit;
  //     return deployer.sendTransaction(tx);
  //   },
  // );
  // const faucetAddress = deployFaucetReceipt.contractAddress;
  // console.log(`    Faucet address:`, faucetAddress);
  // const faucet = new Contract(faucetAddress, Faucet.abi, deployer) as IFaucet;

  // for (const [index, token] of tokenContracts.entries()) {
  //   await transactionSubmitter.submitAndWait(
  //     `Set faucet as minter for ${tokenSymbols[index]}`,
  //     () => token.setMinter(faucetAddress, txOverrides),
  //   );
  // }

  // await transactionSubmitter.submitAndWait(
  //   `Mint 10,000 ${tokenSymbols.join(", ")}`,
  //   () =>
  //     faucet.mint(
  //       tokenContracts.map((token) => token.address),
  //       unit(10_000),
  //       txOverrides,
  //     ),
  // );

  // console.log(
  //   `    Balances(${tokenSymbols.join(", ")}):`,
  //   (
  //     await Promise.all(
  //       tokenContracts.map((token) =>
  //         token.callStatic.balanceOf(deployerRecipientAddress),
  //       ),
  //     )
  //   )
  //     .map((bn) => bn.div(constants.WeiPerEther.div(1e9)).toNumber() / 1e9)
  //     .join(", "),
  // );

  //deploy ComptrollerG1
  const deployComptroller = await transactionSubmitter.submitAndWait(
    "Deploy ComptrollerG1 contract without failture",
    () => {
      const implementationComptroller = new ContractFactory(
        ComptrollerG1.abi,
        ComptrollerG1.bytecode,
        deployer,
      );
      const txComptrollerG1 = implementationComptroller.getDeployTransaction();
      txComptrollerG1.gasPrice = txOverrides.gasPrice;
      txComptrollerG1.gasLimit = txOverrides.gasLimit;
      return deployer.sendTransaction(txComptrollerG1)
    },
  );
  const comptrollerAddress = deployComptroller.contractAddress;

  console.log(`    ComptrollerG1 address:`, comptrollerAddress)


  const comptrollerG1Contract = new Contract(
     comptrollerAddress,
     ComptrollerG1.abi,
     deployer,
   ) as IComptrollerG1

  //deploy WPIRM
  const deployWPIRMReceipt = await transactionSubmitter.submitAndWait(
    "Deploy WPIRM contract",
    () => {
      const implementationWPIRM = new ContractFactory(
        WhitePaperInterestRateModel.abi,
        WhitePaperInterestRateModel.bytecode,
        deployer,
      );
      const txWPIRM = implementationWPIRM.getDeployTransaction(0.02e9, 0.15e9);
      txWPIRM.gasPrice = txOverrides.gasPrice;
      txWPIRM.gasLimit = txOverrides.gasLimit;
      return deployer.sendTransaction(txWPIRM);
    },
  );
  const wpirmAddress = deployWPIRMReceipt.contractAddress;

  console.log(`    WPIRM address:`, wpirmAddress)

  // //deploy CEther
  // const deployCetherReceipt = await transactionSubmitter.submitAndWait(
  //   "Deploy CEther",
  //   () => {
  //     const implementationCether = new ContractFactory(
  //       CEther.abi,
  //       CEther.bytecode,
  //       deployer,
  //     );
  //     const txCether = implementationCether.getDeployTransaction(comptrollerAddress, wpirmAddress, 1, "CKB Ether", "ckETH", 9, deployerAddress);
  //     txCether.gasLimit = txOverrides.gasLimit;
  //     txCether.gasPrice = txOverrides.gasPrice;
  //     return deployer.sendTransaction(txCether);
  //   },
  // );
  // const cetherAddress = deployCetherReceipt.contractAddress;

  // console.log(`    CEther address:`, cetherAddress);

  //deploy Dai contract
  const deployDaiReceipt = await transactionSubmitter.submitAndWait(
    "Deploy DAI",
    () => {
      const implementationFactory = new ContractFactory(
        Dai.abi,
        Dai.bytecode,
        deployer,
      );
      const tx = implementationFactory.getDeployTransaction('0xfa309');
      tx.gasPrice = txOverrides.gasPrice;
      tx.gasLimit = txOverrides.gasLimit;
      return deployer.sendTransaction(tx);
    },
  );
  const daiAddress = deployDaiReceipt.contractAddress;

  console.log(`    Dai address:`, daiAddress);
  //console.log(deployDaiReceipt);

  const daiContract = new Contract(
    daiAddress,
    Dai.abi,
    deployer,
  ) as IMintableToken

  //deploy CEcr20Delegate
  const deployCerc20DelegateReceipt = await transactionSubmitter.submitAndWait(
    "Deploy CErc20Delegate without interestRate",
    () => {
      const implementationDelegate = new ContractFactory(
        CErc20Delegate.abi,
        CErc20Delegate.bytecode,
        deployer,
      );
      const txCerc20Delegate = implementationDelegate.getDeployTransaction();
      txCerc20Delegate.gasLimit = txOverrides.gasLimit;
      txCerc20Delegate.gasPrice = txOverrides.gasPrice;
      return deployer.sendTransaction(txCerc20Delegate);
    },
  );
  const cerc20DelegateAddress = deployCerc20DelegateReceipt.contractAddress;

  console.log(`    CErc20Delegate address:`, cerc20DelegateAddress);

  //deploy CErc20Delegator
   const deployCerc20Receipt = await transactionSubmitter.submitAndWait(
     "Deploy CErc20Delegator without insterestRate",
     () => {
       const implementationCerc20 = new ContractFactory(
         CErc20Delegator.abi,
         CErc20Delegator.bytecode,
         deployer,
       );
       const txCerc20 = implementationCerc20.getDeployTransaction(daiAddress, comptrollerAddress, wpirmAddress, 1e9, "CKB Dai", "ckDAI", 9, deployerAddress, cerc20DelegateAddress, "0x");
       txCerc20.gasPrice = txOverrides.gasPrice;
       txCerc20.gasLimit = txOverrides.gasLimit;
       return deployer.sendTransaction(txCerc20);
     },
   );
   const cerc20Address = deployCerc20Receipt.contractAddress;

   console.log(`    CErc20 address:`, cerc20Address);

   const cerc20Contract = new Contract(
       cerc20Address,
       CErc20Delegator.abi,
       deployer,
     ) as ICerc20

  // const deployPancakeRouterReceipt = await transactionSubmitter.submitAndWait(
  //   `Deploy PancakeRouter`,
  //   () => {
  //     const implementationFactory = new ContractFactory(
  //       PancakeRouter.abi,
  //       PancakeRouter.bytecode,
  //       deployer,
  //     );
  //     const tx = implementationFactory.getDeployTransaction(
  //       pancakeFactoryAddress,
  //       wethAddress,
  //     );
  //     tx.gasPrice = txOverrides.gasPrice;
  //     tx.gasLimit = txOverrides.gasLimit;
  //     return deployer.sendTransaction(tx);
  //   },
  // );
  // const pancakeRouterAddress = deployPancakeRouterReceipt.contractAddress;
  // console.log(`    PancakeRouter address:`, pancakeRouterAddress);
  // const pancakeRouter = new Contract(
  //   pancakeRouterAddress,
  //   PancakeRouter.abi,
  //   deployer,
  // ) as IPancakeRouter;

  //Support Market
  const supportMarketReceipent = await transactionSubmitter.submitAndWait(
    `Support market to without failure1 and interestRate:${cerc20Address}`,
    () =>
      comptrollerG1Contract._supportMarket(cerc20Address),
  );
  console.log(supportMarketReceipent);


  //mint some DAI
    await transactionSubmitter.submitAndWait(
        `Mint 10,000 DAI`,
        () =>
          daiContract.mint(
            deployerAddress,
            unit(10_000),
            txOverrides,
          ),
      );
  // check the balance of Dai
    console.log(
    `   Dai balance of deployer:`,
          (await daiContract.callStatic.balanceOf(deployerAddress))
          .div(constants.WeiPerEther.div(1e9))
          .toNumber() / 1e9,
    )
    
  // //check the exchange rate
  // console.log(
  //   `    Exchange Rate:`,
  //   (await cerc20Contract.exchangeRateCurrent()),
    
  // )

  // Aprrove address
  //for (const [index, token] of tokenContracts.entries()) {
  const approveReceipent = await transactionSubmitter.submitAndWait(
    `Approve Dai to without interestRate:${cerc20Address}` ,
    () =>
      daiContract.approve(cerc20Address, constants.MaxUint256, txOverrides),
  );

  console.log(approveReceipent);
  //}


  // Mint CToken
  // const receipent = await transactionSubmitter.submitAndWait(
  //   `Mint 1000 ckDAI with new Comp and inerestRate`,
  //   () =>
  //     cerc20Contract.mint(1000, txOverrides),
  // );
  // console.log(receipent);

  // // Check the balance of ckDAI
  // console.log(
  // `    ckDai balance of deployer:`,
  //       (await cerc20Contract.callStatic.balanceOf(deployerAddress))
  //       .div(constants.WeiPerEther.div(1e9))
  //       .toNumber() / 1e9,
  // )

/*
  if (tokenAddresses.length < 2) {
    throw new Error("require 2 tokens");
  }

  const [tokenAAddress, tokenBAddress, pairSymbol] =
    tokenAddresses[0].toLowerCase() < tokenAddresses[1].toLowerCase()
      ? [
          tokenAddresses[0],
          tokenAddresses[1],
          `${tokenSymbols[0]}-${tokenSymbols[1]}`,
        ]
      : [
          tokenAddresses[1],
          tokenAddresses[0],
          `${tokenSymbols[1]}-${tokenSymbols[0]}`,
        ];

  try {
    await Promise.race([
      sleep(60 * 1000).then(() => {
        throw new Error("timeout");
      }),
      transactionSubmitter.submitAndWait(
        `Add 1000 ${pairSymbol} liquidity`,
        () => {
          return pancakeRouter.addLiquidity(
            tokenAAddress,
            tokenBAddress,
            unit(1000),
            unit(1000),
            unit(1000),
            unit(1000),
            deployerRecipientAddress,
            Math.ceil(Date.now() / 1000) + 60 * 20,
            txOverrides,
          );
        },
      ),
    ]);
  } catch (err) {
    console.log("    Failed:", err.message ?? err);
    console.log(`Trying: Add 1000 ${pairSymbol} liquidity step-by-step`);
    await transactionSubmitter.submitAndWait(
      `Create ${pairSymbol} pair`,
      () => {
        return pancakeFactory.createPair(
          tokenAAddress,
          tokenBAddress,
          txOverrides,
        );
      },
    );
    const pairAddress = await pancakeFactory.callStatic.getPair(
      tokenAAddress,
      tokenBAddress,
    );
    const [tokenA, tokenB] =
      tokenAAddress === tokenAddresses[0]
        ? [tokenContracts[0], tokenContracts[1]]
        : [tokenContracts[1], tokenContracts[0]];
    await transactionSubmitter.submitAndWait(
      `Transfer 1000 ${pairSymbol.split("-")[0]} to pair`,
      () => tokenA.transfer(pairAddress, unit(1000), txOverrides),
    );
    await transactionSubmitter.submitAndWait(
      `Transfer 1000 ${pairSymbol.split("-")[1]} to pair`,
      () => tokenB.transfer(pairAddress, unit(1000), txOverrides),
    );
    const pair = new Contract(
      pairAddress,
      PancakePair.abi,
      deployer,
    ) as IPancakePair;
    await transactionSubmitter.submitAndWait("Mint from pair", () =>
      pair.mint(deployerRecipientAddress, txOverrides),
    );
    console.log(`Done: Add 1000 ${pairSymbol} liquidity step-by-step`);
  }

  const pairAddress = await pancakeFactory.callStatic.getPair(
    tokenAAddress,
    tokenBAddress,
  );
  console.log(`${pairSymbol} pair address:`, pairAddress);

  const initCodeHash = await pancakeFactory.callStatic.INIT_CODE_PAIR_HASH();
  const salt = utils.solidityKeccak256(
    ["address", "address"],
    [tokenAAddress, tokenBAddress],
  );
  let offChainCalculatedPairAddress = utils.getCreate2Address(
    pancakeFactoryAddress,
    salt,
    initCodeHash,
  );
  if (isGodwoken) {
    offChainCalculatedPairAddress =
      create2ContractAddressToGodwokenShortAddress(
        offChainCalculatedPairAddress,
      );
  }
  console.log("    off-chain calculation:", offChainCalculatedPairAddress);

  const pair = new Contract(
    pairAddress,
    PancakePair.abi,
    deployer,
  ) as IPancakePair;
  console.log(
    `${pairSymbol} reserves:`,
    (
      (await pair.callStatic.getReserves()).slice(0, 2) as [
        BigNumber,
        BigNumber,
      ]
    )
      .map((bn) => bn.div(constants.WeiPerEther.div(1e9)).toNumber() / 1e9)
      .join(", "),
  );

  console.log(
    `${pairSymbol} balance:`,
    (await pair.callStatic.balanceOf(deployerRecipientAddress))
      .div(constants.WeiPerEther.div(1e9))
      .toNumber() / 1e9,
  );

*/
  // TODO: addLiquidityETH
  // TODO: swap

  // async function deployToken(name: string, symbol: string) {
  //   const receipt = await transactionSubmitter.submitAndWait(
  //     `Deploy ${symbol}`,
  //     () => {
  //       const implementationFactory = new ContractFactory(
  //         MintableToken.abi,
  //         MintableToken.bytecode,
  //         deployer,
  //       );
  //       const tx = implementationFactory.getDeployTransaction(name, symbol);
  //       tx.gasPrice = txOverrides.gasPrice;
  //       tx.gasLimit = txOverrides.gasLimit;
  //       return deployer.sendTransaction(tx);
  //     },
  //   );
  //   const address = receipt.contractAddress;
  //   console.log(`    ${symbol} address:`, address);
  //   return address;
  // }
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.log("err", err);
    process.exit(1);
  });


