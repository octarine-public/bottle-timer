export class MenuManager {
	public readonly State: Menu.Toggle

	private readonly sizeScale = 3
	private readonly textSize: Menu.Slider

	private readonly tree = Menu.AddEntry("Visual")
	private readonly node = this.tree.AddNode(
		"Bottle rune timer",
		ImageData.GetItemTexture("item_bottle"),
		"Shows the time when the rune will be activated",
		0
	)

	constructor() {
		this.State = this.node.AddToggle("State", true)
		this.textSize = this.node.AddSlider("Additional text size", 0, 0, 100)
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
