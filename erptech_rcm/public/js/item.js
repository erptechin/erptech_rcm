frappe.ui.form.on('Item', {
    setup: async function (frm) {
        // Check If Is Branch
        frm.set_df_property('custom_branch', 'hidden', 1);
        frm.set_df_property('custom_branch', 'reqd', 0);
        const isBranchEnabled = await frappe.db.get_single_value('Theme Settings', 'is_enable_branch');
        if (isBranchEnabled) {
            frm.set_df_property('custom_branch', 'hidden', 0);
            frm.set_df_property('custom_branch', 'reqd', 1);
        }
    },
})