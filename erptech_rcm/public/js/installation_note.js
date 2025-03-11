frappe.ui.form.on('Installation Note', {
    refresh: async function (frm) {
        const materialMapping = await frappe.db.get_list('Raw Material Mapping', {
            fields: ["item_name", "item", "decimal"],
            order_by: "srno ASC"
        })
        if (frm.doc.name.includes("new-installation-note") && frm.doc.items[0] && frm.doc.items[0].prevdoc_docname) {

            frappe.call({
                method: "frappe.client.get",
                args: {
                    doctype: "Delivery Note",
                    name: frm.doc.items[0].prevdoc_docname
                },
                callback: async function (res) {
                    if (res.message) {
                        let bom = await frappe.db.get_value('BOM', res.message.items[0].custom_bom_no, 'custom_recipe_code')
                        frm.set_value('inst_time', res.message.posting_time);
                        frm.set_value('custom_vehicle_no', res.message.custom_vehicle);
                        frm.set_value('custom_driver_name', res.message.driver);
                        frm.set_value('custom_recipe_name', res.message.items[0].item_code);
                        frm.doc.items[0]['custom_bom_no'] = res.message.items[0].custom_bom_no
                        frm.doc.items[0]['custom_recipe_code'] = bom.message ? bom.message.custom_recipe_code : ''
                        frm.doc.items[0]['custom_sales_order_no'] = res.message.items[0].against_sales_order
                        let qty = frm.doc.items[0]['qty']
                        let customCount = Number(qty / frm.doc.items[0]['custom_batch_size']).toFixed(0)
                        frm.doc.items[0]['custom_count'] = customCount
                        frm.doc.items[0]['custom_percycle'] = frm.doc.items[0]['qty'] / frm.doc.items[0]['custom_count']
                        let customNoOfBatch = frm.doc.items[0]['qty'] / frm.doc.items[0]['custom_percycle']
                        frm.doc.items[0]['custom_no_of_batch'] = customNoOfBatch
                        let uom = frm.doc.items[0]['uom']
                        frm.refresh_field('items');
                        if (res.message.items[0].custom_bom_no) {
                            frappe.call({
                                method: "frappe.client.get",
                                args: {
                                    doctype: "BOM",
                                    name: res.message.items[0].custom_bom_no
                                },
                                callback: function (res) {
                                    const recipes = res.message.custom_items_2.length ? res.message.custom_items_2 : res.message.items
                                    frm.doc.custom_installation_note_recipe = []
                                    let tempIds = {}
                                    for (let i = 0; i <= materialMapping.length - 1; i++) {
                                        let custom_installation_note_recipe = frm.add_child("custom_installation_note_recipe");
                                        let recipe = recipes.find((item) => item.item_code == materialMapping[i].item && item.item_code in tempIds === false)
                                        custom_installation_note_recipe.item_name = materialMapping[i].item_name;
                                        custom_installation_note_recipe.decimal = materialMapping[i].decimal;
                                        if (recipe) {
                                            tempIds[recipe.item_code] = true
                                            custom_installation_note_recipe.qty = recipe.qty;
                                            const setQty = Array.from({ length: customNoOfBatch }, () => recipe.qty + Math.floor(Math.random() * (6 + 5 + 1)) - 5);
                                            custom_installation_note_recipe.qtys = JSON.stringify(setQty);
                                            custom_installation_note_recipe.uom = recipe.uom;
                                        } else {
                                            custom_installation_note_recipe.qty = 0;
                                            const setQty = Array.from({ length: customNoOfBatch }, () => 0);
                                            custom_installation_note_recipe.qtys = JSON.stringify(setQty);
                                            custom_installation_note_recipe.uom = 'Kg';
                                        }
                                    }
                                    frm.refresh_field('custom_installation_note_recipe');
                                    showRanderData(frm)
                                }
                            });


                        }
                    }
                }
            });
        }
    },
    setup: function (frm) {
        if (frm?.doc?.custom_installation_note_recipe?.length) {
            showRanderData(frm)
        }
    },
})

async function showRanderData(frm) {
    const recipes = frm.doc.custom_installation_note_recipe
    let noOfBatch = frm.doc.items[0]['custom_no_of_batch']
    const mainHeader = `<table class="table-none text-center">
                <tbody><tr>
                    <td class="text-center no-left-border no-right-border"><b>Aggregate</b> </td>
                    <td class="text-center no-left-border no-right-border"><b>Cement</b></td>
                    <td class="text-center no-left-border no-right-border"><b>Water/Ice</b></td>
                    <td class="text-center no-left-border no-right-border"><b>Admixture</b></td>
                    <td class="text-center no-left-border no-right-border"><b>Silica</b></td>
                </tr>
            </tbody></table>`
    let itemHeading = '<table><tbody>'
    itemHeading = itemHeading + `<tr>`
    recipes.forEach((item) => {
        itemHeading = itemHeading + `<td><b>${item.item_name}</b></td>`
    })
    itemHeading = itemHeading + `</tr><tr>`
    recipes.forEach((item) => {
        itemHeading = itemHeading + `<td>${(item.qty).toFixed(item.decimal ? 2 : 0)}</td>`
    })
    itemHeading = itemHeading + `</tr></tbody></table>`

    let itemdata = `<table><tbody><tr><td colspan="${recipes.length}"><b>Target and Actual Value with moisture correction/absorption in % and other Corrections in Kgs.</b></td></tr>`

    for (let i = 1; i <= noOfBatch; i++) {
        itemdata = itemdata + `<tr>`
        recipes.forEach((item) => {
            itemdata = itemdata + `<td>${(item.qty).toFixed(item.decimal ? 2 : 0)}</td>`
        })
        itemdata = itemdata + `</tr><tr>`
        recipes.forEach((item) => {
            qtys = JSON.parse(item.qtys)
            itemdata = itemdata + `<td>${Number(qtys[i - 1]).toFixed(item.decimal ? 2 : 0)}</td>`
        })
        itemdata = itemdata + `</tr>`
        itemdata = itemdata + ` <tr>
            <td colspan="${noOfBatch - 1}"
                style="border-bottom: 1px solid #80808073; padding: 0.1em;"> </td>
            </tr>`
    }
    itemdata = itemdata + `</tbody></table>`

    // TarTotal
    let tarTotal = `<table><tbody><tr><td colspan="${recipes.length}" class="text-left no-left-border"><b>Total Set Weight in Kgs.</b></td></tr><tr>`
    let tarTotals = 0
    recipes.forEach((item) => {
        tarTotal = tarTotal + `<td>${(item.qty * noOfBatch).toFixed(item.decimal ? 2 : 0)}</td>`
        tarTotals = tarTotals + (item.qty * noOfBatch)
    })
    tarTotal = tarTotal + `</tr><tr>
                <td colspan="${recipes.length - 1}"> <b>Mass of Total Set Weight in Kgs.</b></td><td class="text-center" style="border:2px solid black;"><b>${(tarTotals).toFixed(2)}</b></td></tr>
                </tbody></table>`

    // ActTotal
    let actTotal = `<table><tbody><tr><td colspan="${recipes.length}" class="text-left no-left-border"><b>Total Actual Weight in Kgs.</b></td></tr><tr>`
    let actTotals = 0
    recipes.forEach((item) => {
        qtys = JSON.parse(item.qtys)
        let sum = qtys.reduce((acc, val) => acc + val, 0);
        actTotal = actTotal + `<td>${(sum).toFixed(item.decimal ? 2 : 0)}</td>`
        actTotals = actTotals + sum
    })
    actTotal = actTotal + `</tr><tr>
                <td colspan="${recipes.length - 1}"> <b>Mass of Total Actual Weight in Kgs.</b></td><td class="text-center" style="border:2px solid black;"><b>${(actTotals).toFixed(2)}</b></td></tr>
                </tbody></table>`

    // Difference
    let difference = `<table><tbody><tr><td colspan="${recipes.length}" class="text-left no-left-border"><b>Difference in Percentage</b></td></tr><tr>`
    let tars = 0
    let acts = 0
    recipes.forEach((item) => {
        qtys = JSON.parse(item.qtys)
        let sum = qtys.reduce((acc, val) => acc + val, 0);
        tars = item.qty * noOfBatch
        acts = sum
        difference = difference + `<td>${(tars ? (tars - acts) / tars * (item.uom == "Liter" ? 1000 : 100) : 0).toFixed(2)}</td>`
    })
    difference = difference + `</tr></tbody></table>`

    frm.set_df_property('custom_rander_data', 'options', `
                <div class="custom_rander_data">
                ${mainHeader}
                ${itemHeading}
                ${itemdata}
                ${tarTotal}
                ${actTotal}
                ${difference}
    </div>`);

}