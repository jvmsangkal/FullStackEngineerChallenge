<template>
  <v-layout column justify-center align-center>
    <v-flex xs12 sm8 md6>
      <v-toolbar flat>
        <v-toolbar-title
          >{{ user.firstName }} {{ user.lastName }}</v-toolbar-title
        >
      </v-toolbar>
      <employee-assignments-table
        :user-id="user.id"
      ></employee-assignments-table>
    </v-flex>
  </v-layout>
</template>

<script>
import EmployeeAssignmentsTable from '@/components/EmployeeAssignmentsTable'

export default {
  middleware: 'isAdmin',
  components: {
    EmployeeAssignmentsTable
  },
  async asyncData({ params, $axios, error }) {
    try {
      const response = await $axios.$get(`/api/users/${params.id}`)
      return { user: response.user }
    } catch (err) {
      return error({ statusCode: 404 })
    }
  }
}
</script>
