frappe.ui.form.on('Address', {
    gstin: async function (frm) {
        if (frm.doc.gstin) {
            let gstin = frm.doc.gstin;
            frappe.call({
                method: 'erptech_rcm.api.custom.gst_info',
                args: {
                    'keyword': gstin
                },
                callback: function (r) {
                    if (r.message) {
                        let json = JSON.parse(r.message)
                        let address = json?.data?.pradr?.addr ? json.data.pradr.addr : {}
                        frm.set_value("address_title", json.data.tradeNam)
                        frm.set_value("address_line1", address.bno + ' ' + address.flno)
                        frm.set_value("address_line2", address.landMark)
                        frm.set_value("county", address.locality)
                        frm.set_value("city", address.loc)
                        frm.set_value("state", address.stcd)
                        frm.set_value("pincode", address.pncd)
                    }
                }
            })
        }
    }
})