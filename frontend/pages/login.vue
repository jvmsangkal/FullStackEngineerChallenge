<template>
  <v-card class="elevation-12">
    <v-toolbar color="primary" dark flat>
      <v-toolbar-title>Login</v-toolbar-title>
    </v-toolbar>
    <v-card-text>
      <v-form v-model="valid" @submit.prevent="userLogin">
        <v-text-field
          v-model="email"
          label="E-mail"
          name="email"
          prepend-icon="mdi-account"
          type="text"
          :rules="emailRules"
          required
        ></v-text-field>

        <v-text-field
          id="password"
          v-model="password"
          label="Password"
          name="password"
          prepend-icon="mdi-lock"
          :rules="[(v) => !!v || 'Password is required']"
          type="password"
          required
        ></v-text-field>
      </v-form>
    </v-card-text>
    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn color="primary" @click.prevent="userLogin">Login</v-btn>
    </v-card-actions>
    <v-snackbar v-model="snackbar" top right :timeout="6000">
      {{ snackbarMessage }}
      <v-btn dark text color="red" @click="snackbar = false">
        Close
      </v-btn>
    </v-snackbar>
  </v-card>
</template>

<script>
export default {
  layout: 'login',
  auth: 'guest',
  data() {
    return {
      snackbar: false,
      snackbarMessage: '',
      valid: false,
      email: '',
      emailRules: [
        (v) => !!v || 'E-mail is required',
        (v) => /.+@.+/.test(v) || 'E-mail must be valid'
      ],
      password: ''
    }
  },

  methods: {
    async userLogin() {
      if (!this.valid) {
        return
      }

      try {
        await this.$auth.loginWith('local', {
          data: {
            user: {
              email: this.email,
              password: this.password
            }
          }
        })
      } catch (err) {
        let message = 'Something went wrong!'

        if (
          err.response &&
          err.response.status >= 400 &&
          err.response.status < 500
        ) {
          message = 'Invalid Username or Password'
        }

        this.snackbarMessage = message
        this.snackbar = true
      }
    }
  }
}
</script>
