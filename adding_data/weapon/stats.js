// window.addEventListener('weapon_pressed', e => add_stats(e.detail))
class Wep_stats {
    constructor (unique_id) {
        this.#unique_item = clarity_user_data[unique_id]
        this.#static_item = clarity_manifest[this.#unique_item.id]
    }

    all_perk_ids = []
    perk_ids = []

    stats = {}
    subtracted_stats = {}

    range_reload = {}
    /**
     ** Creates perk list for given location
     * @param {string} list_type Options Active, selected, preview, compare
     */
    create_perk_list(list_type) {
        if(list_type == 'active') {
            this.all_perk_ids = [
                ...this.#unique_item.sockets.perks.active.map(perk_id => {
                    return ['perk', perk_id]
                }),
                ['frame', this.#static_item.sockets.frame],
                ['mod', this.#unique_item.sockets.mod],
                ['masterwork', this.#unique_item.sockets.masterwork]
            ]
        }
        if(list_type == 'selected') {
            this.all_perk_ids = [
                ...document.querySelector('.Clarity_weapon_perks_box')
                ?.querySelectorAll('.Clarity_active:not(.Clarity_disable), .Clarity_selected')
                .map(perk_id => {
                    return ['perk', perk_id]
                }) || [],

                ['frame', this.#static_item.sockets.frame],
                ['mod', this.#unique_item.sockets.mod],
                ['masterwork', this.#unique_item.sockets.masterwork]
            ]
        }
        // if(list_type == 'preview') {
        // }
        // if(list_type == 'compare') {
        // }
        return this
    }
    /**
     ** Removes selected perks from list created using 'create_perk_list' function
     * @param {array} list Options [perk id, frame, mod, masterwork]
     */
    remove_perks(list) {
        this.perk_ids = all_perk_ids.filter(([type, id]) =>
            list.find(val => val != type || val != id) // true then not in list
        )
        .map(([type, id]) => id) // remove type its no longer needed
        return this
    }
    calculate_stats(list_type) {
        // let perk_list = this.create_perk_list(type_list)

        // if(subtract) return get_item_stats(this.#static_item, perk_list)

        this.stats = get_item_stats(this.#static_item, this[list_type])
        return this
    }

    /**
     * Rounds stats
     * @param {string} option stats, subtracted_stats
     * @returns Rounded stats
     */
    round_stats(option) {
        return Object.entries(this[option])
        .reduce((acc, [id, value]) =>
            ({
                ...acc, [id]: parseFloat(value.toFixed(0))
            }), {}
        )
    }
    // calculate_stats(type_list, subtract) {
    //     let perk_list = this.create_perk_list(type_list)

    //     if(subtract) return get_item_stats(this.#static_item, perk_list)

    //     this.stats = get_item_stats(this.#static_item, perk_list)
    //     return this
    // }
    subtract_stats(type_list) {
        this.subtracted_stats = Object.entries(
            this.calculate_stats(type_list, true)
        )
        .reduce(
            (acc, [id, value]) => ({ ...acc, [id]: acc[id] -= value}), {...this.stats}
        )
        return this
    }
    add_range_reload() {
        this.range_reload = {
            range: parseFloat(
                range_calculator(this.#static_item, this.stats, this.all_perk_ids)?.ADS_max.toFixed(1)
            ),
            reload: parseFloat(
                reload_calculator(this.#static_item, this.stats, this.all_perk_ids)?.default.toFixed(1)
            )
        }
        return this.range_reload
    }
}
function add_stats(unique_id) {


    function stat_bar_place(id, data, stats) {
        if(data.bar_type == 'stat_bar') return {
            className: 'clarity_stat_bar',
            append: [
                {
                    set_attribute: [
                        {name: `stat-bar`, value: `${id} base`}
                    ],
                    className: `clarity_stat_bar_perks`,
                    style: `width: ${stats.perks[id]}%`
                },
                {
                    set_attribute: [
                        {name: `stat-bar`, value: `${id} mod`}
                    ],
                    className: `clarity_stat_bar_mod`,
                    style: `width: ${stats.mod[id]}%`
                },
                {
                    set_attribute: [
                        {name: `stat-bar`, value: `${id} masterwork`}
                    ],
                    className: `clarity_stat_bar_masterwork`,
                    style: `width: ${stats.masterwork[id]}%`
                }
            ]
        }
        if(data.bar_type == 'stat_letter') return {
            className: (stats.masterwork[id] && stats.masterwork[id] != 0) ? ' Clarity_masterwork' : '',
            textContent: data.letter
        }
        if(data.bar_type == 'stat_svg') {
            let stat = stats.all[id]

            const xr = 1 + Math.cos((-20 - stat * 0.6) * Math.PI / 180),
                  yr = 1 + Math.sin((-20 - stat * 0.6) * Math.PI / 180),
                  xl = 2 - xr,
                  x = Math.sin((5 + stat) * Math.PI / 10) * (100 - stat)

            return {
                ele_ns: {ns: 'http://www.w3.org/2000/svg', type: 'svg'},
                className: 'clarity_stat_svg',
                set_attribute: [
                    {name: 'height', value: '12'},
                    {name: 'viewBox', value: '0 0 2 1'}
                ],
                append: [
                    {
                        ele_ns: {ns: 'http://www.w3.org/2000/svg', type: 'circle'},
                        set_attribute: [
                            {name: 'cx',   value: '1'},
                            {name: 'cy',   value: '1'},
                            {name: 'r',    value: '1'},
                            {name: 'fill', value: '#333333'},
                        ],
                    },
                    {
                        ele_ns: {ns: 'http://www.w3.org/2000/svg', type: 'path'},
                        style: `transform: rotate(${x * 0.8}deg); transform-origin: 50% 100%;`,
                        set_attribute: [
                            {name: 'd', value: `M 1 1 L ${xl} ${yr} A 1 1 0 0 1 ${xr} ${yr} Z`},
                            {name: 'fill', value: '#fff'}
                        ]
                    }
                ]
            }
        }
    }
    const stat_order = clarity_random_data.stat_order
    const stat_names = clarity_random_data.stat_names

    let wep_stats = new Wep_stats()
    const stats = {
        all:        {...wep_stats.calculate_stats(['frame', perks_from, 'mod', 'masterwork']).round_stats('stats'), ...wep_stats.add_range_reload()},
        mod:        wep_stats.subtract_stats( ['frame', perks_from,        'masterwork']).subtracted_stats,
        masterwork: wep_stats.subtract_stats( ['frame', perks_from, 'mod',             ]).subtracted_stats,
        perks:      wep_stats.calculate_stats(['frame', perks_from                     ]).stats,
    }
    const stats = {
        all: {
            ...wep_stats.create_perk_list('active')
            .calculate_stats('all_perk_ids')
            .round_stats('stats'),
            ...wep_stats.add_range_reload()
        },
        mod: wep_stats.remove_perks('mod')
        .calculate_stats('all_perk_ids'),
        masterwork: wep_stats.subtract_stats( ['frame', perks_from, 'mod',             ]).subtracted_stats,
        perks:      wep_stats.calculate_stats(['frame', perks_from                     ]).stats,
    }
    let weapon_stats = fragment_creator([
        {
            className: 'Clarity_weapon_stats',
            append: stat_order.flatMap(([id, value]) => {
                if(!stats.all[id]) return []
                return [
                    {
                        className: `clarity_stat_name${(stats.masterwork[id] && stats.masterwork[id] != 0) ? ' Clarity_masterwork' : ''}`,
                        textContent: stat_names[id],
                    },
                    {
                        set_attribute: [
                            {name: `stat-value`, value: id}
                        ],
                        className: `clarity_stat_value${(stats.masterwork[id] && stats.masterwork[id] != 0) ? ' Clarity_masterwork' : ''}`,
                        textContent: stats.all[id]
                    },
                    stat_bar_place(id, value, stats)
                ]
            }).filter(data => data)
        }
    ]

    )
    let stats_location = local_storage('clarity_settings').class_names.locations.item_info.stats
    let location = document.querySelector(stats_location)?.parentElement || document.querySelector('.Clarity_weapon_stats')
    location?.replaceWith(weapon_stats)

    return wep_stats
}
