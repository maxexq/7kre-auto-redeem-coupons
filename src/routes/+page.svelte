<script lang="ts">
	import { onMount } from 'svelte';
	import type { Coupon, RedemptionResult } from '$lib/types';
	import { getStatusLabel, getStatusColor } from '$lib/types';

	let uid = $state('');
	let coupons = $state<Coupon[]>([]);
	let redemptionResults = $state<Map<string, RedemptionResult>>(new Map());
	let isRedeeming = $state(false);
	let currentIndex = $state(-1);
	let progress = $state(0);
	let isLoading = $state(true);
	let errorMessage = $state('');

	// Stats
	let totalCodes = $derived(coupons.length);
	let successCount = $derived(
		Array.from(redemptionResults.values()).filter(r => r.status === 'success').length
	);
	let failedCount = $derived(
		Array.from(redemptionResults.values()).filter(r => 
			r.status !== 'success' && r.status !== 'pending' && r.status !== 'redeeming'
		).length
	);

	onMount(async () => {
		await loadCoupons();
	});

	async function loadCoupons() {
		try {
			isLoading = true;
			const response = await fetch('/api/coupons');
			const data = await response.json();
			
			if (data.success) {
				coupons = data.coupons;
				// Initialize all as pending
				redemptionResults = new Map(
					coupons.map(c => [c.code, { code: c.code, status: 'pending', message: 'รอดำเนินการ' }])
				);
			}
		} catch (error) {
			console.error('Failed to load coupons:', error);
			errorMessage = 'ไม่สามารถโหลดรหัสคูปองได้';
		} finally {
			isLoading = false;
		}
	}

	async function seedCoupons() {
		try {
			const response = await fetch('/api/coupons/seed', { method: 'POST' });
			const data = await response.json();
			if (data.success) {
				await loadCoupons();
			}
		} catch (error) {
			console.error('Failed to seed coupons:', error);
		}
	}

	async function redeemAllCoupons() {
		if (!uid.trim()) {
			errorMessage = 'กรุณากรอก UID ของคุณ';
			return;
		}

		if (coupons.length === 0) {
			errorMessage = 'ไม่มีรหัสคูปองในระบบ';
			return;
		}

		errorMessage = '';
		isRedeeming = true;
		currentIndex = 0;
		progress = 0;

		// Reset all to pending first
		redemptionResults = new Map(
			coupons.map(c => [c.code, { code: c.code, status: 'pending', message: 'รอดำเนินการ' }])
		);

		for (let i = 0; i < coupons.length; i++) {
			currentIndex = i;
			const coupon = coupons[i];

			// Set current as redeeming
			redemptionResults.set(coupon.code, {
				code: coupon.code,
				status: 'redeeming',
				message: 'กำลังแลก...'
			});
			redemptionResults = new Map(redemptionResults);

			try {
				const response = await fetch('/api/redeem', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ pid: uid.trim(), couponCode: coupon.code })
				});

				const data = await response.json();
				redemptionResults.set(coupon.code, data.result);
			} catch (error) {
				redemptionResults.set(coupon.code, {
					code: coupon.code,
					status: 'error',
					message: 'การเชื่อมต่อล้มเหลว'
				});
			}

			redemptionResults = new Map(redemptionResults);
			progress = Math.round(((i + 1) / coupons.length) * 100);

			// Small delay between requests to avoid rate limiting
			if (i < coupons.length - 1) {
				await new Promise(resolve => setTimeout(resolve, 500));
			}
		}

		isRedeeming = false;
		currentIndex = -1;
	}

	function cancelRedemption() {
		isRedeeming = false;
		currentIndex = -1;
	}

	async function removeCoupon(code: string) {
		try {
			const response = await fetch('/api/coupons', {
				method: 'DELETE',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ code })
			});

			if (response.ok) {
				coupons = coupons.filter(c => c.code !== code);
				redemptionResults.delete(code);
				redemptionResults = new Map(redemptionResults);
			}
		} catch (error) {
			console.error('Failed to remove coupon:', error);
		}
	}

	function getStatusBadgeStyle(status: RedemptionResult['status']): string {
		const baseStyle = 'padding: 4px 12px; border-radius: 4px; font-size: 12px; font-weight: 500;';
		const color = getStatusColor(status);
		
		if (status === 'success') {
			return `${baseStyle} background: #e8f5e9; color: ${color};`;
		} else if (status === 'already_used') {
			return `${baseStyle} background: #fff3e0; color: ${color};`;
		} else if (status === 'expired' || status === 'invalid') {
			return `${baseStyle} background: #ffebee; color: ${color};`;
		} else if (status === 'redeeming') {
			return `${baseStyle} background: #f3e5f5; color: ${color};`;
		}
		return `${baseStyle} background: #e3f2fd; color: ${color};`;
	}
</script>

<div class="container">
	<!-- Header -->
	<header class="header">
		<div class="logo">
			<span class="gift-icon">🎁</span>
			<h1>Seven Knights Re:BIRTH (GB)</h1>
		</div>
		<h2 class="subtitle">Coupon Redemption</h2>
		<p class="description">แลกคูปองอัตโนมัติได้เลย</p>
	</header>

	<!-- Main Content -->
	<main class="main">
		<!-- UID Input Section -->
		<section class="card">
			<div class="card-header">
				<span class="user-icon">👤</span>
				<h3>ข้อมูลผู้เล่น</h3>
			</div>
			<p class="card-description">กรุณากรอกข้อมูลของคุณเพื่อแลกคูปอง</p>
			
			<div class="input-group">
				<label for="uid">UID</label>
				<input
					type="text"
					id="uid"
					bind:value={uid}
					placeholder="D3271D6EFF524066862F50D894575BA2"
					disabled={isRedeeming}
				/>
			</div>

			{#if errorMessage}
				<div class="error-message">{errorMessage}</div>
			{/if}

			<div class="button-group">
				{#if !isRedeeming}
					<button class="btn-primary" onclick={redeemAllCoupons} disabled={!uid.trim() || isLoading}>
						แลกคูปองทั้งหมด
					</button>
				{:else}
					<button class="btn-cancel" onclick={cancelRedemption}>
						<span class="spinner"></span>
						กำลังแลก... {progress}%
					</button>
				{/if}
				
				<button class="btn-delete" onclick={() => removeCoupon('')} style="visibility: hidden;">
					🗑️
				</button>
			</div>

			<!-- Progress Bar -->
			{#if isRedeeming || progress > 0}
				<div class="progress-container">
					<div class="progress-bar" style="width: {progress}%"></div>
				</div>
			{/if}
		</section>

		<!-- Results Section -->
		<section class="card results-card">
			<div class="card-header">
				<h3>ผลการแลกคูปอง</h3>
			</div>
			<p class="stats">
				โค้ดทั้งหมด: <strong>{totalCodes}</strong> | 
				สำเร็จ: <strong style="color: #4CAF50">{successCount}</strong> | 
				ไม่สำเร็จ: <strong style="color: #f44336">{failedCount}</strong>
			</p>

			{#if isLoading}
				<div class="loading">
					<span class="spinner large"></span>
					<p>กำลังโหลดรหัสคูปอง...</p>
				</div>
			{:else if coupons.length === 0}
				<div class="empty-state">
					<p>ยังไม่มีรหัสคูปองในระบบ</p>
					<button class="btn-secondary" onclick={seedCoupons}>
						เพิ่มรหัสคูปองเริ่มต้น
					</button>
				</div>
			{:else}
				<div class="coupon-list">
					{#each coupons as coupon, index}
						{@const result = redemptionResults.get(coupon.code)}
						<div class="coupon-item" class:active={index === currentIndex}>
							<div class="coupon-info">
								<span class="coupon-code">{coupon.code}</span>
								{#if result}
									<span class="coupon-message">{result.message}</span>
								{/if}
							</div>
							<div class="coupon-actions">
								{#if result}
									<span class="status-badge" style={getStatusBadgeStyle(result.status)}>
										{getStatusLabel(result.status)}
									</span>
								{/if}
								{#if !isRedeeming}
									<button 
										class="btn-icon" 
										onclick={() => removeCoupon(coupon.code)}
										title="ลบคูปอง"
									>
										🗑️
									</button>
								{/if}
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</section>
	</main>

	<!-- Footer -->
	<footer class="footer">
		<p>Copyright © Netmarble Corp. All Rights Reserved</p>
		<p class="note">* Auto-redemption tool for Seven Knights Re:BIRTH</p>
	</footer>
</div>

<style>
	.container {
		max-width: 600px;
		margin: 0 auto;
		padding: 20px;
		min-height: 100vh;
	}

	/* Header Styles */
	.header {
		text-align: center;
		padding: 30px 0;
	}

	.logo {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 10px;
		margin-bottom: 10px;
	}

	.gift-icon {
		font-size: 32px;
	}

	.header h1 {
		font-size: 24px;
		font-weight: 700;
		color: #333;
	}

	.subtitle {
		font-size: 20px;
		color: #e53935;
		font-weight: 600;
		margin-bottom: 8px;
	}

	.description {
		color: #e57373;
		font-size: 14px;
	}

	/* Card Styles */
	.card {
		background: white;
		border-radius: 12px;
		padding: 24px;
		margin-bottom: 20px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
	}

	.card-header {
		display: flex;
		align-items: center;
		gap: 8px;
		margin-bottom: 8px;
	}

	.card-header h3 {
		font-size: 16px;
		font-weight: 600;
		color: #e53935;
	}

	.user-icon {
		font-size: 20px;
	}

	.card-description {
		font-size: 13px;
		color: #e57373;
		margin-bottom: 20px;
	}

	/* Input Styles */
	.input-group {
		margin-bottom: 16px;
	}

	.input-group label {
		display: block;
		font-size: 14px;
		font-weight: 500;
		color: #333;
		margin-bottom: 8px;
	}

	.input-group input {
		width: 100%;
		padding: 14px 16px;
		font-size: 14px;
		border: 1px solid #e0e0e0;
		border-radius: 8px;
		outline: none;
		transition: border-color 0.2s, box-shadow 0.2s;
	}

	.input-group input:focus {
		border-color: #e53935;
		box-shadow: 0 0 0 3px rgba(229, 57, 53, 0.1);
	}

	.input-group input:disabled {
		background: #f5f5f5;
		cursor: not-allowed;
	}

	/* Button Styles */
	.button-group {
		display: flex;
		gap: 10px;
		align-items: center;
	}

	.btn-primary {
		flex: 1;
		padding: 14px 24px;
		font-size: 16px;
		font-weight: 600;
		color: white;
		background: linear-gradient(135deg, #66bb6a 0%, #43a047 100%);
		border: none;
		border-radius: 8px;
		transition: transform 0.2s, box-shadow 0.2s;
	}

	.btn-primary:hover:not(:disabled) {
		transform: translateY(-1px);
		box-shadow: 0 4px 12px rgba(67, 160, 71, 0.3);
	}

	.btn-primary:disabled {
		background: #bdbdbd;
		cursor: not-allowed;
	}

	.btn-cancel {
		flex: 1;
		padding: 14px 24px;
		font-size: 16px;
		font-weight: 600;
		color: white;
		background: linear-gradient(135deg, #ef5350 0%, #e53935 100%);
		border: none;
		border-radius: 8px;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
	}

	.btn-secondary {
		padding: 12px 24px;
		font-size: 14px;
		font-weight: 500;
		color: #e53935;
		background: white;
		border: 2px solid #e53935;
		border-radius: 8px;
		transition: background 0.2s;
	}

	.btn-secondary:hover {
		background: #ffebee;
	}

	.btn-delete {
		padding: 14px;
		font-size: 18px;
		background: #ffebee;
		border: none;
		border-radius: 8px;
		transition: background 0.2s;
	}

	.btn-delete:hover {
		background: #ffcdd2;
	}

	.btn-icon {
		padding: 8px;
		font-size: 16px;
		background: transparent;
		border: none;
		border-radius: 4px;
		opacity: 0.6;
		transition: opacity 0.2s, background 0.2s;
	}

	.btn-icon:hover {
		opacity: 1;
		background: #ffebee;
	}

	/* Progress Bar */
	.progress-container {
		margin-top: 16px;
		height: 8px;
		background: #e0e0e0;
		border-radius: 4px;
		overflow: hidden;
	}

	.progress-bar {
		height: 100%;
		background: linear-gradient(90deg, #66bb6a 0%, #43a047 100%);
		border-radius: 4px;
		transition: width 0.3s ease;
	}

	/* Results Section */
	.results-card {
		background: #fffbf0;
	}

	.stats {
		font-size: 13px;
		color: #666;
		margin-bottom: 16px;
	}

	.coupon-list {
		display: flex;
		flex-direction: column;
		gap: 8px;
		max-height: 400px;
		overflow-y: auto;
	}

	.coupon-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 12px 16px;
		background: white;
		border-radius: 8px;
		border: 1px solid #eee;
		transition: border-color 0.2s, box-shadow 0.2s;
	}

	.coupon-item.active {
		border-color: #e53935;
		box-shadow: 0 0 0 2px rgba(229, 57, 53, 0.2);
	}

	.coupon-info {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.coupon-code {
		font-size: 14px;
		font-weight: 600;
		color: #333;
		font-family: 'Consolas', 'Monaco', monospace;
	}

	.coupon-message {
		font-size: 12px;
		color: #999;
	}

	.coupon-actions {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.status-badge {
		white-space: nowrap;
	}

	/* Loading & Empty States */
	.loading, .empty-state {
		text-align: center;
		padding: 40px 20px;
		color: #999;
	}

	.empty-state p {
		margin-bottom: 16px;
	}

	/* Spinner */
	.spinner {
		display: inline-block;
		width: 16px;
		height: 16px;
		border: 2px solid rgba(255, 255, 255, 0.3);
		border-top-color: white;
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
	}

	.spinner.large {
		width: 32px;
		height: 32px;
		border-width: 3px;
		border-color: rgba(229, 57, 53, 0.3);
		border-top-color: #e53935;
		margin-bottom: 12px;
	}

	@keyframes spin {
		to { transform: rotate(360deg); }
	}

	/* Error Message */
	.error-message {
		padding: 12px 16px;
		background: #ffebee;
		color: #c62828;
		border-radius: 8px;
		font-size: 14px;
		margin-bottom: 16px;
	}

	/* Footer */
	.footer {
		text-align: center;
		padding: 30px 0;
		color: #999;
		font-size: 12px;
	}

	.footer .note {
		margin-top: 4px;
		font-style: italic;
	}

	/* Scrollbar */
	.coupon-list::-webkit-scrollbar {
		width: 6px;
	}

	.coupon-list::-webkit-scrollbar-track {
		background: #f0f0f0;
		border-radius: 3px;
	}

	.coupon-list::-webkit-scrollbar-thumb {
		background: #ccc;
		border-radius: 3px;
	}

	.coupon-list::-webkit-scrollbar-thumb:hover {
		background: #bbb;
	}
</style>

