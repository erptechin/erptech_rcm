app_name = "erptech_rcm"
app_title = "Erptech Rcm"
app_publisher = "erptech"
app_description = "Extend Rcm"
app_email = "erptechin@gmail.com"
app_license = "mit"
# required_apps = []

# Includes in <head>
# ------------------

doctype_js = {
	"BOM": "public/js/bom.js",
	"Production Plan": "public/js/production_plan.js",
	"Purchase Invoice": "public/js/purchase_invoice.js",
	"Address": "public/js/address.js",
	"Customer": "public/js/customer.js",
	"Supplier": "public/js/supplier.js",
	"Quotation": "public/js/quotation.js",
	"Sales Order": "public/js/sales_order.js",
	"Delivery Note": "public/js/delivery_note.js",
	"Delivery Note Item": "public/js/delivery_note_item.js",
	"Installation Note": "public/js/installation_note.js",
	"Sales Invoice": "public/js/sales_invoice.js"
}

# include js, css files in header of desk.html
app_include_css = "/assets/erptech_rcm/css/erptech_rcm.css"
app_include_js = "/assets/erptech_rcm/js/erptech_rcm.js"

# include js, css files in header of web template
web_include_css = "/assets/erptech_rcm/css/erptech_rcm_web.css"
web_include_js = "/assets/erptech_rcm/js/erptech_rcm_web.js"

# include custom scss in every website theme (without file extension ".scss")
# website_theme_scss = "erptech_rcm/public/scss/website"

# include js, css files in header of web form
# webform_include_js = {"doctype": "public/js/doctype.js"}
# webform_include_css = {"doctype": "public/css/doctype.css"}

# include js in page
# page_js = {"page" : "public/js/file.js"}

# include js in doctype views
# doctype_js = {"doctype" : "public/js/doctype.js"}
# doctype_list_js = {"doctype" : "public/js/doctype_list.js"}
# doctype_tree_js = {"doctype" : "public/js/doctype_tree.js"}
# doctype_calendar_js = {"doctype" : "public/js/doctype_calendar.js"}

# Svg Icons
# ------------------
# include app icons in desk
# app_include_icons = "erptech_rcm/public/icons.svg"

# Home Pages
# ----------

# application home page (will override Website Settings)
# home_page = "login"

# website user home page (by Role)
# role_home_page = {
#	"Role": "home_page"
# }

# Generators
# ----------

# automatically create page for each record of this doctype
# website_generators = ["Web Page"]

# Jinja
# ----------

# add methods and filters to jinja environment
# jinja = {
#	"methods": "erptech_rcm.utils.jinja_methods",
#	"filters": "erptech_rcm.utils.jinja_filters"
# }

# Installation
# ------------

# before_install = "erptech_rcm.install.before_install"
# after_install = "erptech_rcm.install.after_install"

# Uninstallation
# ------------

# before_uninstall = "erptech_rcm.uninstall.before_uninstall"
# after_uninstall = "erptech_rcm.uninstall.after_uninstall"

# Integration Setup
# ------------------
# To set up dependencies/integrations with other apps
# Name of the app being installed is passed as an argument

# before_app_install = "erptech_rcm.utils.before_app_install"
# after_app_install = "erptech_rcm.utils.after_app_install"

# Integration Cleanup
# -------------------
# To clean up dependencies/integrations with other apps
# Name of the app being uninstalled is passed as an argument

# before_app_uninstall = "erptech_rcm.utils.before_app_uninstall"
# after_app_uninstall = "erptech_rcm.utils.after_app_uninstall"

# Desk Notifications
# ------------------
# See frappe.core.notifications.get_notification_config

# notification_config = "erptech_rcm.notifications.get_notification_config"

# Permissions
# -----------
# Permissions evaluated in scripted ways

# permission_query_conditions = {
#	"Event": "frappe.desk.doctype.event.event.get_permission_query_conditions",
# }
#
# has_permission = {
#	"Event": "frappe.desk.doctype.event.event.has_permission",
# }

# DocType Class
# ---------------
# Override standard doctype classes

# override_doctype_class = {
#	"ToDo": "custom_app.overrides.CustomToDo"
# }

# Document Events
# ---------------
# Hook on document methods and events

# doc_events = {
#	"*": {
#		"on_update": "method",
#		"on_cancel": "method",
#		"on_trash": "method"
#	}
# }

# Scheduled Tasks
# ---------------

# scheduler_events = {
#	"all": [
#		"erptech_rcm.tasks.all"
#	],
#	"daily": [
#		"erptech_rcm.tasks.daily"
#	],
#	"hourly": [
#		"erptech_rcm.tasks.hourly"
#	],
#	"weekly": [
#		"erptech_rcm.tasks.weekly"
#	],
#	"monthly": [
#		"erptech_rcm.tasks.monthly"
#	],
# }

# Testing
# -------

# before_tests = "erptech_rcm.install.before_tests"

# Overriding Methods
# ------------------------------
#
# override_whitelisted_methods = {
#	"frappe.desk.doctype.event.event.get_events": "erptech_rcm.event.get_events"
# }
#
# each overriding function accepts a `data` argument;
# generated from the base implementation of the doctype dashboard,
# along with any modifications made in other Frappe apps
# override_doctype_dashboards = {
#	"Task": "erptech_rcm.task.get_dashboard_data"
# }

# exempt linked doctypes from being automatically cancelled
#
# auto_cancel_exempted_doctypes = ["Auto Repeat"]

# Ignore links to specified DocTypes when deleting documents
# -----------------------------------------------------------

# ignore_links_on_delete = ["Communication", "ToDo"]

# Request Events
# ----------------
# before_request = ["erptech_rcm.utils.before_request"]
# after_request = ["erptech_rcm.utils.after_request"]

# Job Events
# ----------
# before_job = ["erptech_rcm.utils.before_job"]
# after_job = ["erptech_rcm.utils.after_job"]

# User Data Protection
# --------------------

# user_data_fields = [
#	{
#		"doctype": "{doctype_1}",
#		"filter_by": "{filter_by}",
#		"redact_fields": ["{field_1}", "{field_2}"],
#		"partial": 1,
#	},
#	{
#		"doctype": "{doctype_2}",
#		"filter_by": "{filter_by}",
#		"partial": 1,
#	},
#	{
#		"doctype": "{doctype_3}",
#		"strict": False,
#	},
#	{
#		"doctype": "{doctype_4}"
#	}
# ]

# Authentication and authorization
# --------------------------------

# auth_hooks = [
#	"erptech_rcm.auth.validate"
# ]

doc_events = {
    "Delivery Note": {
        "before_submit": "erptech_rcm.api.hooks.create_stock_entry"
    }
}
# fixtures = ["Custom Field"]