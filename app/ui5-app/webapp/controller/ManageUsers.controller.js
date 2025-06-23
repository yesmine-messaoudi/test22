sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/ui/table/Table"
], function (Controller, JSONModel, MessageBox, Table) {
    "use strict";

    return Controller.extend("com.app.controller.ManageUsers", {
        onInit: function () {
            var oViewModel = new JSONModel();
            this.getView().setModel(oViewModel);

            // Load users if user is authenticated and is admin
            const user = JSON.parse(localStorage.getItem("user"));
            if (user && user.role.toLowerCase() === 'admin') {
                this._loadUsers();
            } else {
                // Redirect to home page if not authorized
                MessageBox.error("You must be an admin to access this page");
                const oRouter = this.getOwnerComponent().getRouter();
                oRouter.navTo("main");
            }
        },

        _loadUsers: async function() {
            const oViewModel = this.getView().getModel();
            const sToken = localStorage.getItem("token");

            if (!sToken) {
                const oRouter = this.getOwnerComponent().getRouter();
                oRouter.navTo("main");
                return;
            }

            try {
                const response = await fetch("/service/api_management_app/Users", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${sToken}`
                    }
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    console.error("Error fetching users:", errorData);
                    const oRouter = this.getOwnerComponent().getRouter();
                    oRouter.navTo("main");
                    return;
                }

                const result = await response.json();
                oViewModel.setProperty("/users", result.value);

            } catch (error) {
                console.error("Error loading users:", error);
                const oRouter = this.getOwnerComponent().getRouter();
                oRouter.navTo("main");
            }
        },

        onCreateUser: function () {
            var oView = this.getView();
            if (!this._oUserDialog) {
                sap.ui.core.Fragment.load({
                    name: "com.app.view.UserDialog",
                    controller: this
                }).then(function(oDialog) {
                    this._oUserDialog = oDialog;
                    oView.addDependent(oDialog);
                    this._openUserDialog({});
                }.bind(this));
            } else {
                this._openUserDialog({});
            }
        },

        onConsultUser: function () {
            // Handle consult user action
            MessageBox.information("Consult User action triggered");
        },

        onUpdateUser: function (oEvent) {
            // Get the binding context of the clicked button to get the user data
            var oUser = oEvent.getSource().getBindingContext().getObject();

            if (!oUser || !oUser.ID) {
                MessageBox.warning("Could not determine user to update.");
                return;
            }

            var oView = this.getView();
            if (!this._oUserDialog) {
                sap.ui.core.Fragment.load({
                    name: "com.app.view.UserDialog",
                    controller: this
                }).then(function(oDialog) {
                    this._oUserDialog = oDialog;
                    oView.addDependent(oDialog);
                    this._openUserDialog(oUser);
                }.bind(this));
            } else {
                this._openUserDialog(oUser);
            }
        },

        onDeleteUser: function (oEvent) {
            // Get the binding context of the clicked button to get the user data
            var oUser = oEvent.getSource().getBindingContext().getObject();
            
            if (!oUser || !oUser.ID) {
                MessageBox.warning("Could not determine user to delete.");
                return;
            }
            
            MessageBox.confirm("Are you sure you want to delete user " + oUser.firstName + " " + oUser.lastName + "?", {
                onClose: function (oAction) {
                    if (oAction === MessageBox.Action.OK) {
                        this._deleteUser(oUser.ID);
                    }
                }.bind(this)
            });
        },

        _openUserDialog: function (oUser) {
            this._editingUser = oUser;
            var oDialog = this._oUserDialog;
            oDialog.setTitle(oUser && oUser.ID ? "Update User" : "Create User");
            sap.ui.getCore().byId("userEmail").setValue(oUser.email || "");
            sap.ui.getCore().byId("userFirstName").setValue(oUser.firstName || "");
            sap.ui.getCore().byId("userLastName").setValue(oUser.lastName || "");
            sap.ui.getCore().byId("userPassword").setValue("");
            sap.ui.getCore().byId("userRole").setSelectedKey(oUser.role || "technical consultant");
            sap.ui.getCore().byId("userEmail").setEnabled(!oUser.ID); // Disable email for update
            oDialog.open();
        },

        onUserDialogCancel: function () {
            this._oUserDialog.close();
        },

        onUserDialogSave: async function () {
            var oDialog = this._oUserDialog;
            var oUser = this._editingUser || {};
            var sEmail = sap.ui.getCore().byId("userEmail").getValue();
            var sFirstName = sap.ui.getCore().byId("userFirstName").getValue();
            var sLastName = sap.ui.getCore().byId("userLastName").getValue();
            var sPassword = sap.ui.getCore().byId("userPassword").getValue();
            var sRole = sap.ui.getCore().byId("userRole").getSelectedKey();
            var sToken = localStorage.getItem("token");

            if (!sEmail || !sFirstName || !sLastName || !sRole) {
                MessageBox.error("Please fill in all required fields.");
                return;
            }

            var oPayload = {
                email: sEmail,
                firstName: sFirstName,
                lastName: sLastName,
                role: sRole
            };
            if (sPassword) {
                oPayload.password = sPassword;
            }

            try {
                var response;
                if (oUser && oUser.ID) {
                    // Update
                    response = await fetch(`/service/api_management_app/Users(${oUser.ID})`, {
                        method: "PATCH",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${sToken}`
                        },
                        body: JSON.stringify(oPayload)
                    });
                } else {
                    // Create
                    response = await fetch("/service/api_management_app/Users", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${sToken}`
                        },
                        body: JSON.stringify(oPayload)
                    });
                }
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || errorData.message || "Operation failed");
                }
                MessageBox.success("User saved successfully.");
                oDialog.close();
                this._loadUsers();
            } catch (error) {
                MessageBox.error(error.message);
            }
        },

        _deleteUser: async function (sId) {
            var sToken = localStorage.getItem("token");
            try {
                var response = await fetch(`/service/api_management_app/Users(${sId})`, {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${sToken}`
                    }
                });
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || errorData.message || "Delete failed");
                }
                MessageBox.success("User deleted successfully.");
                this._loadUsers();
            } catch (error) {
                MessageBox.error(error.message);
            }
        }
    });
}); 