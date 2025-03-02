frappe.ui.form.on('Installation Note', {
    refresh: async function (frm) {
        if (frm.doc.name.includes("new-installation-note") && frm.doc.items[0] && frm.doc.items[0].prevdoc_docname) {
            InstallationCount = await frappe.db.count('Installation Note')
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
                        frm.doc.items[0]['custom_recipe_code'] = bom.message.custom_recipe_code
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
                                    frm.doc.custom_installation_note_recipe = []
                                    frm.doc.custom_installation_note_data = []
                                    frm.doc.custom_installation_note_data_totals = []
                                    res.message.custom_items_2.forEach((item) => {
                                        let custom_installation_note_recipe = frm.add_child("custom_installation_note_recipe");
                                        let custom_installation_note_data_totals = frm.add_child("custom_installation_note_data_totals");
                                        custom_installation_note_recipe.item_code = item.item_code;
                                        custom_installation_note_recipe.item_name = item.item_name;
                                        custom_installation_note_recipe.qty = item.qty;
                                        custom_installation_note_recipe.rate = item.rate;
                                        custom_installation_note_recipe.uom = item.uom;
                                        custom_installation_note_recipe.amount = item.amount;
                                        custom_installation_note_recipe.source_warehouse = item.source_warehouse;

                                        let tars = 0
                                        let acts = 0
                                        for (let i = 1; i <= customNoOfBatch; i++) {
                                            const diffVal = Math.floor(Math.random() * (6 + 5 + 1)) - 5;
                                            let custom_installation_note_data = frm.add_child("custom_installation_note_data");
                                            custom_installation_note_data.batch_no = InstallationCount + 1
                                            custom_installation_note_data.item = item.item_code;
                                            let tar = (item.qty / customCount) * Number(qty);
                                            custom_installation_note_data.tar = tar
                                            tars = tars + Number(tar)
                                            let act = Number(tar) + diffVal;
                                            custom_installation_note_data.act = act
                                            acts = acts + act
                                        }

                                        custom_installation_note_data_totals.batch_no = InstallationCount + 1
                                        custom_installation_note_data_totals.item = item.item_code;
                                        custom_installation_note_data_totals.tar = tars
                                        custom_installation_note_data_totals.act = acts
                                        custom_installation_note_data_totals.diff = (tars - acts) / tars * (uom == "Liter" ? 1000 : 100)
                                    });
                                    frm.refresh_field('custom_installation_note_recipe');
                                    frm.refresh_field('custom_installation_note_data');
                                    frm.refresh_field('custom_installation_note_data_totals');
                                }
                            });
                        }
                    }
                }
            });
        }
    },

})
frappe.ui.form.on("BOM Item 2", "cor", function (frm) {
    for (let item of frm.doc.custom_installation_note_recipe) {
        for (let note of frm.doc.custom_installation_note_data) {
            if(item.item_code === note.item){
                frappe.model.set_value("Installation Note Data", note.name, "cor", item.cor)
            }
        }
    }
});