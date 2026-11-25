extends Control

const BG := Color("#100e18")
const PANEL := Color("#1b1825")
const PURPLE := Color("#c04cff")
const MUTED := Color("#a39aaa")
const BALES := [
	{"id":"mixed","name":"Mixed Bale","cost":120,"weight":15.0,"boost":0.0,"description":"Standard 15kg mystery bale."},
	{"id":"vintage","name":"Vintage Bale","cost":480,"weight":15.0,"boost":0.25,"description":"Higher chance of rare finds."},
	{"id":"premium","name":"Premium Bale","cost":1500,"weight":15.0,"boost":0.5,"description":"Stuffed with epic gear."},
]
const ITEMS := [
	{"kind":"tshirt","name":"T-Shirt","emoji":"👕","weight":0.3,"value":18,"rarity":"common","clicks":2},
	{"kind":"shirt","name":"Button Shirt","emoji":"🥻","weight":0.5,"value":28,"rarity":"common","clicks":3},
	{"kind":"scarf","name":"Scarf","emoji":"🧣","weight":0.2,"value":14,"rarity":"common","clicks":2},
	{"kind":"hoodie","name":"Hoodie","emoji":"🧥","weight":0.8,"value":45,"rarity":"uncommon","clicks":4},
	{"kind":"jeans","name":"Jeans","emoji":"👖","weight":0.7,"value":40,"rarity":"uncommon","clicks":4},
	{"kind":"dress","name":"Dress","emoji":"👗","weight":0.6,"value":55,"rarity":"uncommon","clicks":4},
	{"kind":"bag","name":"Handbag","emoji":"👜","weight":0.5,"value":90,"rarity":"rare","clicks":4},
	{"kind":"sneakers","name":"Sneakers","emoji":"👟","weight":0.9,"value":120,"rarity":"rare","clicks":5},
	{"kind":"jacket","name":"Jacket","emoji":"🧥","weight":1.2,"value":140,"rarity":"rare","clicks":5},
	{"kind":"coat","name":"Wool Coat","emoji":"🧥","weight":1.6,"value":220,"rarity":"epic","clicks":6},
	{"kind":"cap","name":"Cap","emoji":"🧢","weight":0.2,"value":16,"rarity":"common","clicks":2},
	{"kind":"skirt","name":"Skirt","emoji":"👚","weight":0.4,"value":32,"rarity":"uncommon","clicks":3},
	{"kind":"blazer","name":"Blazer","emoji":"🥼","weight":0.9,"value":110,"rarity":"rare","clicks":4},
	{"kind":"boots","name":"Leather Boots","emoji":"🥾","weight":1.3,"value":160,"rarity":"rare","clicks":5},
	{"kind":"suit","name":"Tailored Suit","emoji":"🤵","weight":1.8,"value":260,"rarity":"epic","clicks":6},
]
const RARITY_WEIGHTS := {"common":50.0,"uncommon":28.0,"rare":14.0,"epic":5.0}
const STORAGE_CAPACITY := {"closet":15,"room":30,"garage":100,"container":200}
const STORAGE_COST := {"closet":0,"room":5000,"garage":12000,"container":25000}

var current_screen := "dashboard"
var coins := 350
var inventory: Array[Dictionary] = []
var storage_tier := "closet"
var active_bale: Dictionary = {}
var bottom_bar: HBoxContainer
var content: VBoxContainer
var coin_label: Label
var bale_texture: Texture2D
var item_textures: Dictionary = {}

func _ready() -> void:
	bale_texture = load("res://assets/bale.png")
	for kind in ["tshirt","shirt","jeans","dress","jacket","coat","hoodie","sneakers","bag","scarf","blazer","skirt","cap","boots","suit"]:
		var textures: Array[Texture2D] = []
		for file_name in _variant_files(kind):
			textures.append(load("res://assets/items/" + file_name))
		item_textures[kind] = textures
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
	for entry in [["Unbox","dashboard"],["Closet","inventory"],["Studio","studio"],["Market","market"],["Shop","shop"]]:
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
		"studio": _build_placeholder("Processing Studio","Pick an item from your closet to wash, iron and photograph.")
		"market": _build_placeholder("Marketplace","Your prepared listings and sales will appear here.")
		"shop": _build_shop()
	for i in bottom_bar.get_child_count():
		var b := bottom_bar.get_child(i) as Button
		b.modulate = PURPLE if ["dashboard","inventory","studio","market","shop"][i] == screen else MUTED

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
		_heading(str(active_bale.def.name), "%.2f / %.0f kg left · tap to reveal" % [active_bale.remaining, active_bale.def.weight])
		if _occupied() >= _capacity():
			_build_placeholder("Storage full","Sell items or upgrade storage before unpacking more.")
			return
		var bale := Button.new()
		bale.custom_minimum_size = Vector2(0,300)
		bale.pressed.connect(_click_bale)
		var art := TextureRect.new()
		art.texture = bale_texture
		art.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
		art.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
		art.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
		bale.add_child(art)
		var label := Label.new()
		label.text = "TAP TO UNBOX · %s" % (str(active_bale.current.clicks_left)+" taps left" if not active_bale.current.is_empty() else "mystery clothing")
		label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
		label.vertical_alignment = VERTICAL_ALIGNMENT_BOTTOM
		label.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
		bale.add_child(label)
		content.add_child(bale)
		return
	_heading("Buy a Bale","Pick a mystery bundle and start unboxing.")
	_build_placeholder("Storage: %d / %d slots" % [_occupied(),_capacity()],"Inventory and marketplace listings both use storage.")
	for bale in BALES:
		var card := Button.new()
		card.text = "🎁   %s\n       %s\n       %.0f kg                         %d coins" % [bale.name,bale.description,bale.weight,bale.cost]
		card.custom_minimum_size.y = 92
		card.alignment = HORIZONTAL_ALIGNMENT_LEFT
		card.disabled = coins < bale.cost or _occupied() >= _capacity()
		card.pressed.connect(_buy_bale.bind(bale))
		content.add_child(card)

func _buy_bale(bale: Dictionary) -> void:
	if not active_bale.is_empty() or coins < int(bale.cost) or _occupied() >= _capacity():
		return
	coins -= int(bale.cost)
	active_bale = {"def":bale.duplicate(),"remaining":float(bale.weight),"current":{}}
	_update_coins()
	_show_screen("dashboard")

func _weighted_item(boost: float) -> Dictionary:
	var weights: Array[float] = []
	var total := 0.0
	for item in ITEMS:
		var base: float = RARITY_WEIGHTS[item.rarity]
		var shift := -boost*30.0 if item.rarity == "common" else (boost*25.0 if item.rarity == "epic" else boost*8.0)
		var weight := maxf(1.0,base+shift)
		weights.append(weight)
		total += weight
	var roll := randf()*total
	for i in ITEMS.size():
		roll -= weights[i]
		if roll <= 0.0:
			return ITEMS[i].duplicate()
	return ITEMS[0].duplicate()

func _click_bale() -> void:
	if active_bale.is_empty() or _occupied() >= _capacity():
		return
	if active_bale.current.is_empty():
		if active_bale.remaining <= 0.05:
			active_bale.clear()
			_show_screen("dashboard")
			return
		var template := _weighted_item(float(active_bale.def.boost))
		var attempts := 0
		while template.weight > active_bale.remaining+0.4 and attempts < 6:
			template = _weighted_item(float(active_bale.def.boost))
			attempts += 1
		if template.weight > active_bale.remaining+0.4:
			template = ITEMS[0].duplicate()
		active_bale.current = {"template":template,"clicks_left":template.clicks,"total_clicks":template.clicks}
	var current: Dictionary = active_bale.current
	current.clicks_left -= 1
	if current.clicks_left > 0:
		active_bale.current = current
		_show_screen("dashboard")
		return
	var t: Dictionary = current.template
	var variants := _variant_count(str(t.kind))
	var item := {
		"id":str(Time.get_unix_time_from_system())+"-"+str(randi()),
		"kind":t.kind,"variant":randi_range(0,variants-1),"name":t.name,"emoji":t.emoji,
		"weight":t.weight,"base_value":t.value,"rarity":t.rarity,
		"condition":randf_range(25.0,50.0),"photo_quality":0.0,
		"washed":false,"ironed":false,"photographed":false
	}
	inventory.append(item)
	active_bale.remaining = maxf(0.0,active_bale.remaining-float(t.weight))
	active_bale.current = {}
	if active_bale.remaining <= 0.05:
		active_bale.clear()
	_show_screen("dashboard")

func _variant_count(kind: String) -> int:
	return max(1, _variant_files(kind).size())

func _capacity() -> int:
	return int(STORAGE_CAPACITY[storage_tier])

func _occupied() -> int:
	return inventory.size()

func _build_inventory() -> void:
	_heading("Your Closet","%d items in your closet" % inventory.size())
	if inventory.is_empty():
		_build_placeholder("🧺 Closet empty","Buy a bale and start unboxing.")
		return
	for item in inventory:
		var card := Button.new()
		card.custom_minimum_size.y = 84
		card.alignment = HORIZONTAL_ALIGNMENT_LEFT
		card.text = "%s  %s  ·  Condition %d%%" % [item.emoji,item.name,int(item.condition)]
		var texture := _item_texture(item)
		if texture:
			card.icon = texture
			card.expand_icon = true
		content.add_child(card)

func _build_shop() -> void:
	_heading("Shop","Storage upgrades")
	for tier in ["room","garage","container"]:
		var card := Button.new()
		card.text = "%s storage · %d slots · %d coins" % [tier.capitalize(),STORAGE_CAPACITY[tier],STORAGE_COST[tier]]
		card.disabled = coins < STORAGE_COST[tier] or _tier_rank(tier) <= _tier_rank(storage_tier)
		card.pressed.connect(_buy_storage.bind(tier))
		content.add_child(card)

func _buy_storage(tier: String) -> void:
	if coins < STORAGE_COST[tier]:
		return
	coins -= STORAGE_COST[tier]
	storage_tier = tier
	_update_coins()
	_show_screen("shop")

func _variant_files(kind: String) -> Array[String]:
	var result: Array[String] = []
	var suffix := 1
	while true:
		var file_name := kind + (".jpg" if suffix == 1 else "_" + str(suffix) + ".jpg")
		if not FileAccess.file_exists("res://assets/items/" + file_name):
			break
		result.append(file_name)
		suffix += 1
	return result

func _item_texture(item: Dictionary) -> Texture2D:
	var kind := str(item.kind)
	var textures: Array = item_textures.get(kind, [])
	if textures.is_empty():
		return null
	return textures[clampi(int(item.variant),0,textures.size()-1)]

func _tier_rank(tier: String) -> int:
	return ["closet","room","garage","container"].find(tier)

func _build_placeholder(title: String, subtitle: String) -> void:
	_heading(title,subtitle)

func _update_coins() -> void:
	if is_instance_valid(coin_label):
		coin_label.text = "◉ %d" % coins
