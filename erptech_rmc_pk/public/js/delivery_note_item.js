frappe.ui.form.on('Delivery Note Item', {
    setup: function (frm) {
        frm.set_query('item_code', function () {
            return {
                filters: {
                    'item_group': 'Raw Material'
                }
            };
        });
    }
})