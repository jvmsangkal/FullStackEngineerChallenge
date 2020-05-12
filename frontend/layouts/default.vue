<template>
  <v-app>
    <v-navigation-drawer v-model="drawer" fixed app>
      <v-list>
        <v-list-item
          v-for="(item, i) in items"
          :key="i"
          :to="item.to"
          router
          exact
        >
          <v-list-item-action>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title v-text="item.title" />
          </v-list-item-content>
        </v-list-item>
        <v-list-item @click="logout">
          <v-list-item-action>
            <v-icon>mdi-logout-variant</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>Logout</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
    <v-app-bar color="black" dark fixed app>
      <v-app-bar-nav-icon @click.stop="drawer = !drawer" />
      <v-spacer />
      <span>Welcome {{ userName }}!</span>
    </v-app-bar>
    <v-content>
      <v-container>
        <nuxt />
      </v-container>
    </v-content>
  </v-app>
</template>

<script>
import capitalize from 'lodash/capitalize'

export default {
  data() {
    return {
      drawer: false
    }
  },
  computed: {
    userName() {
      const { firstName } = this.$store.state.auth.user
      return capitalize(firstName)
    },
    items() {
      const { role } = this.$store.state.auth.user
      if (role === 'admin') {
        return [
          {
            icon: 'mdi-account-group',
            title: 'Empoyees',
            to: '/employees'
          },
          {
            icon: 'mdi-note-multiple',
            title: 'Performance Reviews',
            to: '/performance_reviews'
          }
        ]
      } else {
        return [
          {
            icon: 'mdi-clipboard-account',
            title: 'Feedback Assignments',
            to: '/feedback_assignments'
          }
        ]
      }
    }
  },
  methods: {
    logout() {
      this.$auth.logout()
    }
  }
}
</script>
