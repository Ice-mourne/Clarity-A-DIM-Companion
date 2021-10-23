let DIMs_stalker = new MutationObserver((_, rageQuit) =>{
    let DIM_Detailed_Item_Explanations = document.getElementsByClassName('item')[0]
    if (DIM_Detailed_Item_Explanations){
        let jd = local_get('clarity_locations')
	    let nr = local_get('clarity_settings').version
        if (jd) {
            start_looking_for_clicks(jd.stuff)
        } else {window.addEventListener('storage', () => {
            if (jd) {
                start_looking_for_clicks(jd.stuff)
            }
        })}
        rageQuit.disconnect()
    }
})
DIMs_stalker.observe(document, {
    childList: true,
    subtree: true
})
function start_looking_for_clicks(jd) {
    document.getElementById('app').addEventListener('click', event => {
        let unique_id 
        function get_unique_id(target, x) {
            if (target.classList.contains('item') && target.id) unique_id = target.id
            if (x < 2) get_unique_id(target.parentElement, x + 1)
        }
        get_unique_id(event.target, 0)
        if (unique_id  > 99999999) add_item_info(unique_id, jd)
    })
}
function add_item_info(unique_id, jd) {
    data_base = local_get('clarity_data')
    if (!data_base[unique_id]) return // if unique id is not in data base return
    if (data_base[unique_id].item_type == 'weapon') add_info_to_weapon()
    if (data_base[unique_id].item_type == 'armor')  add_info_to_armor()
    function add_info_to_weapon() {
        let extra_stat_box = document.createDocumentFragment()
        if(data_base[unique_id].stats.extra_stats) data_base[unique_id].stats.extra_stats.forEach(stat => {
            let extra_stat_name = element_creator('div', {'className': 'Clarity_weapon_stat_name', 'textContent': stat.name})
            let extra_stat_value = element_creator('div', {'className': 'Clarity_weapon_stat_value', 'textContent': stat.value})
            let extra_stat_letter = element_creator('div', {'textContent': stat.letter})
            extra_stat_box.append(extra_stat_name, extra_stat_value, extra_stat_letter)
        })
        document.querySelector(jd.weapon_stats).append(extra_stat_box)
        // - - - - - - - - - - - - - - - - - - - -
        let main_box = element_creator('div', {'className': 'Clarity_main_box'})
        data_base[unique_id].perks.perks.forEach(add_perk_list)
        function add_perk_list(perk_list) {
            let perk_list_  = element_creator('div', {'className': 'Clarity_perk_list'  })
            let description = element_creator('div', {'className': 'Clarity_description'})
            perk_list_.append(description)
            perk_list.forEach(x => {add_perk(x, perk_list_)})
            main_box.append(perk_list_)
            description.addEventListener('click', event => { // remove description on description press
                event.currentTarget.textContent = ''
                event.currentTarget.parentElement.querySelectorAll('.Clarity_perk').forEach(p => p.classList.remove('Clarity_selected', 'Clarity_disable'))
            })
        }
        function add_perk(perk, element) {
            let class_name = (data_base[unique_id].perks.active_perks.indexOf(perk.id) != -1) ? 'Clarity_perk Clarity_active' : 'Clarity_perk'
            let perk_ = element_creator('div', {'className': class_name})
            add_to_perk_box(perk, perk_)
            element.append(perk_)
            perk_.addEventListener('click', event => { // add remove description on perk press
                const current = event.currentTarget
                if (current.classList.contains('Clarity_selected')) {
                    current.parentElement.firstChild.textContent = ''
                    current.classList.remove('Clarity_selected')
                    current.parentElement.querySelector('.Clarity_active').classList.remove('Clarity_disable')
                } else {
                    current.parentElement.querySelectorAll('.Clarity_perk').forEach(p => p.classList.remove('Clarity_selected', 'Clarity_disable'))
                    current.parentElement.firstChild.innerHTML = perk.description
                    if (!current.classList.contains('Clarity_active')) {
                        current.classList.add('Clarity_selected')
                        current.parentElement.querySelector('.Clarity_active').classList.add('Clarity_disable')
                    } else {current.classList.add('Clarity_selected')}
                }
            })
        }
        function add_to_perk_box(perk, element) {
            let icon_container = element_creator('div', {'className': 'Clarity_icon_container'})
            let icon           = element_creator('img', {'src': `https://www.bungie.net/common/destiny2_content/icons/${perk.icon}`})
            icon_container.append(icon)
            let name = element_creator('div', {'className': 'Clarity_perk_name', 'textContent': perk.name})
            element.append(icon_container, name)
        }
        let all_perks_mods = document.getElementsByClassName('item-details-body')[0] //--- fixed
        document.querySelector(jd.all_weapon_perks).remove()
        all_perks_mods.append(main_box)

        document.querySelector('.ItemSocketsWeapons-m_perks-EeOP2').remove()
    }
    function add_info_to_armor() {
        if(data_base[unique_id].tier != 'Exotic') return
        let perk = data_base[unique_id].perk
        let main_box = element_creator('div', {'className': 'Clarity_armor_perk_box'})
        let img = element_creator('img', {'className': 'Clarity_armor_perk_icon', 'src': `https://www.bungie.net/common/destiny2_content/icons/${perk.icon}`})
        let name = element_creator('div', {'className': 'Clarity_armor_perk_name', 'textContent': perk.name})
        let description = element_creator('div', {'className': 'Clarity_armor_perk_description'})
        description.innerHTML = perk.description

        main_box.append(img, name, description)
        document.querySelector(jd.armor_description).remove()
        let before = document.querySelector('.item-details.sockets')
        document.getElementsByClassName('item-details-body')[0].insertBefore(main_box, before) //--- fixed
    }
    document.getElementsByClassName('fa-balance-scale-left')[0].parentElement.addEventListener('click', _ => {
        let id
        setTimeout(() => {
            add_stats_to_compare_window()
            add_stat_names_compare_window()
            let compare_window = new MutationObserver((_o, quit) => {
                add_stats_to_compare_window()
            })
            compare_window.observe(document.querySelector('.Compare-m_items-S_m9M'), {
                childList: true
            })
        }, 50)
        function add_stats_to_compare_window() {
            document.querySelector('.sheet-close').firstChild.addEventListener('click', () => {return}) // then quit button pressed return // fixes error
            document.querySelector('.loadout-drawer.compare').querySelectorAll('.compare-item').forEach(item => {
                let stat_value = document.createDocumentFragment()
                id = item.querySelector('.CompareItem-m_itemAside-W9Gi3')?.firstChild.firstChild.id
                data_base[id]?.stats.extra_stats.forEach(stat => {
                    let extra_stat_value = element_creator('div', {'className': 'Clarity_check', 'textContent': `${stat.value} ${stat.letter}`})
                    stat_value.append(extra_stat_value)
                })
                if (!item.querySelector('.Clarity_check')) item.insertBefore(stat_value, item.lastChild)
            })
        }
        function add_stat_names_compare_window() {
            let stat_name = document.createDocumentFragment()
            data_base[id].stats.extra_stats.forEach(stat => {
                let extra_stat_name = element_creator('div', {'className': 'Clarity_compare_stat_name', 'textContent': stat.name})
                stat_name.append(extra_stat_name)
            })
            document.querySelector('.loadout-drawer.compare').querySelector('.compare-item.Compare-m_fixedLeft-UsPPD').append(stat_name)
        }
    })
}


/*
    -------------------main box-------------------------------------------------------------
    -  ______________________________perk list__________________________________________   -
    - |    ___perk___                                                                   |  -
    - |   |  -img--  |                                                                  |  -
    - |   |  |    |  |  perk name                                                       |  -
    - |   |  |____|  |                                                                  |  -
    - |   |__________|                                                                  |  -
    - |_________________________________________________________________________________|  -
    -  ______________________________perk list__________________________________________   -
    - |    ___perk___                                                                   |  -
    - |   |  (\_/)   |                                                                  |  -
    - |   | (='.'=)  |                                                                  |  -
    - |   | (")_(")  |                                                                  |  -
    - |   |__________|     description hidden under perk list                           |  -
    - |_________________________________________________________________________________|  -
    -  ______________________________perk list__________________________________________   -
    - |    ___perk___                                                      ___perk___   |  -
    - |   |          |                                                    |          |  |  -
    - |   |          |                                                    |          |  |  -
    - |   |          |                                                    |          |  |  -
    - |   |__________|                                                    |__________|  |  -
    - |_________________________________________________________________________________|  -
    -  ______________________________perk list__________________________________________   -
    - |    ___perk___                                                      ___perk___   |  -
    - |   |          |                                                    |          |  |  -
    - |   |          |                                                    |          |  |  -
    - |   |          |                                                    |          |  |  -
    - |   |__________|                                                    |__________|  |  -
    - |_________________________________________________________________________________|  -
    ----------------------------------------------------------------------------------------
*/