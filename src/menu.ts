/** Where this package's own glyphs are shipped: a spelled-out repository path does not resolve. */
const iconsPath = `${__OCT_PACKAGE_ROOT__}/scripts_files/bottle-timer/icons`

export class MenuManager {
	public readonly State: Menu.Toggle

	private readonly sizeScale = 3
	private readonly textSize: Menu.Slider

	private readonly tree = Menu.AddEntry("Visual")
	private readonly node = this.tree.AddNode(
		"Bottle rune timer",
		`${iconsPath}/bottle.svg`,
		"Shows the time when the rune will be activated"
	)

	constructor() {
		// the script's own switch rides the top bar beside the breadcrumb and gates the page
		this.State = this.node.AddToggle("State", true)
		this.State.IconPath = Menu.Icons.Power
		this.node.HeaderControl = this.State
		this.node.Gate = this.State

		this.textSize = this.node.AddSlider("Additional text size", 0, 0, 100)
		this.textSize.IconPath = Menu.Icons.TextSize
	}
	public get TextSize() {
		return Math.remapRange(
			this.textSize.value,
			this.textSize.min,
			this.textSize.max,
			this.sizeScale,
			this.sizeScale / 2
		)
	}
}
