<script lang="ts">
import { _ } from 'svelte-i18n';
import { connected } from 'svelte-ethers-store';
import { isRighNetwork, selectedTab } from '../store/store';
import { WETHDepositInputAmountBigNum, XOCRedeemInputAmountBigNum } from '../store/userInput';
import { userWETHAllowance, userXOCAllowance } from '../store/contractData';
import { approveWETH, depositWETH, mintXOC, approveXOC, redeemXOC, withdrawWETH } from '../contractWrites';
	
let disabled=true; // disable buttons until data loads
$: if ($isRighNetwork || !connected) {
	disabled=false;
}
</script>

<style>
button {
	color: var(--light-color);
	background-color: var(--main-color);
	cursor: pointer;
	height: 2rem;
	width: 10rem;
	margin: auto;
	border: none;
	font-size: 1.1rem;
	font-weight: 700;
}

.is-disabled {
	cursor: not-allowed;
}

</style>

{#if $selectedTab === 'deposit'}
	{#if $userWETHAllowance && $WETHDepositInputAmountBigNum && $userWETHAllowance.lt($WETHDepositInputAmountBigNum)}
		<button on:click={approveWETH} type="button" class:is-disabled={disabled} {disabled}>{$_('actions.approve')}</button>
	{:else}
		<button on:click={depositWETH} type="button" class:is-disabled={disabled} {disabled}>{$_('actions.deposit')}</button>
	{/if}
{:else if $selectedTab === 'mint'}
	<button on:click={mintXOC} type="button" {disabled} class:is-disabled={disabled}>{$_('actions.mint')}</button>
{:else if $selectedTab === 'redeem'}
	{#if $userXOCAllowance && $XOCRedeemInputAmountBigNum && $userXOCAllowance.lt($XOCRedeemInputAmountBigNum)}
			<button on:click={approveXOC} type="button" class:is-disabled={disabled} {disabled}>{$_('actions.approve')}</button>
	{:else}
			<button on:click={redeemXOC} type="button" class:is-disabled={disabled} {disabled}>{$_('actions.redeem')}</button>
	{/if}
{:else if $selectedTab === 'withdraw'}
	<button on:click={withdrawWETH} type="button" class:is-disabled={disabled} {disabled}>{$_('actions.withdraw')}</button>
{/if}

