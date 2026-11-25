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
var upgrade_levels := {"washer":0,"iron":0,"lights":0}
var selected_item_id := ""
var studio_mode := "menu"
var process_value := 0.0
var process_direction := 1.0
var timing_bar: ProgressBar
var light_slider: HSlider

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
		"studio": _build_studio()
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

func _build_studio() -> void:
	_heading("Processing Studio", "Choose an item and prepare it for the marketplace.")
	if selected_item_id == "":
		for item in inventory:
			var button := Button.new()
			button.text = "%s %s · %d%% · %s" % [item.emoji,item.name,int(item.condition),"Ready" if item.washed and item.ironed and item.photographed else "In progress"]
			button.custom_minimum_size.y = 76
			var texture := _item_texture(item)
			if texture:
				button.icon = texture
				button.expand_icon = true
			button.pressed.connect(_select_studio_item.bind(str(item.id)))
			content.add_child(button)
		return
	var item := _selected_item()
	if item.is_empty():
		selected_item_id = ""
		_build_studio()
		return
	var info := Label.new()
	info.text = "%s %s\nCondition: %d%% · Photo: %d%%\nWashed: %s · Ironed: %s · Photographed: %s" % [item.emoji,item.name,int(item.condition),int(item.photo_quality),str(item.washed),str(item.ironed),str(item.photographed)]
	info.add_theme_color_override("font_color", Color("#f5effb"))
	content.add_child(info)
	var image := TextureRect.new()
	image.custom_minimum_size = Vector2(0,180)
	image.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	image.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
	image.texture = _item_texture(item)
	content.add_child(image)
	if studio_mode == "wash":
		_build_timing_game("Wash", 0.5, 0.05 + _upgrade_bonus("washer"), 2.2)
	elif studio_mode == "iron":
		_build_timing_game("Iron", 0.72, 0.045 + _upgrade_bonus("iron") / 300.0, 1.4)
	elif studio_mode == "photo":
		_build_photo_mode(item)
	else:
		var wash := _action_button("Wash", item.washed or studio_mode != "menu")
		wash.pressed.connect(_start_studio_mode.bind("wash"))
		content.add_child(wash)
		var iron := _action_button("Iron", not item.washed or item.ironed or studio_mode != "menu")
		iron.pressed.connect(_start_studio_mode.bind("iron"))
		content.add_child(iron)
		var photo := _action_button("Photo", item.photographed or studio_mode != "menu")
		photo.pressed.connect(_start_studio_mode.bind("photo"))
		content.add_child(photo)
	var back := _action_button("Back to items", false)
	back.pressed.connect(_clear_studio_selection)
	content.add_child(back)

func _action_button(label: String, disabled: bool) -> Button:
	var button := Button.new()
	button.text = label
	button.custom_minimum_size.y = 56
	button.disabled = disabled
	return button

func _selected_item() -> Dictionary:
	for item in inventory:
		if str(item.id) == selected_item_id:
			return item
	return {}

func _select_studio_item(id: String) -> void:
	selected_item_id = id
	studio_mode = "menu"
	_show_screen("studio")

func _clear_studio_selection() -> void:
	selected_item_id = ""
	studio_mode = "menu"
	_show_screen("studio")

func _start_studio_mode(mode: String) -> void:
	studio_mode = mode
	process_value = 0.0
	process_direction = 1.0
	_show_screen("studio")

func _process(delta: float) -> void:
	if studio_mode != "wash" and studio_mode != "iron":
		return
	process_value += process_direction * delta * (2.2 if studio_mode == "wash" else 1.4)
	if process_value >= 1.0:
		process_value = 1.0
		process_direction = -1.0
	elif process_value <= 0.0:
		process_value = 0.0
		process_direction = 1.0

func _build_timing_game(title: String, center: float, half_zone: float, speed: float) -> void:
	var guidance := Label.new()
	guidance.text = "Stop the moving marker in the green zone. Avoid the red heat zone when ironing."
	guidance.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	content.add_child(guidance)
	timing_bar = ProgressBar.new()
	timing_bar.min_value = 0
	timing_bar.max_value = 100
	timing_bar.value = process_value * 100.0
	timing_bar.custom_minimum_size.y = 42
	content.add_child(timing_bar)
	var stop := _action_button("STOP %s · %.0f%%" % [title,process_value*100.0], false)
	stop.pressed.connect(_finish_timing_game.bind(center,half_zone))
	content.add_child(stop)

func _finish_timing_game(center: float, half_zone: float) -> void:
	var item := _selected_item()
	if item.is_empty():
		return
	var in_zone := absf(process_value-center) <= half_zone
	if studio_mode == "wash":
		var gain := maxf(15.0,45.0-absf(process_value-center)*220.0) if in_zone else 2.0
		item.condition = minf(100.0,float(item.condition)+gain)
		item.washed = true
	else:
		var burned := process_value > 0.9
		var gain := -12.0 if burned else (maxf(12.0,35.0-absf(process_value-center)*240.0)+_upgrade_bonus("iron") if in_zone else 1.0)
		item.condition = clampf(float(item.condition)+gain,0.0,100.0)
		item.ironed = true
	studio_mode = "menu"
	_show_screen("studio")

func _upgrade_bonus(key: String) -> float:
	var level := clampi(int(upgrade_levels.get(key,0)),0,3)
	if key == "washer":
		return [0.0,0.04,0.08,0.14][level]
	if key == "iron":
		return [0.0,5.0,12.0,22.0][level]
	return 0.0

func _lights_cap() -> float:
	return [60.0,75.0,90.0,100.0][clampi(int(upgrade_levels.lights),0,3)]

func _build_photo_mode(item: Dictionary) -> void:
	var title := Label.new()
	title.text = "Backdrop and lighting · cap %d%%" % int(_lights_cap())
	content.add_child(title)
	var light_slider := HSlider.new()
	light_slider.min_value = 0
	light_slider.max_value = 100
	light_slider.value = 50
	light_slider.custom_minimum_size.y = 42
	content.add_child(light_slider)
	for backdrop in [{"id":"white","quality":30.0},{"id":"studio","quality":60.0},{"id":"nature","quality":80.0},{"id":"neon","quality":95.0}]:
		var choice := _action_button("%s backdrop · estimated %d%%" % [str(backdrop.id).capitalize(),int(minf(_lights_cap(),float(backdrop.quality)*0.6+50.0*0.4))], false)
		choice.pressed.connect(_take_photo.bind(float(backdrop.quality),float(light_slider.value),str(item.id)))
		content.add_child(choice)

func _take_photo(backdrop_quality: float, lighting: float, item_id: String) -> void:
	for item in inventory:
		if str(item.id) == item_id:
			item.photo_quality = minf(_lights_cap(),backdrop_quality*0.6+lighting*0.4)
			item.photographed = true
	studio_mode = "menu"
	_show_screen("studio")

func _build_shop() -> void:
	_heading("Shop", "Storage and equipment upgrades.")
	for tier in ["room","garage","container"]:
		var card := _action_button("%s storage · %d slots · %d coins" % [tier.capitalize(),STORAGE_CAPACITY[tier],STORAGE_COST[tier]], coins < STORAGE_COST[tier] or _tier_rank(tier) <= _tier_rank(storage_tier))
		card.pressed.connect(_buy_storage.bind(tier))
		content.add_child(card)
	var defs := [
		{"key":"washer","name":"Washing Machine","levels":[{"label":"Hand wash","cost":0},{"label":"Basic Washer","cost":250},{"label":"Pro Washer","cost":1200},{"label":"Industrial","cost":4000}]},
		{"key":"iron","name":"Steam Iron","levels":[{"label":"No iron","cost":0},{"label":"Basic Iron","cost":350},{"label":"Steam Iron","cost":1500},{"label":"Studio Press","cost":5000}]},
		{"key":"lights","name":"Studio Lights","levels":[{"label":"Phone flash","cost":0},{"label":"Ring Light","cost":400},{"label":"Softbox","cost":1800},{"label":"Pro Studio","cost":6000}]}
	]
	for definition in defs:
		var key: String = definition.key
		var level := int(upgrade_levels[key])
		var current: Dictionary = definition.levels[level]
		var next_text := "MAX LEVEL" if level >= 3 else "%s · %d coins" % [definition.levels[level+1].label,definition.levels[level+1].cost]
		var button := _action_button("%s · %s → %s" % [definition.name,current.label,next_text], level >= 3 or (level < 3 and coins < int(definition.levels[level+1].cost)))
		button.pressed.connect(_buy_equipment.bind(key,int(definition.levels[level+1].cost) if level < 3 else 0))
		content.add_child(button)

func _buy_equipment(key: String, cost: int) -> void:
	if int(upgrade_levels.get(key,0)) >= 3 or coins < cost:
		return
	coins -= cost
	upgrade_levels[key] = int(upgrade_levels[key])+1
	_update_coins()
	_show_screen("shop")

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
