<template>
  <v-layout column justify-center align-center>
    <v-flex xs12 sm8 md6>
      <v-data-table
        :headers="headers"
        :items="employees"
        :options.sync="options"
        :server-items-length="totalEmployees"
        :loading="loading"
        loading-text="Loading... Please wait"
        class="elevation-1"
      >
        <template v-slot:top>
          <v-toolbar flat>
            <v-toolbar-title>Employees</v-toolbar-title>
            <v-divider class="mx-4" inset vertical></v-divider>
            <v-spacer></v-spacer>
            <v-dialog v-model="dialog" max-width="500px">
              <template v-slot:activator="{ on }">
                <v-btn color="primary" dark class="mb-2" v-on="on"
                  >New Employee</v-btn
                >
              </template>
              <v-card>
                <v-card-title>
                  <span class="headline">{{ formTitle }}</span>
                </v-card-title>

                <v-card-text>
                  <v-container>
                    <v-form v-model="valid" @submit.prevent="save">
                      <v-row>
                        <v-col cols="12" sm="12" md="6">
                          <v-text-field
                            v-model="editedItem.firstName"
                            label="First name"
                            :rules="[(v) => !!v || 'First name is required']"
                            required
                          ></v-text-field>
                        </v-col>
                        <v-col cols="12" sm="12" md="6">
                          <v-text-field
                            v-model="editedItem.lastName"
                            label="Last name"
                            :rules="[(v) => !!v || 'Last name is required']"
                            required
                          ></v-text-field>
                        </v-col>
                        <v-col cols="12" sm="12" md="12">
                          <v-text-field
                            v-model="editedItem.email"
                            label="Email"
                            :rules="emailRules"
                            required
                          ></v-text-field>
                        </v-col>
                        <v-col cols="12" sm="12" md="12">
                          <v-text-field
                            v-model="editedItem.password"
                            type="password"
                            label="Password"
                            :rules="[(v) => !!v || 'Password is required']"
                            required
                          ></v-text-field>
                        </v-col>
                      </v-row>
                    </v-form>
                  </v-container>
                </v-card-text>

                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn color="blue darken-1" text @click="close">
                    Cancel
                  </v-btn>
                  <v-btn color="blue darken-1" text @click="save">Save</v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>
            <v-dialog v-model="deleteDialog" persistent max-width="290">
              <v-card>
                <v-card-title
                  >Are you sure you want to delete this item?</v-card-title
                >
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn color="green darken-1" text @click="closeDeleteDialog"
                    >No</v-btn
                  >
                  <v-btn
                    color="green darken-1"
                    text
                    @click="confirmDeleteDialog"
                    >Yes</v-btn
                  >
                </v-card-actions>
              </v-card>
            </v-dialog>
          </v-toolbar>
        </template>
        <template v-slot:item.actions="{ item }">
          <v-icon small class="mr-2" @click="viewEmployee(item)">
            mdi-eye
          </v-icon>
          <v-icon small class="mr-2" @click="editEmployee(item)">
            mdi-pencil
          </v-icon>
          <v-icon small @click="deleteEmployee(item)">
            mdi-delete
          </v-icon>
        </template>
        <template v-slot:no-data>
          No Employees
        </template>
      </v-data-table>
    </v-flex>
  </v-layout>
</template>

<script>
import lowerCase from 'lodash/lowerCase'
import startCase from 'lodash/startCase'

export default {
  middleware: 'isAdmin',
  data: () => ({
    emailRules: [
      (v) => !!v || 'E-mail is required',
      (v) => /.+@.+/.test(v) || 'E-mail must be valid'
    ],
    dialog: false,
    valid: false,
    deleteDialog: false,
    deleteId: '',
    headers: [
      {
        text: 'Name',
        align: 'start',
        sortable: false,
        value: 'fullName'
      },
      {
        text: 'E-mail',
        sortable: false,
        value: 'email'
      },
      { text: 'Actions', value: 'actions', sortable: false }
    ],
    options: {},
    loading: true,
    employees: [],
    totalEmployees: 0,
    editId: '',
    editedItem: {
      firstName: '',
      lastName: '',
      email: '',
      password: ''
    },
    defaultItem: {
      firstName: '',
      lastName: '',
      email: '',
      password: ''
    }
  }),

  computed: {
    formTitle() {
      return this.editId === -1 ? 'New Employee' : 'Edit Employee'
    }
  },

  watch: {
    dialog(val) {
      val || this.close()
    },
    options: {
      handler() {
        this.getDataFromApi()
      },
      deep: true
    }
  },

  mounted() {
    this.getDataFromApi()
  },

  methods: {
    async getDataFromApi() {
      this.loading = true
      const { page, itemsPerPage: limit } = this.options
      const offset = (page - 1) * limit

      const data = await this.$axios.$get('/api/users', {
        params: { limit, offset }
      })

      data.users = data.users.map((d) => ({
        ...d,
        firstName: startCase(lowerCase(d.firstName)),
        lastName: startCase(lowerCase(d.lastName)),
        fullName: startCase(lowerCase(d.firstName + ' ' + d.lastName))
      }))

      this.employees = data.users
      this.totalEmployees = data.total

      this.loading = false
      return data
    },

    deleteEmployee(item) {
      this.deleteDialog = true
      this.deleteId = item.id
    },

    closeDeleteDialog() {
      this.deleteDialog = false
      this.deleteId = ''
    },

    async confirmDeleteDialog() {
      try {
        await this.$axios.$delete('/api/users/' + this.deleteId)
        this.$nuxt.$emit('snackbar', {
          color: 'success',
          message: 'Successfully deleted!'
        })
      } catch (err) {
        this.$nuxt.$emit('snackbar', {
          color: 'error',
          message: 'Something went wrong!'
        })
      }
      this.getDataFromApi()
      this.deleteDialog = false
      this.deleteId = ''
    },

    viewEmployee(item) {
      this.$router.push(`/employees/${item.id}`)
    },

    editEmployee(item) {
      this.editId = item.id
      this.editedItem = Object.assign({ password: '' }, item)
      this.dialog = true
    },

    close() {
      this.dialog = false
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem)
        this.editId = ''
      })
    },

    async save() {
      if (!this.valid) {
        return
      }

      this.editedItem.firstName = startCase(
        lowerCase(this.editedItem.firstName)
      )
      this.editedItem.lastName = startCase(lowerCase(this.editedItem.lastName))

      if (this.editId) {
        try {
          await this.$axios.$put('/api/users/' + this.editId, {
            user: {
              ...this.editedItem,
              role: 'employee'
            }
          })
          this.$nuxt.$emit('snackbar', {
            color: 'success',
            message: 'Successfully updated!'
          })
        } catch (err) {
          this.$nuxt.$emit('snackbar', {
            color: 'error',
            message: 'Something went wrong!'
          })
        }
      } else {
        try {
          await this.$axios.$post('/api/users/', {
            user: {
              ...this.editedItem,
              role: 'employee'
            }
          })
          this.$nuxt.$emit('snackbar', {
            color: 'success',
            message: 'Successfully updated!'
          })
        } catch (err) {
          this.$nuxt.$emit('snackbar', {
            color: 'error',
            message: 'Something went wrong!'
          })
        }
      }
      this.getDataFromApi()
      this.close()
    }
  }
}
</script>
