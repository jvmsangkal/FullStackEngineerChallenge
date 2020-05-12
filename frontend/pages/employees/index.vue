<template>
  <v-layout column justify-center align-center>
    <v-flex xs12 sm8 md6>
      <v-data-table
        :headers="headers"
        :items="employees"
        :options.sync="options"
        :server-items-length="totalEmployees"
        :loading="loading"
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
                    <v-row>
                      <v-col cols="12" sm="6" md="4">
                        <v-text-field
                          v-model="editedItem.name"
                          label="Dessert name"
                        ></v-text-field>
                      </v-col>
                      <v-col cols="12" sm="6" md="4">
                        <v-text-field
                          v-model="editedItem.calories"
                          label="Calories"
                        ></v-text-field>
                      </v-col>
                      <v-col cols="12" sm="6" md="4">
                        <v-text-field
                          v-model="editedItem.fat"
                          label="Fat (g)"
                        ></v-text-field>
                      </v-col>
                      <v-col cols="12" sm="6" md="4">
                        <v-text-field
                          v-model="editedItem.carbs"
                          label="Carbs (g)"
                        ></v-text-field>
                      </v-col>
                      <v-col cols="12" sm="6" md="4">
                        <v-text-field
                          v-model="editedItem.protein"
                          label="Protein (g)"
                        ></v-text-field>
                      </v-col>
                    </v-row>
                  </v-container>
                </v-card-text>

                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn color="blue darken-1" text @click="close"
                    >Cancel</v-btn
                  >
                  <v-btn color="blue darken-1" text @click="save">Save</v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>
          </v-toolbar>
        </template>
        <template v-slot:item.actions="{ item }">
          <v-icon small @click="viewEmployee(item)">
            mdi-eye
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
    dialog: false,
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
    editedIndex: -1,
    editedItem: {
      name: '',
      calories: 0,
      fat: 0,
      carbs: 0,
      protein: 0
    },
    defaultItem: {
      name: '',
      calories: 0,
      fat: 0,
      carbs: 0,
      protein: 0
    }
  }),

  computed: {
    formTitle() {
      return this.editedIndex === -1 ? 'New Item' : 'Edit Item'
    }
  },

  watch: {
    dialog(val) {
      val || this.close()
    },
    options: {
      handler() {
        this.getDataFromApi().then((data) => {
          this.employees = data.users
          this.totalEmployees = data.total
        })
      },
      deep: true
    }
  },

  mounted() {
    this.getDataFromApi().then((data) => {
      this.employees = data.users
      this.totalEmployees = data.total
    })
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
        fullName: startCase(lowerCase(d.firstName + ' ' + d.lastName))
      }))

      this.loading = false
      return data
    },

    editItem(item) {
      this.editedIndex = this.desserts.indexOf(item)
      this.editedItem = Object.assign({}, item)
      this.dialog = true
    },

    viewEmployee(item) {
      const index = this.desserts.indexOf(item)
      confirm('Are you sure you want to delete this item?') &&
        this.desserts.splice(index, 1)
    },

    close() {
      this.dialog = false
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem)
        this.editedIndex = -1
      })
    },

    save() {
      if (this.editedIndex > -1) {
        Object.assign(this.desserts[this.editedIndex], this.editedItem)
      } else {
        this.desserts.push(this.editedItem)
      }
      this.close()
    }
  }
}
</script>
