extends Control

const BG := Color("#100e18")
const PANEL := Color("#1b1825")
const BORDER := Color("#342d42")
const PURPLE := Color("#c04cff")
const MUTED := Color("#a39aaa")
const CYAN := Color("#42d9f5")

var current_screen := "dashboard"
var coins := 350
var inventory: Array[Dictionary] = []
var active_bale: Dictionary = {}
var bottom_bar: HBoxContainer
var content: VBoxContainer
var coin_label: Label

func _ready() -> void:
	_build_shell()
	_show_screen("dashboard")

func _build_shell() -> void:
	var root := VBoxContainer.new()
	root.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	root.add_theme_constant_override("separation", 0)
	add_child(root)

	var top := HBoxContainer.new()
	top.custom_minimum_size.y = 64
	top.add_theme_constant_override("separation", 12)
	root.add_child(top)

	var brand := Label.new()
	brand.text = "RAG 2 RICH"
	brand.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	brand.add_theme_font_size_override("font_size", 22)
	brand.add_theme_color_override("font_color", PURPLE)
	top.add_child(brand)

	coin_label = Label.new()
	coin_label.add_theme_color_override("font_color", Color("#f4d45c"))
	top.add_child(coin_label)
	_update_coins()

	var scroll := ScrollContainer.new()
	scroll.size_flags_vertical = Control.SIZE_EXPAND_FILL
	root.add_child(scroll)
	content = VBoxContainer.new()
	content.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	content.add_theme_constant_override("separation", 14)
	scroll.add_child(content)

	bottom_bar = HBoxContainer.new()
	bottom_bar.custom_minimum_size.y = 78
	bottom_bar.add_theme_constant_override("separation", 4)
	root.add_child(bottom_bar)
	for entry in [
		["Unbox", "dashboard"], ["Closet", "inventory"],
		["Studio", "studio"], ["Market", "market"], ["Shop", "shop"]
	]:
		var button := Button.new()
		button.text = entry[0]
		button.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		button.custom_minimum_size.y = 62
		button.pressed.connect(_show_screen.bind(entry[1]))
		bottom_bar.add_child(button)

func _show_screen(screen: String) -> void:
	current_screen = screen
	for child in content.get_children():
		child.queue_free()
	match screen:
		"dashboard": _build_dashboard()
		"inventory": _build_inventory()
		"studio": _build_placeholder("Processing Studio", "Pick an item from your closet to wash, iron and photograph.")
		"market": _build_placeholder("Marketplace", "Your prepared listings and sales will appear here.")
		"shop": _build_placeholder("Shop", "Storage, equipment and webshop upgrades.")
	for i in bottom_bar.get_child_count():
		var b := bottom_bar.get_child(i) as Button
		b.modulate = PURPLE if ["dashboard", "inventory", "studio", "market", "shop"][i] == screen else MUTED

func _heading(title: String, subtitle: String) -> void:
	var h := Label.new()
	h.text = title
	h.add_theme_font_size_override("font_size", 25)
	h.add_theme_color_override("font_color", Color("#f5effb"))
	content.add_child(h)
	var s := Label.new()
	s.text = subtitle
	s.add_theme_color_override("font_color", MUTED)
	content.add_child(s)

func _build_dashboard() -> void:
	if not active_bale.is_empty():
		_heading(str(active_bale.name), "Tap the bale to reveal clothing.")
		var bale := Button.new()
		bale.text = "🎁\n\nTAP TO UNBOX"
		bale.custom_minimum_size = Vector2(0, 300)
		bale.add_theme_font_size_override("font_size", 28)
		bale.pressed.connect(_reveal_item)
		content.add_child(bale)
		return
	_heading("Buy a Bale", "Pick a mystery bundle and start unboxing.")
	for bale in [
		{"id":"mixed","name":"Mixed Bale","cost":120,"weight":15,"description":"Standard 15kg mystery bale."},
		{"id":"vintage","name":"Vintage Bale","cost":480,"weight":15,"description":"Higher chance of rare finds."},
		{"id":"premium","name":"Premium Bale","cost":1500,"weight":15,"description":"Stuffed with epic gear."}
	]:
		var card := Button.new()
		card.text = "🎁   %s\n       %s\n       %s kg                         %s coins" % [bale.name, bale.description, str(bale.weight), str(bale.cost)]
		card.custom_minimum_size.y = 92
		card.alignment = HORIZONTAL_ALIGNMENT_LEFT
		card.pressed.connect(_buy_bale.bind(bale))
		content.add_child(card)

func _buy_bale(bale: Dictionary) -> void:
	if not active_bale.is_empty() or coins < int(bale.cost):
		return
	coins -= int(bale.cost)
	active_bale = bale.duplicate()
	active_bale.remaining = int(bale.weight)
	_update_coins()
	_show_screen("dashboard")

func _reveal_item() -> void:
	var kinds := [
		{"name":"T-Shirt","emoji":"👕","weight":0.3,"value":18},
		{"name":"Button Shirt","emoji":"🥻","weight":0.5,"value":28},
		{"name":"Hoodie","emoji":"🧥","weight":0.8,"value":45},
		{"name":"Jeans","emoji":"👖","weight":0.7,"value":40},
		{"name":"Sneakers","emoji":"👟","weight":0.9,"value":120}
	]
	var item: Dictionary = kinds.pick_random().duplicate()
	item["condition"] = 40
	item["washed"] = false
	item["ironed"] = false
	item["photographed"] = false
	inventory.append(item)
	active_bale.remaining = float(active_bale.remaining) - float(item.weight)
	if active_bale.remaining <= 0.05:
		active_bale.clear()
	_show_screen("dashboard")

func _build_inventory() -> void:
	_heading("Your Closet", "%d items in your closet" % inventory.size())
	if inventory.is_empty():
		_build_placeholder("🧺 Closet empty", "Buy a bale and start unboxing.")
		return
	for item in inventory:
		var row := Button.new()
		row.text = "%s  %s  ·  Condition %d%%" % [item.emoji, item.name, int(item.condition)]
		row.custom_minimum_size.y = 64
		content.add_child(row)

func _build_placeholder(title: String, subtitle: String) -> void:
	_heading(title, subtitle)

func _update_coins() -> void:
	if is_instance_valid(coin_label):
		coin_label.text = "◉ %d" % coins
