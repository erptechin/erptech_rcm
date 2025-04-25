frappe.ui.form.on('BOM', {
    setup: function (frm) {
        frm.set_query('item', function () {
            return {
                filters: {
                    'item_group': 'Products'
                }
            };
        });
        frm.set_query('custom_recipe_name', function () {
            return {
                filters: {
                    'item_group': 'Products'
                }
            };
        });
    },
    custom_recipe_code: async function (frm, cdt, cdn) {
        if (frm.doc.custom_recipe_code) {
            frappe.call({
                method: 'erptech_rmc_pk.api.custom.get_child_items',
                args: {
                    parent: "Recipe",
                    child: "Recipe Items",
                    parent_name: frm.doc.custom_recipe_code,
                },
                callback: function (res) {
                    frm.doc.items = []
                    frm.doc.custom_items_2 = []
                    res.message.forEach((item) => {
                        let entry_items = frm.add_child("items");
                        entry_items.item_code = item.item_code;
                        entry_items.item_name = item.item_name;
                        entry_items.qty = item.qty;
                        entry_items.rate = item.rate;
                        entry_items.uom = item.uom;
                        entry_items.amount = item.amount;
                        let entry_items_2 = frm.add_child("custom_items_2");
                        entry_items_2.item_code = item.item_code;
                        entry_items_2.item_name = item.item_name;
                        entry_items_2.qty = item.qty;
                        entry_items_2.rate = item.rate;
                        entry_items_2.uom = item.uom;
                        entry_items_2.amount = item.amount;
                    });
                    frm.refresh_field('items');
                    frm.refresh_field('custom_items_2');
                }
            });
        }
    },
})


