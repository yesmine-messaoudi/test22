sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/UIComponent",
    "sap/ui/model/json/JSONModel",
    "sap/ui/Device",
    "sap/m/MessageToast",
    "sap/ui/core/Fragment",
    "sap/m/MessageBox"
], function (Controller, UIComponent, JSONModel, Device, MessageToast, Fragment, MessageBox) {
    "use strict";

    return Controller.extend("com.app.controller.App", {
        onInit: function () {
            // Set device model (if needed globally, otherwise remove)
            var oDeviceModel = new JSONModel(Device);
            oDeviceModel.setDefaultBindingMode("OneWay");
            this.getOwnerComponent().setModel(oDeviceModel, "device");

            // Initialize a local model for UI state (like chatbot visibility)
            var oViewModel = new JSONModel({
                isChatbotOpen: false
            });
            this.getView().setModel(oViewModel, "viewModel");
            // Ensure chatbot panel is hidden on initial load
            this.byId("chatbotPanel")?.setVisible(false);

            // Set initial width for NavContainer
            this.byId("navContainer").setWidth("100%");

            console.log("DEBUG: ViewModel initial state:", oViewModel.getData());

            // Load the navigation data model
            var oDataModel = new JSONModel("model/data.json");
            this.getOwnerComponent().setModel(oDataModel);

            // Preload the Auth fragment
            Fragment.load({
                name: "com.app.view.Auth",
                controller: this
            }).then(function(oFragment) {
                // Store the fragment
                this._oAuthFragment = oFragment;
                
                // Get references to both dialogs
                this._oSignInDialog = sap.ui.getCore().byId("signInDialog");
                this._oSignUpDialog = sap.ui.getCore().byId("signUpDialog");
                
                // Make the dialogs dependents of the view
                this.getView().addDependent(this._oSignInDialog);
                this.getView().addDependent(this._oSignUpDialog);

                // Check if user is already logged in
                const user = JSON.parse(localStorage.getItem("user"));
                if (user) {
                    this._updateAvatarForUser(user);
                    this._updateNavigationForUser(user);
                    this._updatePopoverForLoggedInUser();
                } else {
                    // If no user is found in localStorage, ensure navigation is for logged out state.
                    this._updateNavigationForUser(null);
                    this._updatePopoverForLoggedOutUser(); // Ensure popover shows sign in/up
                }
            }.bind(this)).catch(function(oError) {
                console.error("Error preloading Auth fragment:", oError);
            });

            // Initialize router
            this.getOwnerComponent().getRouter().initialize();
        },

        onChatbotPress: function() {
            const oViewModel = this.getView().getModel("viewModel");
            const bCurrentState = oViewModel.getProperty("/isChatbotOpen");
            const bNewState = !bCurrentState;
            oViewModel.setProperty("/isChatbotOpen", bNewState);

            const oNavContainer = this.byId("navContainer");
            if (oNavContainer) {
                if (bNewState) {
                    oNavContainer.setWidth("calc(100% - 400px)"); // Shrink when chatbot opens
                } else {
                    oNavContainer.setWidth("100%"); // Expand when chatbot closes
                }
            }
            console.log("DEBUG: onChatbotPress called. Chatbot is now:", bNewState ? "open" : "closed");
        },

        onChatbotClose: function() {
            const oViewModel = this.getView().getModel("viewModel");
            oViewModel.setProperty("/isChatbotOpen", false);
            
            const oNavContainer = this.byId("navContainer");
            if (oNavContainer) {
                oNavContainer.setWidth("100%"); // Expand when chatbot closes via close button
            }
        },

        onChatInputLiveChange: function(oEvent) {
            const sText = oEvent.getParameter("value");
            const oSendButton = this.byId("sendChatButton"); // Use this.byId directly
            if (oSendButton) {
                oSendButton.setEnabled(sText.trim().length > 0);
            }
        },

        onSendChatMessage: function() {
            const oChatInput = this.byId("chatInput"); // Use this.byId directly
            const sMessage = oChatInput.getValue();
            if (sMessage) {
                MessageToast.show("Sending message: " + sMessage);
                // Here you would typically send the message to a backend service
                // and then add the response to the chat messages container.

                // For now, let's just clear the input and disable the button
                oChatInput.setValue("");
                this.byId("sendChatButton").setEnabled(false);
            }
        },

        onItemSelect: function (oEvent) {
            var sKey = oEvent.getParameter("key");
            var oViewModel = this.getOwnerComponent().getModel();
            oViewModel.setProperty("/selectedKey", sKey);
            
            var oRouter = this.getOwnerComponent().getRouter();
            switch(sKey) {
                case "page1":
                    oRouter.navTo("main");
                    break;
                case "page2":
                    oRouter.navTo("internalApi");
                    break;
                case "page3":
                    oRouter.navTo("standardApi");
                    break;
                case "page4":
                    oRouter.navTo("manageYourApi");
                    break;
                case "page5":
                    oRouter.navTo("manageUsers");
                    break;
                default:
                    oRouter.navTo("main");
            }
        },

        onAvatarPress: function(oEvent) {
            var oAvatar = oEvent.getSource();
            var oPopover = this.byId("avatarPopover");
            if (oPopover) {
                oPopover.openBy(oAvatar);
            }
        },

        onSignIn: function() {
            var oPopover = this.byId("avatarPopover");
            if (oPopover) {
                oPopover.close();
            }

            if (this._oSignInDialog) {
                this._oSignInDialog.open();
            } else {
                MessageBox.error("Sign In dialog not available");
            }
        },

        onSignUp: function() {
            var oPopover = this.byId("avatarPopover");
            if (oPopover) {
                oPopover.close();
            }

            if (this._oSignUpDialog) {
                this._oSignUpDialog.open();
            } else {
                MessageBox.error("Sign Up dialog not available");
            }
        },

        onSignInSubmit: function() {
            const sEmail = sap.ui.getCore().byId("signInEmail").getValue();
            const sPassword = sap.ui.getCore().byId("signInPassword").getValue();

            if (!this._validateSignInInputs(sEmail, sPassword)) {
                return;
            }

            this._callLoginService(sEmail, sPassword);
        },

        onSignInCancel: function() {
            if (this._oSignInDialog) {
                this._oSignInDialog.close();
                this._clearSignInForm();
            }
        },

        onSignUpSubmit: function() {
            const sEmail = sap.ui.getCore().byId("signUpEmail").getValue();
            const sFirstName = sap.ui.getCore().byId("signUpFirstName").getValue();
            const sLastName = sap.ui.getCore().byId("signUpLastName").getValue();
            const sPassword = sap.ui.getCore().byId("signUpPassword").getValue();
            const sRole = sap.ui.getCore().byId("signUpRole").getSelectedKey();

            if (!this._validateSignUpInputs(sEmail, sFirstName, sLastName, sPassword, sRole)) {
                return;
            }

            this._callRegistrationService({
                email: sEmail,
                firstName: sFirstName,
                lastName: sLastName,
                password: sPassword,
                role: sRole
            });
        },

        onSignUpCancel: function() {
            if (this._oSignUpDialog) {
                this._oSignUpDialog.close();
                this._clearSignUpForm();
            }
        },

        onProfilePress: function() {
            MessageBox.information("Profile view will be implemented");
        },

        onLogoutPress: function() {
            console.log("DEBUG: onLogoutPress function called.");
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            
            this._updateAvatarForUser(null);
            this._updatePopoverForLoggedOutUser();
            this._updateNavigationForUser(null);
            
            MessageToast.show("Successfully logged out");
            
            // Force a full page reload to ensure all states are reset
            window.location.reload();
        },

        _validateSignInInputs: function (sEmail, sPassword) {
            if (!sEmail || !sPassword) {
                MessageBox.error("Please fill in all required fields");
                return false;
            }
            if (!sEmail.endsWith("@aymax.fr")) {
                MessageBox.error("Email must end with @aymax.fr");
                return false;
            }
            return true;
        },

        _validateSignUpInputs: function (sEmail, sFirstName, sLastName, sPassword, sRole) {
            if (!sEmail || !sFirstName || !sLastName || !sPassword || !sRole) {
                MessageBox.error("Please fill in all required fields");
                return false;
            }
            if (!sEmail.endsWith("@aymax.fr")) {
                MessageBox.error("Email must end with @aymax.fr");
                return false;
            }
            return true;
        },

        _callLoginService: function (sEmail, sPassword) {
            fetch("/service/api_management_app/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email: sEmail,
                    password: sPassword
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.token) {
                    localStorage.setItem("token", data.token);
                    localStorage.setItem("user", JSON.stringify(data.user));
                    
                    this._oSignInDialog.close();
                    this._clearSignInForm();
                    MessageToast.show("Successfully signed in");
                    
                    this._updateAvatarForUser(data.user);
                    this._updateNavigationForUser(data.user);
                    this._updatePopoverForLoggedInUser();

                    window.location.reload();
                } else {
                    MessageBox.error("Login failed: " + (data.message || "Unknown error"));
                }
            })
            .catch(error => {
                MessageBox.error("Login failed: " + error.message);
            });
        },

        _callRegistrationService: function (oUserData) {
            fetch("/service/api_management_app/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(oUserData)
            })
            .then(response => response.json())
            .then(data => {
                if (data.user) {
                    this._oSignUpDialog.close();
                    this._clearSignUpForm();
                    MessageToast.show("Successfully registered");
                    
                    // Open sign in dialog
                    this._oSignInDialog.open();
                } else {
                    MessageBox.error("Registration failed: " + (data.message || "Unknown error"));
                }
            })
            .catch(error => {
                MessageBox.error("Registration failed: " + error.message);
            });
        },

        _clearSignInForm: function () {
            sap.ui.getCore().byId("signInEmail").setValue("");
            sap.ui.getCore().byId("signInPassword").setValue("");
        },

        _clearSignUpForm: function () {
            sap.ui.getCore().byId("signUpEmail").setValue("");
            sap.ui.getCore().byId("signUpFirstName").setValue("");
            sap.ui.getCore().byId("signUpLastName").setValue("");
            sap.ui.getCore().byId("signUpPassword").setValue("");
            sap.ui.getCore().byId("signUpRole").setSelectedKey("");
        },

        _updateAvatarForUser: function(oUser) {
            const oAvatar = this.byId("userAvatar");
            if (oUser) {
                const sInitials = `${oUser.firstName.charAt(0).toUpperCase()}${oUser.lastName.charAt(0).toUpperCase()}`;
                oAvatar.setSrc(""); // Clear the image source
                oAvatar.setInitials(sInitials);
                oAvatar.setTooltip(oUser.firstName + " " + oUser.lastName);
            } else {
                oAvatar.setSrc("./assets/images.png"); // Revert to default image
                oAvatar.setInitials(""); // Clear initials
                oAvatar.setTooltip("Sign In");
            }
        },

        _updatePopoverForLoggedInUser: function() {
            const oPopover = this.byId("avatarPopover");
            const oList = this.byId("avatarList"); // Get the list by its ID
            console.log("DEBUG: _updatePopoverForLoggedInUser - oList:", oList);
            if (oPopover && oList) {
                oList.removeAllItems(); // Clear existing items from the list
                
                const oProfileItem = new sap.m.StandardListItem({
                    title: "Profile",
                    icon: "sap-icon://user-settings",
                    iconDensityAware: false,
                    press: this.onProfilePress.bind(this),
                    type: "Active"
                });
                oProfileItem.addStyleClass("smallIcon");
                oList.addItem(oProfileItem);
                
                const oLogoutItem = new sap.m.StandardListItem({
                    title: "Logout",
                    icon: "sap-icon://log",
                    iconDensityAware: false,
                    press: this.onLogoutPress.bind(this),
                    type: "Active"
                });
                oLogoutItem.addStyleClass("smallIcon");
                oList.addItem(oLogoutItem);
            }
        },

        _updatePopoverForLoggedOutUser: function() {
            const oPopover = this.byId("avatarPopover");
            const oList = this.byId("avatarList"); // Get the list by its ID
            console.log("DEBUG: _updatePopoverForLoggedOutUser - oList:", oList);
            if (oPopover && oList) {
                oList.removeAllItems(); // Clear existing items from the list
                
                const oSignInItem = new sap.m.StandardListItem({
                    title: "Sign In",
                    icon: "sap-icon://log",
                    iconDensityAware: false,
                    press: this.onSignIn.bind(this),
                    type: "Active"
                });
                oSignInItem.addStyleClass("smallIcon");
                oList.addItem(oSignInItem);
                
                const oSignUpItem = new sap.m.StandardListItem({
                    title: "Sign Up",
                    icon: "sap-icon://add-employee",
                    iconDensityAware: false,
                    press: this.onSignUp.bind(this),
                    type: "Active"
                });
                oSignUpItem.addStyleClass("smallIcon");
                oList.addItem(oSignUpItem);
            }
        },

        _updateNavigationForUser: function(oUser) {
            const oModel = this.getOwnerComponent().getModel();
            let aNavigation = [
                { key: "page1", title: "Home" },
                { key: "page2", title: "Internal APIs" },
                { key: "page3", title: "Standard APIs" }
            ];

            if (oUser) {
                aNavigation.push({ key: "page4", title: "Manage Your API" });
                if (oUser.role === "admin") {
                    aNavigation.push({ key: "page5", title: "Manage Users" });
                }
            }
            oModel.setProperty("/navigation", aNavigation);
        }
    });
}); 