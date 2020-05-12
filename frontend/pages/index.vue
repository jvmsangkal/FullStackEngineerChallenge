<template>
  <v-layout column justify-center align-center>
    <v-flex xs12 sm8 md6> </v-flex>
  </v-layout>
</template>

<script>
export default {
  middleware({ store, redirect }) {
    // If the user is not authenticated
    if (!store.state.auth.loggedIn) {
      return redirect('/login')
    }

    if (store.state.auth.user.role === 'admin') {
      return redirect('/employees')
    }

    if (store.state.auth.user.role === 'employee') {
      return redirect('/feedback_assignments')
    }
  }
}
</script>
