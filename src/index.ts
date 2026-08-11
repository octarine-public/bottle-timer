import "./translations"

import { MenuManager } from "./menu"

new (class CBottleTimer {
	private readonly menu!: MenuManager

	constructor(canBeInitialized: boolean) {
		if (!canBeInitialized) {
			return
		}
		this.menu = new MenuManager()
		EventsSDK.on("Draw", this.Draw.bind(this))
	}

	private get isUIGame() {
		return GameState.UIState === DOTAGameUIState.DOTA_GAME_UI_DOTA_INGAME
	}
	private get isPostGame() {
		return (
			Dota2SDK.GameRules === undefined ||
			Dota2SDK.GameRules.GameState === DOTAGameState.DOTA_GAMERULES_STATE_POST_GAME
		)
	}
	private get shouldDraw() {
		return this.menu.State.value && this.isUIGame && !this.isPostGame
	}
	protected Draw() {
		if (!this.shouldDraw) {
			return
		}
		const entity = InputManager.SelectedUnit
		if (entity === undefined || entity.IsIllusion) {
			return
		}
		const bottle = entity.GetItemByClass(item_bottle)
		if (bottle === undefined || bottle.StoredRune === DOTA_RUNES.DOTA_RUNE_INVALID) {
			return
		}
		const remainingTime = bottle.RuneExpireTime
		if (remainingTime <= 0) {
			return
		}
		const slot = entity.Inventory.GetItemSlot(bottle)
		if (slot === undefined) {
			return
		}
		const position = GUIInfo.GetLowerHUDForUnit(entity).MainInventorySlots[slot],
			text = remainingTime.toFixed(remainingTime < 1 ? 1 : 0)
		RendererSDK.TextByFlags(
			text,
			position,
			Color.White,
			this.menu.TextSize,
			TextFlags.Center,
			600
		)
	}
})(true)
