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
const SAVE_VERSION := 1
const INTERSTITIAL_INTERVAL := 600.0

var current_screen := "dashboard"
var gallery_return_screen := "studio"
var coins := 350
var inventory: Array[Dictionary] = []
var listings: Array[Dictionary] = []
var total_sales := 0
var reputation := 1.0
var free_uploads := 0
var market_timer := 0.0
var gift_timer := 0.0
var gift_open := false
var webshop_unlocked := false
var pending_market_item_id := ""
var storage_tier := "closet"
var active_bale: Dictionary = {}
var bottom_bar: HBoxContainer
var content: VBoxContainer
var coin_label: Label
var display_font: Font
var bale_name_label: Label
var bale_weight_label: Label
var bale_tap_button: Button
var bale_tap_art: TextureRect
var bale_hint_label: Label
var bale_rarity_label: Label
var bale_progress_bar: ProgressBar
var bale_reveal_progress: ProgressBar
var bale_texture: Texture2D
var item_textures: Dictionary = {}
var designer_items: Array[Dictionary] = []
var designer_textures: Dictionary = {}
var discovered_designers: Array[String] = []
var upgrade_levels := {"washer":0,"iron":0,"lights":0}
var selected_item_id := ""
var selected_designer_id := ""
var studio_mode := "menu"
var process_value := 0.0
var process_direction := 1.0
var timing_bar: ProgressBar
var selected_lighting := 50.0
var selected_backdrop_quality := 30.0
var photo_preview_panel: PanelContainer
var photo_quality_label: Label
var admob: Node
var ad_spacer: Control
var ad_overlay: Control
var register_ad_button: Button
var designer_ad_button: Button
var reward_notice: Label
var reward_notice_timer := 0.0
var register_elapsed := 0.0
var designer_elapsed := 0.0
var register_visible_timer := 0.0
var designer_visible_timer := 0.0
var ads_consent_ready := false
var banner_ad_loaded := false
var interstitial_elapsed := 0.0
var interstitial_ad_loaded := false
var interstitial_ad_load_requested := false
var interstitial_show_pending := false
var rewarded_ad_loaded := false
var rewarded_ad_load_requested := false
var pending_reward_slot := ""
var reward_preview_remaining := -1.0
var reward_preview_bar: ProgressBar

func _ready() -> void:
	_load_game()
	_load_designer_catalog()
	display_font = load("res://assets/fonts/SpaceGrotesk-Variable.ttf") as Font
	theme = _create_game_theme()
	bale_texture = load("res://assets/bale.png")
	for kind in ["tshirt","shirt","jeans","dress","jacket","coat","hoodie","sneakers","bag","scarf","blazer","skirt","cap","boots","suit"]:
		var textures: Array[Texture2D] = []
		for file_name in _variant_files(kind):
			textures.append(load("res://assets/items/" + file_name))
		item_textures[kind] = textures
	_build_shell()
	_show_screen("dashboard")
	_setup_ads()
	_build_reward_overlay()

func _create_game_theme() -> Theme:
	var game_theme := Theme.new()
	game_theme.default_font_size = 15
	game_theme.default_font = load("res://assets/fonts/Inter-Variable.ttf") as Font
	var normal := StyleBoxFlat.new()
	normal.bg_color = PANEL
	normal.border_color = Color("#393144")
	normal.set_border_width_all(1)
	normal.set_corner_radius_all(12)
	normal.content_margin_left = 12
	normal.content_margin_right = 12
	normal.content_margin_top = 8
	normal.content_margin_bottom = 8
	var hover := normal.duplicate() as StyleBoxFlat
	hover.bg_color = Color("#292337")
	hover.border_color = PURPLE
	var pressed := normal.duplicate() as StyleBoxFlat
	pressed.bg_color = Color("#382544")
	var disabled := normal.duplicate() as StyleBoxFlat
	disabled.bg_color = Color("#17141f")
	disabled.border_color = Color("#292532")
	game_theme.set_stylebox("normal", "Button", normal)
	game_theme.set_stylebox("hover", "Button", hover)
	game_theme.set_stylebox("pressed", "Button", pressed)
	game_theme.set_stylebox("disabled", "Button", disabled)
	game_theme.set_color("font_color", "Button", Color("#f5effb"))
	game_theme.set_color("font_hover_color", "Button", Color.WHITE)
	game_theme.set_color("font_disabled_color", "Button", MUTED)
	var progress_track := StyleBoxFlat.new()
	progress_track.bg_color = Color("#2a2534")
	progress_track.set_corner_radius_all(8)
	var progress_fill := StyleBoxFlat.new()
	progress_fill.bg_color = PURPLE
	progress_fill.set_corner_radius_all(8)
	game_theme.set_stylebox("background", "ProgressBar", progress_track)
	game_theme.set_stylebox("fill", "ProgressBar", progress_fill)
	return game_theme

func _notification(what: int) -> void:
	if what == NOTIFICATION_WM_CLOSE_REQUEST or what == NOTIFICATION_APPLICATION_PAUSED:
		_save_game()
	elif what == NOTIFICATION_WM_GO_BACK_REQUEST:
		if current_screen == "designer_detail":
			selected_designer_id = ""
			_show_screen("gallery")
		elif current_screen == "gallery":
			_show_screen(gallery_return_screen)
		elif pending_market_item_id != "":
			_cancel_pending_listing()
		elif selected_item_id != "":
			_clear_studio_selection()
		elif current_screen != "dashboard":
			_show_screen("dashboard")
		else:
			_save_game()
			get_tree().quit()

func _build_shell() -> void:
	var background := ColorRect.new()
	background.color = BG
	background.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	background.mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_child(background)
	var root := VBoxContainer.new()
	root.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	root.add_theme_constant_override("separation", 0)
	add_child(root)
	move_child(background,0)
	var top := HBoxContainer.new()
	top.custom_minimum_size.y = 64
	top.add_theme_constant_override("separation", 12)
	root.add_child(top)
	var brand := Label.new()
	brand.text = "RAG 2 RICH"
	brand.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	brand.add_theme_font_size_override("font_size", 22)
	brand.add_theme_font_override("font",display_font)
	brand.add_theme_color_override("font_color", PURPLE)
	top.add_child(brand)
	coin_label = Label.new()
	coin_label.add_theme_color_override("font_color", Color("#f4d45c"))
	top.add_child(coin_label)
	_update_coins()
	var scroll := ScrollContainer.new()
	scroll.size_flags_vertical = Control.SIZE_EXPAND_FILL
	root.add_child(scroll)
	var margins := MarginContainer.new()
	margins.add_theme_constant_override("margin_left", 16)
	margins.add_theme_constant_override("margin_right", 16)
	margins.add_theme_constant_override("margin_top", 14)
	margins.add_theme_constant_override("margin_bottom", 14)
	margins.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	scroll.add_child(margins)
	content = VBoxContainer.new()
	content.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	content.add_theme_constant_override("separation", 14)
	margins.add_child(content)
	bottom_bar = HBoxContainer.new()
	bottom_bar.custom_minimum_size.y = 78
	bottom_bar.add_theme_constant_override("separation", 4)
	root.add_child(bottom_bar)
	for entry in [["Unbox","dashboard"],["Closet","inventory"],["Studio","studio"],["Market","market"],["Shop","shop"]]:
		var button := Button.new()
		button.text = entry[0]
		button.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		button.custom_minimum_size.y = 62
		button.add_theme_font_size_override("font_size",12)
		button.pressed.connect(_show_screen.bind(entry[1]))
		bottom_bar.add_child(button)
	ad_spacer = Control.new()
	ad_spacer.custom_minimum_size.y = 60 if OS.has_feature("android") else 0
	root.add_child(ad_spacer)

func _setup_ads() -> void:
	admob = get_node_or_null("Admob")
	if admob == null or not OS.has_feature("android"):
		return
	admob.connect("initialization_completed", _on_admob_initialized)
	admob.connect("consent_info_updated", _on_consent_info_updated)
	admob.connect("consent_info_update_failed", _on_consent_info_failed)
	admob.connect("consent_form_loaded", _on_consent_form_loaded)
	admob.connect("consent_form_dismissed", _on_consent_form_dismissed)
	admob.connect("consent_form_failed_to_load", _on_consent_form_failed)
	admob.connect("banner_ad_loaded", _on_banner_ad_loaded)
	admob.connect("interstitial_ad_loaded", _on_interstitial_ad_loaded)
	admob.connect("interstitial_ad_failed_to_load", _on_interstitial_ad_failed_to_load)
	admob.connect("interstitial_ad_dismissed_full_screen_content", _on_interstitial_ad_dismissed)
	admob.connect("interstitial_ad_failed_to_show_full_screen_content", _on_interstitial_ad_failed_to_show)
	admob.connect("rewarded_ad_loaded", _on_rewarded_ad_loaded)
	admob.connect("rewarded_ad_failed_to_load", _on_rewarded_ad_failed)
	admob.connect("rewarded_ad_user_earned_reward", _on_rewarded_ad_earned)
	admob.connect("rewarded_ad_dismissed_full_screen_content", _on_rewarded_ad_dismissed)
	admob.connect("rewarded_ad_failed_to_show_full_screen_content", _on_rewarded_ad_failed)
	admob.set("remove_interstitial_ads_after_displayed", true)
	admob.call("initialize")

func _on_admob_initialized(_status: Variant) -> void:
	admob.call("update_consent_info")

func _on_consent_info_updated() -> void:
	var consent: Variant = admob.call("get_consent_status")
	if consent == null:
		return
	if int(consent.status) == 1 or int(consent.status) == 3:
		ads_consent_ready = true
		_load_mobile_ads()
	elif int(consent.status) == 2:
		if bool(admob.call("is_consent_form_available")):
			admob.call("show_consent_form")
		else:
			admob.call("load_consent_form")
	else:
		admob.call("load_consent_form")

func _on_consent_form_loaded() -> void:
	admob.call("show_consent_form")

func _on_consent_form_dismissed(_error: Variant) -> void:
	var consent: Variant = admob.call("get_consent_status")
	if consent != null and (int(consent.status) == 1 or int(consent.status) == 3):
		ads_consent_ready = true
		_load_mobile_ads()

func _on_consent_info_failed(_error: Variant) -> void:
	ads_consent_ready = false

func _on_consent_form_failed(_error: Variant) -> void:
	ads_consent_ready = false

func _load_mobile_ads() -> void:
	if not ads_consent_ready:
		return
	if not banner_ad_loaded:
		admob.call("load_banner_ad")
	if not rewarded_ad_loaded and not rewarded_ad_load_requested:
		rewarded_ad_load_requested = true
		admob.call("load_rewarded_ad")
	if not interstitial_ad_loaded and not interstitial_ad_load_requested:
		interstitial_ad_load_requested = true
		admob.call("load_interstitial_ad")

func _on_banner_ad_loaded(ad_info: Variant, _response_info: Variant) -> void:
	banner_ad_loaded = true
	admob.call("show_banner_ad", ad_info.call("get_ad_id"))

func _on_interstitial_ad_loaded(ad_info: Variant, _response_info: Variant) -> void:
	interstitial_ad_load_requested = false
	interstitial_ad_loaded = true
	if interstitial_show_pending and pending_reward_slot == "":
		interstitial_show_pending = false
		interstitial_ad_loaded = false
		admob.call("show_interstitial_ad", ad_info.call("get_ad_id"))

func _on_interstitial_ad_failed_to_load(_ad_info: Variant, _error: Variant) -> void:
	interstitial_ad_load_requested = false
	interstitial_ad_loaded = false
	interstitial_show_pending = false

func _on_interstitial_ad_dismissed(_ad_info: Variant) -> void:
	interstitial_ad_loaded = false
	_load_mobile_ads()

func _on_interstitial_ad_failed_to_show(_ad_info: Variant, _error: Variant) -> void:
	interstitial_ad_loaded = false
	_load_mobile_ads()

func _on_rewarded_ad_loaded(ad_info: Variant, _response_info: Variant) -> void:
	rewarded_ad_load_requested = false
	rewarded_ad_loaded = true
	if pending_reward_slot != "":
		admob.call("show_rewarded_ad", ad_info.call("get_ad_id"))

func _on_rewarded_ad_failed(_ad_info: Variant, _error: Variant) -> void:
	rewarded_ad_load_requested = false
	rewarded_ad_loaded = false
	if pending_reward_slot != "":
		pending_reward_slot = ""
		_show_reward_notice("Ad unavailable · no reward")

func _on_rewarded_ad_earned(_ad_info: Variant, _reward: Variant) -> void:
	var slot := pending_reward_slot
	if slot == "":
		return
	pending_reward_slot = ""
	rewarded_ad_loaded = false
	_grant_ad_reward(slot)
	_load_mobile_ads()

func _on_rewarded_ad_dismissed(_ad_info: Variant) -> void:
	if pending_reward_slot != "":
		pending_reward_slot = ""
		_show_reward_notice("Ad closed · no reward")
	rewarded_ad_loaded = false
	_load_mobile_ads()

func _build_reward_overlay() -> void:
	ad_overlay = Control.new()
	ad_overlay.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	ad_overlay.mouse_filter = Control.MOUSE_FILTER_PASS
	add_child(ad_overlay)
	register_ad_button = _action_button("✦\n20s", false)
	register_ad_button.custom_minimum_size = Vector2(62,62)
	register_ad_button.set_anchors_preset(Control.PRESET_BOTTOM_RIGHT)
	register_ad_button.offset_left = -82
	register_ad_button.offset_top = -236
	register_ad_button.offset_right = -20
	register_ad_button.offset_bottom = -174
	register_ad_button.visible = false
	register_ad_button.pressed.connect(_request_reward.bind("golden_register"))
	ad_overlay.add_child(register_ad_button)
	designer_ad_button = _action_button("💎\n10s", false)
	designer_ad_button.custom_minimum_size = Vector2(62,62)
	designer_ad_button.set_anchors_preset(Control.PRESET_BOTTOM_LEFT)
	designer_ad_button.offset_left = 20
	designer_ad_button.offset_top = -236
	designer_ad_button.offset_right = 82
	designer_ad_button.offset_bottom = -174
	designer_ad_button.visible = false
	designer_ad_button.pressed.connect(_request_reward.bind("designer_drop"))
	ad_overlay.add_child(designer_ad_button)
	reward_notice = Label.new()
	reward_notice.set_anchors_preset(Control.PRESET_TOP_WIDE)
	reward_notice.offset_left = 14
	reward_notice.offset_top = 68
	reward_notice.offset_right = -14
	reward_notice.offset_bottom = 104
	reward_notice.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	reward_notice.add_theme_color_override("font_color", Color("#f4d45c"))
	reward_notice.visible = false
	ad_overlay.add_child(reward_notice)
	var center := CenterContainer.new()
	center.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	center.visible = false
	ad_overlay.add_child(center)
	var panel := PanelContainer.new()
	panel.custom_minimum_size = Vector2(330,230)
	center.add_child(panel)
	var body := VBoxContainer.new()
	body.add_theme_constant_override("separation", 14)
	panel.add_child(body)
	var title := Label.new()
	title.text = "Sponsored · preview ad"
	title.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	body.add_child(title)
	var ad_copy := Label.new()
	ad_copy.text = "Reward after the preview finishes.\nSkipping gives no reward."
	ad_copy.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	body.add_child(ad_copy)
	reward_preview_bar = ProgressBar.new()
	reward_preview_bar.max_value = 5
	reward_preview_bar.value = 0
	body.add_child(reward_preview_bar)
	var skip := _action_button("Skip · no reward", false)
	skip.pressed.connect(_skip_preview_reward)
	body.add_child(skip)
	center.name = "RewardPreview"
	center.set_meta("panel", panel)
	ad_overlay.set_meta("preview", center)

func _show_reward_notice(message: String) -> void:
	reward_notice.text = message
	reward_notice.visible = true
	reward_notice_timer = 3.0

func _skip_preview_reward() -> void:
	reward_preview_remaining = -1.0
	var preview: Control = ad_overlay.get_meta("preview")
	preview.visible = false
	pending_reward_slot = ""
	_show_reward_notice("Preview skipped · no reward")

func _request_reward(slot: String) -> void:
	if pending_reward_slot != "":
		return
	if slot == "golden_register":
		register_ad_button.visible = false
		register_visible_timer = 0.0
	elif slot == "designer_drop":
		designer_ad_button.visible = false
		designer_visible_timer = 0.0
	pending_reward_slot = slot
	if OS.has_feature("editor"):
		reward_preview_remaining = 5.0
		reward_preview_bar.value = 0
		var preview: Control = ad_overlay.get_meta("preview")
		preview.visible = true
		return
	if not OS.has_feature("android") or not ads_consent_ready:
		pending_reward_slot = ""
		_show_reward_notice("Ads are not ready on this device")
		return
	if rewarded_ad_loaded:
		rewarded_ad_loaded = false
		admob.call("show_rewarded_ad")
	elif not rewarded_ad_load_requested:
		rewarded_ad_load_requested = true
		admob.call("load_rewarded_ad")

func _grant_ad_reward(slot: String) -> void:
	match slot:
		"magic_laundry":
			var repaired := 0
			for item in inventory:
				if float(item.condition) < 100.0:
					repaired += 1
				item.condition = 100.0
				item.washed = true
				item.ironed = true
			_save_game()
			_show_reward_notice("Magic Laundry · %d items refreshed" % repaired)
		"golden_register":
			_sell_random_listings(5)
		"designer_drop":
			var item := _award_random_designer()
			if item.is_empty():
				_show_reward_notice("Storage full · no designer item")
			else:
				_show_reward_notice("Designer Drop · %s" % str(item.name))
	if current_screen in ["studio", "inventory", "gallery", "market"]:
		_show_screen(current_screen)

func _sell_random_listings(amount: int) -> void:
	var indices: Array[int] = []
	for index in listings.size():
		indices.append(index)
	indices.shuffle()
	var sold := mini(amount,indices.size())
	if sold <= 0:
		_show_reward_notice("Nothing was listed to sell")
		return
	var sold_ids: Array[String] = []
	var remaining: Array[Dictionary] = []
	var earned := 0
	for index in range(sold):
		var listing: Dictionary = listings[indices[index]]
		sold_ids.append(str(listing.id))
		earned += int(listing.price)
	for listing in listings:
		if not sold_ids.has(str(listing.id)):
			remaining.append(listing)
	listings = remaining
	coins += earned
	total_sales += sold
	_update_coins()
	_save_game()
	_show_reward_notice("Golden Register · %d sold · +%d coins" % [sold,earned])

func _show_screen(screen: String) -> void:
	if screen == "gallery" and current_screen != "gallery":
		gallery_return_screen = current_screen
	current_screen = screen
	for child in content.get_children():
		child.queue_free()
	match screen:
		"dashboard": _build_dashboard()
		"inventory": _build_inventory()
		"studio": _build_studio()
		"gallery": _build_gallery()
		"designer_detail": _build_designer_detail()
		"market": _build_market()
		"shop": _build_shop()
	for i in bottom_bar.get_child_count():
		var b := bottom_bar.get_child(i) as Button
		var selected_screen := "studio" if screen == "gallery" else screen
		var selected := ["dashboard","inventory","studio","market","shop"][i] == selected_screen
		b.modulate = Color.WHITE
		b.add_theme_color_override("font_color",PURPLE if selected else MUTED)
		b.add_theme_color_override("font_pressed_color",PURPLE)

func _heading(title: String, subtitle: String) -> void:
	var h := Label.new()
	h.text = title
	h.add_theme_font_size_override("font_size", 25)
	h.add_theme_font_override("font",display_font)
	h.add_theme_color_override("font_color", Color("#f5effb"))
	content.add_child(h)
	var s := Label.new()
	s.text = subtitle
	s.add_theme_color_override("font_color", MUTED)
	content.add_child(s)

func _build_dashboard() -> void:
	if not active_bale.is_empty():
		bale_name_label = Label.new()
		bale_name_label.text = str(active_bale.def.name)
		bale_name_label.add_theme_font_size_override("font_size",25)
		bale_name_label.add_theme_font_override("font",display_font)
		bale_name_label.add_theme_color_override("font_color",Color("#f5effb"))
		content.add_child(bale_name_label)
		bale_weight_label = Label.new()
		bale_weight_label.add_theme_color_override("font_color",MUTED)
		content.add_child(bale_weight_label)
		var close_bale := _action_button("Put bale away", false)
		close_bale.pressed.connect(_close_bale)
		content.add_child(close_bale)
		bale_progress_bar = ProgressBar.new()
		bale_progress_bar.max_value = float(active_bale.def.weight)
		bale_progress_bar.custom_minimum_size.y = 18
		content.add_child(bale_progress_bar)
		if _occupied() >= _capacity():
			_update_active_bale_display()
			_build_placeholder("Storage full","Sell items or upgrade storage before unpacking more.")
			return
		bale_tap_button = Button.new()
		bale_tap_button.custom_minimum_size = Vector2(0,340)
		bale_tap_button.pressed.connect(_click_bale)
		var art_layer := Control.new()
		art_layer.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
		art_layer.mouse_filter = Control.MOUSE_FILTER_IGNORE
		bale_tap_button.add_child(art_layer)
		bale_tap_art = TextureRect.new()
		bale_tap_art.texture = bale_texture
		bale_tap_art.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
		bale_tap_art.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
		bale_tap_art.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
		bale_tap_art.mouse_filter = Control.MOUSE_FILTER_IGNORE
		art_layer.add_child(bale_tap_art)
		var shade := ColorRect.new()
		shade.color = Color(0.06,0.04,0.09,0.38)
		shade.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
		shade.mouse_filter = Control.MOUSE_FILTER_IGNORE
		art_layer.add_child(shade)
		var hint_panel := PanelContainer.new()
		hint_panel.set_anchors_preset(Control.PRESET_BOTTOM_WIDE)
		hint_panel.offset_left = 10
		hint_panel.offset_top = -94
		hint_panel.offset_right = -10
		hint_panel.offset_bottom = -10
		hint_panel.mouse_filter = Control.MOUSE_FILTER_IGNORE
		art_layer.add_child(hint_panel)
		var hint_row := HBoxContainer.new()
		hint_row.add_theme_constant_override("separation",10)
		hint_row.mouse_filter = Control.MOUSE_FILTER_IGNORE
		hint_panel.add_child(hint_row)
		bale_hint_label = Label.new()
		bale_hint_label.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		bale_hint_label.mouse_filter = Control.MOUSE_FILTER_IGNORE
		hint_row.add_child(bale_hint_label)
		bale_rarity_label = Label.new()
		bale_rarity_label.mouse_filter = Control.MOUSE_FILTER_IGNORE
		hint_row.add_child(bale_rarity_label)
		var tap_label := Label.new()
		tap_label.text = "TAP TO UNBOX"
		tap_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
		tap_label.vertical_alignment = VERTICAL_ALIGNMENT_TOP
		tap_label.set_anchors_preset(Control.PRESET_TOP_WIDE)
		tap_label.offset_top = 14
		tap_label.offset_bottom = 46
		tap_label.mouse_filter = Control.MOUSE_FILTER_IGNORE
		tap_label.add_theme_color_override("font_color",Color.WHITE)
		tap_label.add_theme_color_override("font_shadow_color",Color.BLACK)
		tap_label.add_theme_constant_override("shadow_offset_x",1)
		tap_label.add_theme_constant_override("shadow_offset_y",1)
		art_layer.add_child(tap_label)
		content.add_child(bale_tap_button)
		bale_reveal_progress = ProgressBar.new()
		bale_reveal_progress.custom_minimum_size.y = 14
		content.add_child(bale_reveal_progress)
		_update_active_bale_display()
		_build_placeholder("Storage · %d / %d slots" % [_occupied(),_capacity()],"Your Closet and Market share storage space.")
		var closet_button := _action_button("View Closet",false)
		closet_button.pressed.connect(_show_screen.bind("inventory"))
		content.add_child(closet_button)
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
	_save_game()
	_update_coins()
	_show_screen("dashboard")

func _close_bale() -> void:
	active_bale.clear()
	_save_game()
	_show_screen("dashboard")

func _update_active_bale_display() -> void:
	if active_bale.is_empty():
		return
	if is_instance_valid(bale_name_label):
		bale_name_label.text = str(active_bale.def.name)
	if is_instance_valid(bale_weight_label):
		bale_weight_label.text = "%.2f / %.0f kg left" % [float(active_bale.remaining),float(active_bale.def.weight)]
	if is_instance_valid(bale_progress_bar):
		bale_progress_bar.value = float(active_bale.def.weight)-float(active_bale.remaining)
	if is_instance_valid(bale_hint_label) and is_instance_valid(bale_rarity_label) and is_instance_valid(bale_reveal_progress):
		if active_bale.current.is_empty():
			bale_hint_label.text = "Mystery clothing · tap to start unboxing"
			bale_rarity_label.text = ""
			bale_reveal_progress.visible = false
		else:
			var current: Dictionary = active_bale.current
			var template: Dictionary = current.template
			bale_hint_label.text = "Something %s · %d taps left" % ["heavy" if float(template.weight) >= 1.0 else "light",int(current.clicks_left)]
			bale_rarity_label.text = str(template.rarity).capitalize()
			bale_rarity_label.add_theme_color_override("font_color",_rarity_color(str(template.rarity)))
			bale_reveal_progress.max_value = float(current.total_clicks)
			bale_reveal_progress.value = float(current.total_clicks)-float(current.clicks_left)
			bale_reveal_progress.visible = true

func _animate_bale_tap() -> void:
	if not is_instance_valid(bale_tap_button):
		return
	var tween := create_tween()
	tween.tween_property(bale_tap_button,"scale",Vector2(0.97,0.97),0.05)
	tween.tween_property(bale_tap_button,"scale",Vector2.ONE,0.12).set_trans(Tween.TRANS_BACK).set_ease(Tween.EASE_OUT)

func _rarity_color(rarity: String) -> Color:
	match rarity:
		"uncommon": return Color("#63d9a1")
		"rare": return Color("#8a8cff")
		"epic": return Color("#cf75ff")
		"designer": return Color("#e7bb4b")
		_: return MUTED

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
	_animate_bale_tap()
	if active_bale.current.is_empty():
		if active_bale.remaining <= 0.05:
			active_bale.clear()
			_save_game()
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
		_save_game()
		_update_active_bale_display()
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
	_save_game()
	if active_bale.is_empty() or _occupied() >= _capacity():
		_show_screen("dashboard")
	else:
		_update_active_bale_display()
	_show_reward_notice("Found %s · %.1f kg · %s" % [item.name,item.weight,str(item.rarity).capitalize()])

func _variant_count(kind: String) -> int:
	return max(1, _variant_files(kind).size())

func _capacity() -> int:
	return int(STORAGE_CAPACITY[storage_tier])

func _occupied() -> int:
	return inventory.size() + listings.size()

func _build_inventory() -> void:
	_heading("Your Closet","%d / %d slots · %d items in the closet" % [_occupied(),_capacity(),inventory.size()])
	var capacity_bar := ProgressBar.new()
	capacity_bar.max_value = _capacity()
	capacity_bar.value = _occupied()
	capacity_bar.custom_minimum_size.y = 18
	content.add_child(capacity_bar)
	var gallery := _action_button("Designer Collection", false)
	gallery.pressed.connect(_show_screen.bind("gallery"))
	content.add_child(gallery)
	if inventory.is_empty():
		_build_placeholder("🧺 Closet empty","Buy a bale and start unboxing.")
		return
	var grid := GridContainer.new()
	grid.columns = 3
	grid.add_theme_constant_override("h_separation",8)
	grid.add_theme_constant_override("v_separation",8)
	content.add_child(grid)
	for item in inventory:
		var card := _make_inventory_card(item)
		card.pressed.connect(_open_inventory_item.bind(str(item.id)))
		grid.add_child(card)

func _make_inventory_card(item: Dictionary) -> Button:
	var card := Button.new()
	card.custom_minimum_size = Vector2(112,174)
	card.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	card.clip_contents = true
	var rarity := str(item.get("rarity","common"))
	var edge := Color("#40384c")
	if rarity == "designer":
		edge = Color("#e7bb4b")
	elif rarity == "epic":
		edge = Color("#cf75ff")
	elif rarity == "rare":
		edge = Color("#8a8cff")
	var normal := StyleBoxFlat.new()
	normal.bg_color = Color("#1b1825")
	normal.border_color = edge
	normal.set_border_width_all(1)
	normal.set_corner_radius_all(14)
	normal.content_margin_left = 6
	normal.content_margin_right = 6
	normal.content_margin_top = 6
	normal.content_margin_bottom = 6
	card.add_theme_stylebox_override("normal",normal)
	var hover := normal.duplicate() as StyleBoxFlat
	hover.bg_color = Color("#292337")
	hover.set_border_width_all(2)
	card.add_theme_stylebox_override("hover",hover)
	var body := VBoxContainer.new()
	body.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	body.add_theme_constant_override("separation",4)
	body.mouse_filter = Control.MOUSE_FILTER_IGNORE
	card.add_child(body)
	var rarity_label := Label.new()
	rarity_label.text = rarity.capitalize()
	rarity_label.add_theme_font_size_override("font_size",10)
	rarity_label.add_theme_color_override("font_color",edge)
	rarity_label.mouse_filter = Control.MOUSE_FILTER_IGNORE
	body.add_child(rarity_label)
	var art := TextureRect.new()
	art.size_flags_vertical = Control.SIZE_EXPAND_FILL
	art.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	art.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
	art.texture = _item_texture(item)
	art.mouse_filter = Control.MOUSE_FILTER_IGNORE
	if art.texture == null:
		var emoji := Label.new()
		emoji.text = str(item.get("emoji","👕"))
		emoji.add_theme_font_size_override("font_size",34)
		emoji.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
		emoji.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
		emoji.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
		emoji.mouse_filter = Control.MOUSE_FILTER_IGNORE
		art.add_child(emoji)
	body.add_child(art)
	var name_label := Label.new()
	name_label.text = str(item.get("name","Item"))
	name_label.add_theme_font_size_override("font_size",11)
	name_label.text_overrun_behavior = TextServer.OVERRUN_TRIM_ELLIPSIS
	name_label.mouse_filter = Control.MOUSE_FILTER_IGNORE
	body.add_child(name_label)
	var condition := ProgressBar.new()
	condition.max_value = 100
	condition.value = float(item.get("condition",0.0))
	condition.custom_minimum_size.y = 8
	condition.show_percentage = false
	condition.mouse_filter = Control.MOUSE_FILTER_IGNORE
	body.add_child(condition)
	return card

func _open_inventory_item(id: String) -> void:
	selected_item_id = id
	studio_mode = "menu"
	_show_screen("studio")

func _build_studio() -> void:
	_heading("Processing Studio", "Choose an item and prepare it for the marketplace.")
	if selected_item_id == "":
		var laundry := _action_button("Magic Laundry · repair every item with a rewarded ad", false)
		laundry.pressed.connect(_request_reward.bind("magic_laundry"))
		content.add_child(laundry)
		var gallery := _action_button("Designer Collection · 60 pieces", false)
		gallery.pressed.connect(_show_screen.bind("gallery"))
		content.add_child(gallery)
		var grid := GridContainer.new()
		grid.columns = 3
		grid.add_theme_constant_override("h_separation",8)
		grid.add_theme_constant_override("v_separation",8)
		content.add_child(grid)
		for item in inventory:
			var button := _make_inventory_card(item)
			button.pressed.connect(_select_studio_item.bind(str(item.id)))
			grid.add_child(button)
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
		var list_button := _action_button("List on Marketplace", false)
		list_button.pressed.connect(_prepare_listing.bind(str(item.id)))
		content.add_child(list_button)
	var back := _action_button("Back to items", false)
	back.pressed.connect(_clear_studio_selection)
	content.add_child(back)

func _load_designer_catalog() -> void:
	var file := FileAccess.open("res://data/designers.json", FileAccess.READ)
	if file == null:
		return
	var parsed: Variant = JSON.parse_string(file.get_as_text())
	if parsed is not Array:
		return
	for row in parsed:
		if row is Dictionary:
			designer_items.append(row)
			var image_path := "res://assets/designer/" + str(row.id) + ".jpg"
			if FileAccess.file_exists(image_path):
				designer_textures[str(row.id)] = load(image_path)

func _build_gallery() -> void:
	_heading("Studio Gallery", "%d / %d designer pieces discovered" % [discovered_designers.size(),designer_items.size()])
	var back := _action_button("Back to Studio", false)
	back.pressed.connect(_show_screen.bind(gallery_return_screen))
	content.add_child(back)
	var grid := GridContainer.new()
	grid.columns = 3
	grid.add_theme_constant_override("h_separation", 10)
	grid.add_theme_constant_override("v_separation", 10)
	content.add_child(grid)
	for designer in designer_items:
		var owned := discovered_designers.has(str(designer.id))
		var card := Button.new()
		card.custom_minimum_size = Vector2(104,112)
		card.text = "%s\n%s" % [str(designer.emoji) if owned else "🔒",str(designer.name) if owned else "Undiscovered"]
		card.disabled = not owned
		if owned and designer_textures.has(str(designer.id)):
			card.icon = designer_textures[str(designer.id)]
			card.expand_icon = true
		card.pressed.connect(_open_designer_detail.bind(str(designer.id)))
		grid.add_child(card)

func _open_designer_detail(id: String) -> void:
	selected_designer_id = id
	_show_screen("designer_detail")

func _build_designer_detail() -> void:
	var selected: Dictionary = {}
	for designer in designer_items:
		if str(designer.id) == selected_designer_id:
			selected = designer
			break
	if selected.is_empty() or not discovered_designers.has(selected_designer_id):
		selected_designer_id = ""
		_show_screen("gallery")
		return
	_heading(str(selected.name), "Designer piece · %d coins" % int(selected.base_value))
	var texture: Texture2D = designer_textures.get(selected_designer_id)
	if texture:
		var portrait := TextureRect.new()
		portrait.custom_minimum_size = Vector2(0,340)
		portrait.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
		portrait.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
		portrait.texture = texture
		content.add_child(portrait)
	else:
		_build_placeholder(str(selected.emoji), "Original fallback art")
	_build_placeholder("Designer item", str(selected.description))
	var back := _action_button("Back to Gallery", false)
	back.pressed.connect(func():
		selected_designer_id = ""
		_show_screen("gallery")
	)
	content.add_child(back)

func _award_random_designer() -> Dictionary:
	if designer_items.is_empty() or _occupied() >= _capacity():
		return {}
	var designer: Dictionary = designer_items[randi_range(0,designer_items.size()-1)]
	var item := {
		"id":str(Time.get_unix_time_from_system())+"-"+str(randi()),
		"kind":"jacket","designer_id":str(designer.id),"name":str(designer.name),"emoji":str(designer.emoji),
		"weight":float(designer.weight),"base_value":int(designer.base_value),"rarity":"designer",
		"condition":randf_range(70.0,95.0),"photo_quality":0.0,
		"washed":false,"ironed":false,"photographed":false
	}
	inventory.append(item)
	if not discovered_designers.has(str(designer.id)):
		discovered_designers.append(str(designer.id))
	_save_game()
	return item

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
	if OS.has_feature("android") and ads_consent_ready and pending_reward_slot == "":
		interstitial_elapsed += delta
		if interstitial_elapsed >= INTERSTITIAL_INTERVAL:
			interstitial_elapsed = 0.0
			if interstitial_ad_loaded:
				interstitial_ad_loaded = false
			admob.call("show_interstitial_ad")
			else:
			interstitial_show_pending = true
			_load_mobile_ads()
	if reward_preview_remaining >= 0.0:
		reward_preview_remaining = maxf(0.0,reward_preview_remaining-delta)
		reward_preview_bar.value = 5.0-reward_preview_remaining
		if reward_preview_remaining == 0.0:
			reward_preview_remaining = -1.0
			(ad_overlay.get_meta("preview") as Control).visible = false
			var slot := pending_reward_slot
			pending_reward_slot = ""
			_grant_ad_reward(slot)
	if reward_notice_timer > 0.0:
		reward_notice_timer = maxf(0.0,reward_notice_timer-delta)
		if reward_notice_timer == 0.0:
			reward_notice.visible = false
	if pending_reward_slot == "" and (OS.has_feature("android") or OS.has_feature("editor")):
		register_elapsed += delta
		designer_elapsed += delta
		if register_visible_timer > 0.0:
			register_visible_timer = maxf(0.0,register_visible_timer-delta)
			register_ad_button.text = "✦\n%d s" % ceili(register_visible_timer)
			register_ad_button.visible = register_visible_timer > 0.0
		elif register_elapsed >= 300.0:
			register_elapsed = 0.0
			register_visible_timer = 20.0
			register_ad_button.visible = true
		if designer_visible_timer > 0.0:
			designer_visible_timer = maxf(0.0,designer_visible_timer-delta)
			designer_ad_button.text = "💎\n%d s" % ceili(designer_visible_timer)
			designer_ad_button.visible = designer_visible_timer > 0.0
		elif designer_elapsed >= 900.0:
			designer_elapsed = 0.0
			designer_visible_timer = 10.0
			designer_ad_button.visible = true
	if current_screen == "market":
		market_timer += delta
		gift_timer += delta
		if gift_timer >= 10.0:
			gift_timer = 0.0
			if randf() < 0.05:
				gift_open = true
				_show_screen("market")
		if market_timer >= 2.5:
			market_timer = 0.0
			_tick_market()
	if studio_mode != "wash" and studio_mode != "iron":
		return
	process_value += process_direction * delta * (2.2 if studio_mode == "wash" else 1.4)
	if process_value >= 1.0:
		process_value = 1.0
		process_direction = -1.0
	elif process_value <= 0.0:
		process_value = 0.0
		process_direction = 1.0
	if is_instance_valid(timing_bar):
		timing_bar.value = process_value * 100.0

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
	_save_game()
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
	selected_lighting = 50.0
	selected_backdrop_quality = 30.0
	var title := Label.new()
	title.text = "Backdrop and lighting · cap %d%%" % int(_lights_cap())
	content.add_child(title)
	photo_preview_panel = PanelContainer.new()
	photo_preview_panel.custom_minimum_size.y = 270
	var preview_style := StyleBoxFlat.new()
	preview_style.bg_color = Color("#f2f0ed")
	preview_style.set_corner_radius_all(18)
	photo_preview_panel.add_theme_stylebox_override("panel",preview_style)
	content.add_child(photo_preview_panel)
	var preview_image := TextureRect.new()
	preview_image.custom_minimum_size = Vector2(0,250)
	preview_image.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	preview_image.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
	preview_image.texture = _item_texture(item)
	if preview_image.texture == null:
		var fallback := Label.new()
		fallback.text = str(item.emoji)
		fallback.add_theme_font_size_override("font_size",72)
		fallback.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
		fallback.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
		fallback.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
		preview_image.add_child(fallback)
	photo_preview_panel.add_child(preview_image)
	var light_slider := HSlider.new()
	light_slider.min_value = 0
	light_slider.max_value = 100
	light_slider.value = 50
	light_slider.custom_minimum_size.y = 42
	light_slider.value_changed.connect(_set_photo_lighting)
	content.add_child(light_slider)
	var backdrops := HBoxContainer.new()
	backdrops.add_theme_constant_override("separation",6)
	content.add_child(backdrops)
	for backdrop in [{"id":"white","quality":30.0},{"id":"studio","quality":60.0},{"id":"nature","quality":80.0},{"id":"neon","quality":95.0}]:
		var choice := _action_button(str(backdrop.id).capitalize(), false)
		choice.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		choice.pressed.connect(_select_photo_backdrop.bind(str(backdrop.id),float(backdrop.quality)))
		backdrops.add_child(choice)
	photo_quality_label = Label.new()
	photo_quality_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	content.add_child(photo_quality_label)
	_update_photo_quality()
	var shoot := _action_button("SHOOT · save this photo", false)
	shoot.pressed.connect(_take_photo.bind(str(item.id)))
	content.add_child(shoot)

func _set_photo_lighting(value: float) -> void:
	selected_lighting = value
	_update_photo_quality()

func _select_photo_backdrop(backdrop_id: String, quality: float) -> void:
	selected_backdrop_quality = quality
	var colors := {"white":Color("#f2f0ed"),"studio":Color("#211d2b"),"nature":Color("#315f49"),"neon":Color("#752aa2")}
	var preview_style := StyleBoxFlat.new()
	preview_style.bg_color = colors.get(backdrop_id,Color("#211d2b"))
	preview_style.set_corner_radius_all(18)
	photo_preview_panel.add_theme_stylebox_override("panel",preview_style)
	_update_photo_quality()

func _update_photo_quality() -> void:
	if is_instance_valid(photo_quality_label):
		var quality := minf(_lights_cap(),selected_backdrop_quality*0.6+selected_lighting*0.4)
		photo_quality_label.text = "Estimated photo quality · %d%%" % int(quality)

func _take_photo(item_id: String) -> void:
	for item in inventory:
		if str(item.id) == item_id:
			item.photo_quality = minf(_lights_cap(),selected_backdrop_quality*0.6+selected_lighting*0.4)
			item.photographed = true
	_save_game()
	studio_mode = "menu"
	_show_screen("studio")

func _build_market() -> void:
	_heading("Marketplace", "%d active · %d sales · reputation %d%% · slots %d/%d" % [listings.size(),total_sales,int(_reputation_pct()),_occupied(),_capacity()])
	_build_placeholder("Listing fee: %s" % ("Free" if free_uploads > 0 or webshop_unlocked else "5 coins"), "Price items from Studio. Sales resolve every 2.5 seconds.")
	if gift_open:
		var gift := _action_button("Claim 5 free listings", false)
		gift.pressed.connect(_claim_market_gift)
		content.add_child(gift)
	else:
		_build_placeholder("Free listings: %d" % free_uploads, "An occasional marketplace gift provides five uploads.")
	if pending_market_item_id != "":
		var item := _inventory_item(pending_market_item_id)
		if not item.is_empty():
			var price := SpinBox.new()
			price.min_value = 1
			price.step = 5
			price.max_value = int(item.base_value) * 3
			price.value = maxf(5.0,round(float(item.base_value) * (float(item.condition) / 100.0) * (0.7 + float(item.photo_quality) / 100.0 * 0.6)))
			content.add_child(price)
			var quote := Label.new()
			quote.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
			content.add_child(quote)
			var list := _action_button("Confirm listing", false)
			price.value_changed.connect(_update_listing_quote.bind(list,quote,item))
			_update_listing_quote(price.value,list,quote,item)
			list.pressed.connect(_list_item.bind(str(item.id),price))
			content.add_child(list)
		var cancel := _action_button("Cancel", false)
		cancel.pressed.connect(_cancel_pending_listing)
		content.add_child(cancel)
	for listing in listings:
		var row := HBoxContainer.new()
		var item: Dictionary = listing.item
		var thumbnail := TextureRect.new()
		thumbnail.custom_minimum_size = Vector2(56,56)
		thumbnail.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
		thumbnail.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
		thumbnail.texture = _item_texture(item)
		row.add_child(thumbnail)
		var info := Label.new()
		info.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		var ratio := float(item.base_value) / maxf(1.0,float(listing.price))
		var fairness := "Fair" if ratio > 0.85 else ("Pricey" if ratio > 0.55 else "Overpriced")
		info.text = "%s · %d coins · %s\nCond %d%% · Photo %d%% · %d/30 ticks" % [item.name,int(listing.price),fairness,int(item.condition),int(item.photo_quality),int(listing.ticks)]
		row.add_child(info)
		var progress := ProgressBar.new()
		progress.custom_minimum_size = Vector2(54,18)
		progress.max_value = 30
		progress.value = mini(30,int(listing.ticks))
		row.add_child(progress)
		var pull := _action_button("Pull", false)
		pull.pressed.connect(_unlist_item.bind(str(listing.id)))
		row.add_child(pull)
		content.add_child(row)
	if listings.is_empty():
		_build_placeholder("No active listings", "Choose a prepared item from Studio.")

func _prepare_listing(id: String) -> void:
	if _inventory_item(id).is_empty():
		return
	selected_item_id = ""
	studio_mode = "menu"
	pending_market_item_id = id
	_show_screen("market")

func _update_listing_quote(price: float, action: Button, quote: Label, item: Dictionary) -> void:
	var ratio := float(item.base_value) / maxf(1.0,price)
	var fairness := "Fair price" if ratio > 0.85 else ("Pricey · slower sale" if ratio > 0.55 else "Overpriced · slow sale")
	var color := Color("#69d89a") if ratio > 0.85 else (Color("#f1c75b") if ratio > 0.55 else Color("#ee747d"))
	quote.text = "%s · base value %d coins" % [fairness,int(item.base_value)]
	quote.add_theme_color_override("font_color",color)
	action.text = "List for %d coins" % int(price)

func _inventory_item(id: String) -> Dictionary:
	for item in inventory:
		if str(item.id) == id:
			return item
	return {}

func _list_item(id: String, price_control: SpinBox) -> void:
	var item := _inventory_item(id)
	if item.is_empty() or _occupied() > _capacity():
		_show_reward_notice("This item can no longer be listed")
		return
	var use_free := free_uploads > 0
	var fee := 0 if use_free or webshop_unlocked else 5
	if coins < fee:
		_show_reward_notice("Need %d coins for the listing fee" % fee)
		return
	coins -= fee
	if use_free:
		free_uploads -= 1
	var price := clampi(int(price_control.value),1,maxi(1,int(item.base_value)*3))
	listings.append({"id":str(Time.get_unix_time_from_system())+str(randi()),"item":item.duplicate(true),"price":price,"listed_at":Time.get_unix_time_from_system(),"ticks":0})
	inventory.erase(item)
	_save_game()
	pending_market_item_id = ""
	_update_coins()
	_show_screen("market")
	_show_reward_notice("Listed %s for %d coins" % [str(item.name),price])

func _cancel_pending_listing() -> void:
	pending_market_item_id = ""
	_show_screen("market")

func _unlist_item(id: String) -> void:
	for listing in listings:
		if str(listing.id) == id:
			var returned_name := str(listing.item.name)
			inventory.append(listing.item)
			listings.erase(listing)
			_save_game()
			_show_screen("market")
			_show_reward_notice("Listing pulled · %s returned to Closet" % returned_name)
			return

func _tick_market() -> void:
	if listings.is_empty():
		return
	var remaining: Array[Dictionary] = []
	var sold_count := 0
	var earned := 0
	var speed := (1.0 + total_sales * 0.001) * (1.15 if webshop_unlocked else 1.0)
	for listing in listings:
		listing.ticks = int(listing.ticks) + 1
		var item: Dictionary = listing.item
		var ratio := float(item.base_value) / maxf(1.0,float(listing.price))
		var condition_factor := float(item.condition) / 100.0
		var photo_factor := 0.5 + float(item.photo_quality) / 200.0
		var chance := clampf(ratio * condition_factor * photo_factor / reputation * 0.05 * speed,0.005,0.6)
		if randf() < chance:
			sold_count += 1
			earned += int(listing.price)
		else:
			remaining.append(listing)
	listings = remaining
	if sold_count > 0:
		coins += earned
		var old_milestone := int(total_sales / 100)
		total_sales += sold_count
		var boost := int(total_sales / 100) - old_milestone
		reputation = maxf(0.5,reputation - boost * 0.01)
		_update_coins()
	_save_game()
	if current_screen == "market":
		_show_screen("market")
	if sold_count > 0:
		_show_reward_notice("Market sale · %d item%s · +%d coins" % [sold_count,"" if sold_count == 1 else "s",earned])

func _claim_market_gift() -> void:
	free_uploads += 5
	gift_open = false
	_save_game()
	_show_screen("market")
	_show_reward_notice("Marketplace Gift · 5 free listings")

func _unlock_webshop() -> void:
	if webshop_unlocked or coins < 5000 or _reputation_pct() < 30.0:
		return
	coins -= 5000
	webshop_unlocked = true
	_save_game()
	_update_coins()
	_show_screen(current_screen)
	_show_reward_notice("Webshop unlocked · free listings and faster sales")

func _reputation_pct() -> float:
	return (1.0 - (reputation - 0.5) / 0.5) * 100.0

func _save_game() -> void:
	var save := ConfigFile.new()
	save.set_value("game", "schema_version", SAVE_VERSION)
	save.set_value("game", "coins", coins)
	save.set_value("game", "inventory", inventory)
	save.set_value("game", "listings", listings)
	save.set_value("game", "total_sales", total_sales)
	save.set_value("game", "reputation", reputation)
	save.set_value("game", "free_uploads", free_uploads)
	save.set_value("game", "webshop_unlocked", webshop_unlocked)
	save.set_value("game", "storage_tier", storage_tier)
	save.set_value("game", "active_bale", active_bale)
	save.set_value("game", "upgrade_levels", upgrade_levels)
	save.set_value("game", "discovered_designers", discovered_designers)
	var current_path := ProjectSettings.globalize_path("user://savegame.cfg")
	var backup_path := ProjectSettings.globalize_path("user://savegame.bak")
	var existing := ConfigFile.new()
	if FileAccess.file_exists("user://savegame.cfg") and existing.load("user://savegame.cfg") == OK:
		DirAccess.copy_absolute(current_path,backup_path)
	save.save("user://savegame.cfg")

func _load_game() -> void:
	var save := ConfigFile.new()
	if save.load("user://savegame.cfg") != OK:
		var backup := ConfigFile.new()
		if backup.load("user://savegame.bak") != OK:
			return
		save = backup
	if int(save.get_value("game","schema_version",0)) > SAVE_VERSION:
		return
	coins = maxi(0,int(save.get_value("game", "coins", coins)))
	total_sales = maxi(0,int(save.get_value("game", "total_sales", total_sales)))
	reputation = clampf(float(save.get_value("game", "reputation", reputation)),0.5,1.0)
	free_uploads = maxi(0,int(save.get_value("game", "free_uploads", free_uploads)))
	webshop_unlocked = bool(save.get_value("game", "webshop_unlocked", webshop_unlocked))
	var loaded_tier := str(save.get_value("game", "storage_tier", storage_tier))
	if STORAGE_CAPACITY.has(loaded_tier):
		storage_tier = loaded_tier
	var saved_inventory: Variant = save.get_value("game", "inventory", [])
	if saved_inventory is Array:
		for row in saved_inventory:
			if row is Dictionary:
				inventory.append(row)
	var saved_listings: Variant = save.get_value("game", "listings", [])
	if saved_listings is Array:
		for row in saved_listings:
			if row is Dictionary and row.get("item", {}) is Dictionary:
				listings.append(row)
	var saved_bale: Variant = save.get_value("game", "active_bale", {})
	if saved_bale is Dictionary and saved_bale.get("def", {}) is Dictionary:
		active_bale = saved_bale
	var saved_upgrades: Variant = save.get_value("game", "upgrade_levels", {})
	if saved_upgrades is Dictionary:
		for key in ["washer","iron","lights"]:
			upgrade_levels[key] = clampi(int(saved_upgrades.get(key,0)),0,3)
	var saved_designers: Variant = save.get_value("game", "discovered_designers", [])
	if saved_designers is Array:
		for designer_id in saved_designers:
			if designer_id is String and not discovered_designers.has(designer_id):
				discovered_designers.append(designer_id)

func _build_shop() -> void:
	_heading("Shop", "Storage and equipment upgrades.")
	if webshop_unlocked:
		_build_placeholder("Webshop active", "Listings are free and sales resolve 15% faster.")
	else:
		var webshop := _action_button("Webshop · 5,000 coins · requires 30% reputation", coins < 5000 or _reputation_pct() < 30.0)
		webshop.pressed.connect(_unlock_webshop)
		content.add_child(webshop)
	_build_placeholder("Storage", "Upgrade one tier at a time to expand your closet.")
	for tier in ["closet","room","garage","container"]:
		var rank := _tier_rank(tier)
		var owned := rank <= _tier_rank(storage_tier)
		var next_tier := rank == _tier_rank(storage_tier) + 1
		var price_label := "Owned" if owned else "%d coins" % STORAGE_COST[tier]
		var label := "%s · %d slots · %s" % [tier.capitalize(),STORAGE_CAPACITY[tier],price_label]
		var card := _action_button(label, owned or not next_tier or coins < STORAGE_COST[tier])
		card.pressed.connect(_buy_storage.bind(tier))
		content.add_child(card)
	_build_placeholder("Equipment", "Each upgrade improves a Studio action.")
	var defs := [
		{"key":"washer","name":"Washing Machine","effect":"Widens the wash timing zone.","levels":[{"label":"Hand wash","cost":0},{"label":"Basic Washer","cost":250},{"label":"Pro Washer","cost":1200},{"label":"Industrial","cost":4000}]},
		{"key":"iron","name":"Steam Iron","effect":"Adds condition after a well-timed press.","levels":[{"label":"No iron","cost":0},{"label":"Basic Iron","cost":350},{"label":"Steam Iron","cost":1500},{"label":"Studio Press","cost":5000}]},
		{"key":"lights","name":"Studio Lights","effect":"Raises the maximum photo quality.","levels":[{"label":"Phone flash","cost":0},{"label":"Ring Light","cost":400},{"label":"Softbox","cost":1800},{"label":"Pro Studio","cost":6000}]}
	]
	for definition in defs:
		var key: String = definition.key
		var level := clampi(int(upgrade_levels.get(key,0)),0,3)
		var current: Dictionary = definition.levels[level]
		var next_text := "MAX LEVEL" if level >= 3 else "%s · %d coins" % [definition.levels[level+1].label,definition.levels[level+1].cost]
		var button := _action_button("%s · Lv %d · %s\n%s → %s" % [definition.name,level,str(definition.effect),current.label,next_text], level >= 3 or (level < 3 and coins < int(definition.levels[level+1].cost)))
		button.pressed.connect(_buy_equipment.bind(key,int(definition.levels[level+1].cost) if level < 3 else 0))
		content.add_child(button)
	var reset := _action_button("Reset all progress", false)
	reset.pressed.connect(_confirm_reset_progress)
	content.add_child(reset)

func _buy_equipment(key: String, cost: int) -> void:
	if int(upgrade_levels.get(key,0)) >= 3 or coins < cost:
		return
	coins -= cost
	upgrade_levels[key] = int(upgrade_levels[key])+1
	_save_game()
	_update_coins()
	_show_screen("shop")

func _buy_storage(tier: String) -> void:
	if not STORAGE_COST.has(tier) or _tier_rank(tier) != _tier_rank(storage_tier) + 1 or coins < STORAGE_COST[tier]:
		return
	coins -= STORAGE_COST[tier]
	storage_tier = tier
	_save_game()
	_update_coins()
	_show_screen("shop")

func _confirm_reset_progress() -> void:
	var dialog := ConfirmationDialog.new()
	dialog.title = "Reset all progress?"
	dialog.dialog_text = "Coins, items, listings, upgrades and discoveries will be cleared."
	dialog.confirmed.connect(func():
		_reset_progress()
		dialog.queue_free()
	)
	dialog.canceled.connect(dialog.queue_free)
	add_child(dialog)
	dialog.popup_centered()

func _reset_progress() -> void:
	coins = 350
	inventory.clear()
	listings.clear()
	total_sales = 0
	reputation = 1.0
	free_uploads = 0
	webshop_unlocked = false
	storage_tier = "closet"
	active_bale.clear()
	discovered_designers.clear()
	upgrade_levels = {"washer":0,"iron":0,"lights":0}
	selected_item_id = ""
	selected_designer_id = ""
	pending_market_item_id = ""
	gift_open = false
	_save_game()
	_update_coins()
	_show_screen("dashboard")

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
	if item.has("designer_id"):
		return designer_textures.get(str(item.designer_id))
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
