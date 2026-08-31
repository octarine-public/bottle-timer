import "./translations"

import { MenuManager } from "./menu"

new (class CBottleTimer {
	private readonly menu!: MenuManager
	private element: Nullable<HTMLElement>
	private readonly attach = (element: Nullable<HTMLElement | null>) => {
		this.element = element ?? undefined
	}

	constructor(canBeInitialized: boolean) {
		if (!canBeInitialized) {
			return
		}
		this.menu = new MenuManager()
		MenuSDK.RegisterPanel(
			"bottle-timer",
			() => this.Render(),
			MenuSDK.EPanelLayer.Screen
		)
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
		const element = this.element
		if (element === undefined) {
			return
		}
		if (!this.WriteTimer(element)) {
			MenuSDK.WriteShown(element, false)
		}
	}
	private WriteTimer(element: HTMLElement): boolean {
		if (!this.shouldDraw) {
			return false
		}
		const entity = InputManager.SelectedUnit
		if (entity === undefined || entity.IsIllusion) {
			return false
		}
		const bottle = entity.GetItemByClass(item_bottle)
		if (bottle === undefined || bottle.StoredRune === DOTA_RUNES.DOTA_RUNE_INVALID) {
			return false
		}
		const remainingTime = bottle.RuneExpireTime
		if (remainingTime <= 0) {
			return false
		}
		const slot = entity.Inventory.GetItemSlot(bottle)
		if (slot === undefined) {
			return false
		}
		const position = GUIInfo.GetLowerHUDForUnit(entity).MainInventorySlots[slot],
			height = Math.round(position.Height)
		MenuSDK.WritePx(element, "left", Math.round(position.x))
		MenuSDK.WritePx(element, "top", Math.round(position.y))
		MenuSDK.WritePx(element, "width", Math.round(position.Width))
		MenuSDK.WritePx(element, "height", height)
		MenuSDK.WritePx(element, "line-height", height)
		MenuSDK.WritePx(
			element,
			"font-size",
			Math.round(position.Height / this.menu.TextSize + 4)
		)
		MenuSDK.WriteText(element, remainingTime.toFixed(remainingTime < 1 ? 1 : 0))
		MenuSDK.WriteShown(element, true, "block")
		return true
	}
	private Render(): React.ReactNode {
		return React.createElement("div", {
			ref: this.attach,
			style: {
				position: "absolute",
				display: "block",
				visibility: "hidden",
				color: "#ffffff",
				textAlign: "center",
				fontWeight: 600,
				fontEffect: "outline(1px #000000)",
				whiteSpace: "nowrap",
				pointerEvents: "none"
			}
		})
	}
})(true)
