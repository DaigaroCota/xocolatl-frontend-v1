import { get } from 'svelte/store';
import { defaultEvmStores, connected, provider } from 'svelte-ethers-store';
import { providers } from 'ethers';
import WalletConnectProvider from '@walletconnect/web3-provider';

import {Provider} from '@ethersproject/providers';

import { isRighNetwork } from './store/store';
import { resetAll } from './store/contractData';
import { fetchAllDisplayData } from './contractReads';

// input: 0x50c57894c3b9bf022d10b94b9d940a48a93cd8c0
// output: 0x50...d8c0
export function toShortAddress(address: string): string {
	if(address) {
		return address.slice(0,4) + '...' + address.slice(-4);
	} else return '';
}

export function checkContractCallPrereqs() {
	if(!get(connected)) {
		throw 'Wallet is not connected!';
	} 

	if(!get(isRighNetwork)) {
		throw 'Wallet is connected to the wrong network!';
	} 
}

export function handleProviderChange() {
	resetAll();
	fetchAllDisplayData();
}

// custom svelte directive, usage <Component use:clickOutside={handleClick} />
export function clickOutside(node: HTMLElement, onEventFunction: ()=>void) {
	const handleClick = (event: Event) => {
		const path = event.composedPath();
		if (!path.includes(node)) {
			onEventFunction();
		}
	};
	document.addEventListener('click', handleClick);
	return {
		destroy() {
			document.removeEventListener('click', handleClick);
		}
	};
}

// prompt user to change network via metamask
export async function changeNetwork(chainId: string) {
	// wallet connect does not support prompting to switch networks
	// if (get(providerType) !== "walletconnect") {
	// @ts-ignore:next-line
	await get(provider).provider.request({ method: 'wallet_switchEthereumChain', params:[{chainId}]});
	// }
}


export async function handleWalletConnectProvider() {
	//  Enable session (triggers QR Code modal)
	const wcProvider = new WalletConnectProvider({
		rpc: {
			4: 'https://rinkeby.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161',
			137: 'https://polygon-rpc.com/',
			// ...
		},
	});
	//  Enable session (triggers QR Code modal)
	await wcProvider.enable();
	
	//  Wrap with Web3Provider from ethers.js
	const web3Provider = new providers.Web3Provider(wcProvider);
	await defaultEvmStores.setProvider(web3Provider.provider as Provider);
}


// connects automatically to wallet if returning user
export async function checkIfAlreadyConnected() {
	const lastProvider = localStorage.getItem('providerType');
	if (lastProvider === 'metamask') {
		//@ts-ignore:next-line
		if(window.ethereum) {
			//@ts-ignore:next-line
			const provider = new providers.Web3Provider(window.ethereum);
			const accounts = await provider.listAccounts();
			if (accounts[0]) {
				defaultEvmStores.setProvider();
			} 		
		}
	} else if (lastProvider === 'walletconnect') {
		handleWalletConnectProvider();
	}
}
