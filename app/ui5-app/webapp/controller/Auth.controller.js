sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox",
    "sap/m/MessageToast"
], function (Controller, MessageBox, MessageToast) {
    "use strict";

    return Controller.extend("com.app.controller.Auth", {
        onInit: function () {
            // Initialize any required data
        },

        onSignInSubmit: function () {
            const oView = this.getView();
            const sEmail = oView.byId("signInEmail").getValue();
            const sPassword = oView.byId("signInPassword").getValue();

            // Validate inputs
            if (!this._validateSignInInputs(sEmail, sPassword)) {
                return;
            }

            // Call backend login service
            this._callLoginService(sEmail, sPassword);
        },

        onSignInCancel: function () {
            const oView = this.getView();
            oView.byId("signInDialog").close();
            this._clearSignInForm();
        },

        onSignUpSubmit: function () {
            const oView = this.getView();
            const sEmail = oView.byId("signUpEmail").getValue();
            const sFirstName = oView.byId("signUpFirstName").getValue();
            const sLastName = oView.byId("signUpLastName").getValue();
            const sPassword = oView.byId("signUpPassword").getValue();
            const sRole = oView.byId("signUpRole").getSelectedKey();

            // Validate inputs
            if (!this._validateSignUpInputs(sEmail, sFirstName, sLastName, sPassword, sRole)) {
                return;
            }

            // Call backend registration service
            this._callRegistrationService({
                email: sEmail,
                firstName: sFirstName,
                lastName: sLastName,
                password: sPassword,
                role: sRole
            });
        },

        onSignUpCancel: function () {
            const oView = this.getView();
            oView.byId("signUpDialog").close();
            this._clearSignUpForm();
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
            // Call the backend login service
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
                    // Store the token
                    localStorage.setItem("authToken", data.token);
                    localStorage.setItem("userInfo", JSON.stringify(data.user));
                    
                    // Close dialog and show success message
                    this.getView().byId("signInDialog").close();
                    this._clearSignInForm();
                    MessageToast.show("Successfully signed in");
                    
                    // Refresh the page or update UI as needed
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
            // Call the backend registration service
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
                    // Close dialog and show success message
                    this.getView().byId("signUpDialog").close();
                    this._clearSignUpForm();
                    MessageToast.show("Successfully registered");
                    
                    // Optionally open sign in dialog
                    this.getView().byId("signInDialog").open();
                } else {
                    MessageBox.error("Registration failed: " + (data.message || "Unknown error"));
                }
            })
            .catch(error => {
                MessageBox.error("Registration failed: " + error.message);
            });
        },

        _clearSignInForm: function () {
            const oView = this.getView();
            oView.byId("signInEmail").setValue("");
            oView.byId("signInPassword").setValue("");
        },

        _clearSignUpForm: function () {
            const oView = this.getView();
            oView.byId("signUpEmail").setValue("");
            oView.byId("signUpFirstName").setValue("");
            oView.byId("signUpLastName").setValue("");
            oView.byId("signUpPassword").setValue("");
            oView.byId("signUpRole").setSelectedKey("");
        }
    });
}); 