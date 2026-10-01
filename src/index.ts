import "./translations"

import { MenuManager } from "./menu"

/** Semi-bold, like the game's own timer. */
const FONT_WEIGHT = 600

/** The game's face `family` from its install, or nothing where the host cannot load it. */
function loadFont(family: string, file: string): Nullable<string> {
	return typeof LoadFont === "function" && LoadFont(file, false, FONT_WEIGHT)
		? family
		: undefined
}

/**
 * `font-family: monospaceNumbersFont` in the game: RadianceM, whose ten digits are all one width.
 * Radiance's own are not - its 0 runs a tenth of an em wider than its 1 - and a centred reading
 * shuffled sideways on every tick. The face carries the digits and nothing else, so the point of a
 * reading under a second comes from the menu's fallback. Radiance where the install has no cut of
 * it, and the menu's own face where it has neither.
 */
const FONT_FAMILY =
	loadFont("RadianceM", "panorama/fonts/radiancem-semibold.otf") ??
	loadFont("Radiance", "panorama/fonts/radiance-semibold.otf")

/**
 * How high above the middle of its line Radiance stands its digits, as a share of the size: a line
 * box is centred on `hhea` 857/-344 rather than on the 672 cap, so the reading sits high unless the
 * line is grown by twice this. RadianceM shares those metrics; the menu's own faces centre on their own.
 */
const RADIANCE_CAP_SHIFT = (672 - (857 - 344)) / 2000
/**
 * How wide the game blurs the shade under a reading, as a share of its size: `#CooldownTimer`
 * carries `text-shadow: 0px 0px 6px 6 #000000` under a twenty.
 */
const SHADOW_BLUR = 6 / 20

/**
 * The game's soft shade under the digits, thrown a pixel down and right and laid under the
 * outline. A `glow` font effect is baked into the glyph atlas once per size, where a
 * `drop-shadow` filter would cost the element a layer every frame.
 */
function fontEffect(fontSize: number): string {
	const blur = Math.max(2, Math.round(fontSize * SHADOW_BLUR))
	return `glow(1px ${blur}px 1px 1px #000000), outline(1px #000000)`
}

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
		const position = GUIInfo.GetLowerHUDForUnit(entity).MainInventorySlots[slot]
		if (position === undefined) {
			return false
		}
		const height = Math.round(position.Height)
		MenuSDK.WritePx(element, "left", Math.round(position.x))
		MenuSDK.WritePx(element, "top", Math.round(position.y))
		MenuSDK.WritePx(element, "width", Math.round(position.Width))
		MenuSDK.WritePx(element, "height", height)
		const fontSize = Math.round(position.Height / this.menu.TextSize)
		const capShift = FONT_FAMILY !== undefined ? RADIANCE_CAP_SHIFT : 0
		MenuSDK.WritePx(
			element,
			"line-height",
			Math.round(height + 2 * fontSize * capShift)
		)
		MenuSDK.WriteStyle(
			element,
			"font-family",
			FONT_FAMILY ?? MenuSDK.Theme.FontFamily
		)
		MenuSDK.WritePx(element, "font-size", fontSize)
		if (MenuSDK.MarkValue(element, "m:effect", fontSize)) {
			MenuSDK.WriteStyle(element, "font-effect", fontEffect(fontSize))
		}
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
				fontWeight: FONT_WEIGHT,
				whiteSpace: "nowrap",
				pointerEvents: "none"
			}
		})
	}
})(true)
