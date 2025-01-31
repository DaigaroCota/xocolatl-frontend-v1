import { get } from 'svelte/store';
import { maxApproveAmount } from './constants';

import { chainId, signer } from 'svelte-ethers-store';
import { pendingTxs } from './store/store';
import { 
	WETHDepositInputAmountBigNum,
	WETHWithdrawInputAmountBigNum,
	XOCMintInputAmountBigNum,
	XOCRedeemInputAmountBigNum
} from './store/userInput';
import { fetchAllDisplayData } from './contractReads';
import { checkContractCallPrereqs } from './utils';

import type { ContractTransaction  } from 'ethers';
import type { TransactionReceipt } from '@ethersproject/providers';

import { 
	WETHContract,
	XOCContract,
	houseOfCoinContract,
	houseOfReserveContract,
	wrappedHouseOfCoinContract,
	wrappedHouseOfReserveContract
} from './store/contracts';

import { chains } from './chains';

// waits for user transaction and updates store for tx progress UI display
async function handleTxReceipt(tx: ContractTransaction) {
	// add to tx list of pending txs
	pendingTxs.monitor(tx.hash);

	let receipt: TransactionReceipt;
	try {
		receipt = await tx.wait();
		if (receipt.status) {
			pendingTxs.updateStatus(tx.hash, 'completed');
		} else {
			pendingTxs.updateStatus(tx.hash, 'failed');
		}
	} catch (e) {
		pendingTxs.updateStatus(tx.hash, 'failed');
		throw e;
	}

	// fetch new display data
	fetchAllDisplayData();
}

export async function approveWETH() {
	checkContractCallPrereqs();
	const tx = await get(WETHContract)!.approve(chains[get(chainId)].houseOfReserveAddress, maxApproveAmount);
	handleTxReceipt(tx);
}

export async function depositWETH() {
	checkContractCallPrereqs();
	const amount = get(WETHDepositInputAmountBigNum);
	if(amount) {
		const tx = await get(houseOfReserveContract)!.deposit(amount);
		handleTxReceipt(tx);
	} else {
		throw new Error('Invalid WETH deposit amount input');
	}
}

export async function mintXOC() {
	checkContractCallPrereqs();
	const amount = get(XOCMintInputAmountBigNum);
	if (amount) {
		const tx = await get(wrappedHouseOfCoinContract)!.mintCoin(chains[get(chainId)].WETHAddress, chains[get(chainId)].houseOfReserveAddress, amount);
		handleTxReceipt(tx);
	} else {
		throw new Error('Invalid XOC mint amount input');
	}

}

// approve XOC transfers to houseOfCoin for payback
export async function approveXOC() {
	checkContractCallPrereqs();
	const tx = await get(XOCContract)!.approve(chains[get(chainId)].houseOfCoinAddress, maxApproveAmount);
	handleTxReceipt(tx);
}

export async function redeemXOC() {
	checkContractCallPrereqs();
	const amount = get(XOCRedeemInputAmountBigNum);
	if (amount) {
		const tx = await get(houseOfCoinContract)!.paybackCoin(chains[get(chainId)].backedTokenID, amount);
		handleTxReceipt(tx);
	} else {
		throw new Error('Invalid XOC redeem amount input');
	}
}

export async function withdrawWETH() {
	checkContractCallPrereqs();
	const amount = get(WETHWithdrawInputAmountBigNum);
	if (amount) {
		const tx = await get(wrappedHouseOfReserveContract)!.withdraw(amount);
		handleTxReceipt(tx);
	} else {
		throw new Error('Invalid WETH withdraw amount input');
	}
}

export async function depositNativeToken() {
	checkContractCallPrereqs();
	const amount = get(WETHDepositInputAmountBigNum);
	
	if(amount) {
		const tx = await get(signer)!.sendTransaction({to: chains[get(chainId)].houseOfReserveAddress, value: amount});
		handleTxReceipt(tx);
	} else {
		throw new Error('Invalid ETH deposit amount input');
	}
	
}
