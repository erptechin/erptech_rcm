frappe.ui.form.on('Employee', {
    after_save: function (frm) {
        if (!frm.doc.user_id) {
            frappe.msgprint(__('Please set the user field in the Employee before saving.'));
            return;
        }

        if (!frm.doc.custom_branches || frm.doc.custom_branches.length === 0) {
            frappe.msgprint(__('No branches found in the Branches child table.'));
            return;
        }

        frm.doc.custom_branches.forEach(function (branch_row) {
            if (branch_row.branch && frm.doc.user_id) {
                // Prepare User Permission document
                let user_permission = {
                    doctype: "User Permission",
                    user: frm.doc.user_id,
                    allow: "Branch",
                    for_value: branch_row.branch,
                    apply_to_all_doctypes: 1,
                };

                // Insert user permission, ignoring duplicates by catching error
                frappe.call({
                    method: "frappe.client.insert",
                    args: {
                        doc: user_permission
                    },
                    callback: function (r) {
                        if (r.message) {
                            frappe.show_alert({
                                message: __('User Permission created for branch {0}', [branch_row.branch]),
                                indicator: 'green'
                            });
                        }
                    },
                    error: function (e) {
                        // If duplicate or permission already exists, silently ignore error
                        if (e.xhr.responseJSON && e.xhr.responseJSON.exc) {
                            let exc = e.xhr.responseJSON.exc;
                            if (exc.includes('unique constraint') || exc.includes('Duplicate Entry')) {
                                // Do nothing, permission exists
                            } else {
                                frappe.msgprint({
                                    title: __('Error'),
                                    indicator: 'red',
                                    message: __('Failed to create User Permission for branch {0}: {1}', [branch_row.branch, exc])
                                });
                            }
                        }
                    }
                });
            }
        });
    }
});

